document.addEventListener("DOMContentLoaded", async () => {
    console.log("📢 DOM Loaded, Initializing TonConnect UI...");

    // Initialize TON Connect UI
    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://markmon08.github.io/Gem-SPIDER/tonconnect-manifest.json',
        buttonRootId: 'ton-connect'
    });

    const buyButton = document.getElementById("buy-tokens-btn");
    const amountInput = document.getElementById("amount-input");
    const tonBalanceElem = document.getElementById("ton-balance");
    const spideyBalanceElem = document.getElementById("spidey-balance");

    let userWallet = null;
    const recipientAddress = "UQAVhdnM_-BLbS6W4b1BF5UyGWuIapjXRZjNJjfve7StCqST"; // Replace with your recipient wallet

    // 🔹 Format balance to 6 decimal places
    function formatBalance(balance) {
        return (balance / 1e9).toFixed(6).replace(/\.?0+$/, ""); // Trim trailing zeroes
    }

    // 🔹 Fetch TON and $SPIDEY Balances
    async function fetchBalances(walletAddress) {
        try {
            // Fetch TON Balance from TonCenter
            const tonResponse = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${walletAddress}`);
            if (!tonResponse.ok) throw new Error("Failed to fetch TON balance");
            const tonData = await tonResponse.json();
            const tonBalance = tonData.balance ? formatBalance(tonData.balance) : "0";
            tonBalanceElem.textContent = tonBalance;

            // Fetch $SPIDEY Token Balance (Suggest using a dedicated Jetton API)
            const spideyTokenAddress = "EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Replace with actual contract address
            const tokenResponse = await fetch(`https://tonapi.io/v1/account/${walletAddress}/jettons`);
            if (!tokenResponse.ok) throw new Error("Failed to fetch token balance");
            const tokenData = await tokenResponse.json();
            const spideyBalance = tokenData.balances?.find(token => token.jetton.address === spideyTokenAddress);
            spideyBalanceElem.textContent = spideyBalance ? formatBalance(spideyBalance.balance) : "0";

            console.log("💰 Balances Updated:", { tonBalance, spideyBalance: spideyBalanceElem.textContent });
        } catch (error) {
            console.error("⚠️ Error Fetching Balances:", error.message);
            tonBalanceElem.textContent = "Error";
            spideyBalanceElem.textContent = "Error";
        }
    }

    // 🔹 Update UI on Wallet Connect
    async function updateWalletStatus() {
        try {
            const connectedWallet = await tonConnectUI.getWallet();
            console.log("✅ Wallet Retrieved:", connectedWallet);

            if (connectedWallet && connectedWallet.account) {
                userWallet = connectedWallet.account.address;
                buyButton.disabled = false;
                await fetchBalances(userWallet);
            } else {
                setDisconnected();
            }
        } catch (error) {
            console.error("⚠️ Error Checking Wallet Status:", error);
            setDisconnected();
        }
    }

    // 🔹 Handle Disconnected State
    function setDisconnected() {
        console.log("❌ No Wallet Connected");
        userWallet = null;
        tonBalanceElem.textContent = "0";
        spideyBalanceElem.textContent = "0";
        buyButton.disabled = true;
    }

    // 🔹 Send TON Transaction
    async function sendTransaction() {
        if (!userWallet) {
            alert("Please connect your wallet first.");
            return;
        }

        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert("Please enter a valid TON amount.");
            return;
        }

        try {
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 300, // Expires in 5 minutes
                messages: [
                    {
                        address: recipientAddress,
                        amount: (amount * 1e9).toString(), // Convert TON to nanotons
                    }
                ]
            };

            const result = await tonConnectUI.sendTransaction(transaction);
            console.log("✅ Transaction Sent:", result);
            alert("Transaction sent successfully!");
        } catch (error) {
            console.error("⚠️ Transaction Failed:", error);
            alert("Transaction failed: " + error.message);
        }
    }

    // 🔹 Listen for Wallet Connection Status Changes
    tonConnectUI.onStatusChange(async (wallet) => {
        console.log("🔄 Wallet Status Changed:", wallet);
        await updateWalletStatus();

        // ✅ Auto-update balances on wallet change
        if (wallet && wallet.account) {
            await fetchBalances(wallet.account.address);
        }
    });

    // 🔹 Initialize UI after 1 second delay (fix potential race conditions)
    setTimeout(async () => {
        console.log("🔄 Checking Initial Wallet Status...");
        await updateWalletStatus();
    }, 1000);

    // Attach transaction function to buy button
    buyButton.addEventListener("click", sendTransaction);
});
