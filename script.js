document.addEventListener("DOMContentLoaded", async () => {
    console.log("📢 DOM Loaded, Initializing TonConnect & TonWeb...");

    // Initialize TonConnect
    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://markmon08.github.io/Gem-SPIDER/tonconnect-manifest.json',
        buttonRootId: 'ton-connect'
    });

    // Initialize TonWeb
    const tonweb = new TonWeb();

    const buyButton = document.getElementById("buy-tokens-btn");
    const amountInput = document.getElementById("amount-input");
    const tonBalanceElem = document.getElementById("ton-balance");
    const spideyBalanceElem = document.getElementById("spidey-balance");

    let userWallet = null;
    const recipientAddress = "UQAVhdnM_-BLbS6W4b1BF5UyGWuIapjXRZjNJjfve7StCqST"; // Replace with your recipient wallet

    function formatBalance(balance) {
        return (balance / 1e9).toFixed(6).replace(/\.0+$/, "");
    }

    async function fetchBalances(walletAddress) {
        try {
            if (!walletAddress) {
                console.warn("⚠️ Wallet address is undefined, skipping balance fetch.");
                return;
            }

            // Fetch TON balance
            const tonResponse = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}`);
            if (!tonResponse.ok) throw new Error("Failed to fetch TON balance");
            const tonData = await tonResponse.json();
            const tonBalance = tonData.balance ? formatBalance(tonData.balance) : "0";
            tonBalanceElem.textContent = tonBalance;

            // Fetch $SPIDEY Token Balance using TonWeb (Jetton)
            const spideyTokenAddress = "EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Replace with actual contract address
            const jettonWallet = new tonweb.token.jetton.JettonWallet(tonweb.provider, {
                address: spideyTokenAddress
            });
            const jettonBalance = await jettonWallet.methods.getBalance().call();
            spideyBalanceElem.textContent = jettonBalance ? formatBalance(jettonBalance) : "0";

            console.log("💰 Balances Updated:", { tonBalance, jettonBalance });
        } catch (error) {
            console.error("⚠️ Error Fetching Balances:", error.message);
            tonBalanceElem.textContent = "Error";
            spideyBalanceElem.textContent = "Error";
        }
    }

    async function sendTransaction() {
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

            console.log("🚀 Sending Transaction:", transaction);
            await tonConnectUI.sendTransaction(transaction);
            console.log("✅ Transaction Sent");
            alert("Transaction sent successfully!");

            // Refresh balances after transaction
            if (userWallet) {
                await fetchBalances(userWallet);
            }
        } catch (error) {
            console.error("⚠️ Transaction Failed:", error);
            alert("Transaction failed: " + error.message);
        }
    }

    async function updateWalletStatus() {
        try {
            const connectedWallet = await tonConnectUI.getWallet();
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

    function setDisconnected() {
        console.log("❌ No Wallet Connected");
        userWallet = null;
        buyButton.disabled = true;
        tonBalanceElem.textContent = "0";
        spideyBalanceElem.textContent = "0";
    }

    // Automatically update wallet status when the connection changes
    tonConnectUI.onStatusChange(async (wallet) => {
        console.log("🔄 Wallet Status Changed:", wallet);
        await updateWalletStatus();
    });

    // Initial wallet status check
    setTimeout(async () => {
        console.log("🔄 Checking Initial Wallet Status...");
        await updateWalletStatus();
    }, 1000);

    // Refresh balances when buy button is clicked
    buyButton.addEventListener("click", async () => {
        await sendTransaction();
        if (userWallet) {
            await fetchBalances(userWallet);
        }
    });
});
