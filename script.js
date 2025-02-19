document.addEventListener("DOMContentLoaded", async () => {
    console.log("📢 DOM Loaded, Initializing TonConnect UI...");

    // Initialize TON Connect UI
    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://markmon08.github.io/Gem-SPIDER/tonconnect-manifest.json',
        buttonRootId: 'ton-connect'
    });

    const buyButton = document.getElementById("buy-tokens-btn");
    const tonBalanceElem = document.getElementById("ton-balance");
    const spideyBalanceElem = document.getElementById("spidey-balance");

    let userWallet = null;

    // 🔹 Fetch TON and $SPIDEY Balances
    async function fetchBalances(walletAddress) {
        try {
            // Fetch TON Balance
            const tonResponse = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}`);
            const tonData = await tonResponse.json();
            const tonBalance = tonData.balance ? (tonData.balance / 1e9).toFixed(2) : "0";
            tonBalanceElem.textContent = tonBalance;

            // Fetch $SPIDEY Token Balance
            const spideyTokenAddress = "EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Replace with actual contract address
            const tokenResponse = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}/jettons`);
            const tokenData = await tokenResponse.json();
            const spideyBalance = tokenData.balances.find(token => token.jetton.address === spideyTokenAddress);
            spideyBalanceElem.textContent = spideyBalance ? (spideyBalance.balance / 1e9).toFixed(2) : "0";

            console.log("💰 Balances Updated:", { tonBalance, spideyBalance: spideyBalanceElem.textContent });
        } catch (error) {
            console.error("⚠️ Error Fetching Balances:", error);
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

    // 🔹 Listen for Wallet Connection Status Changes
    tonConnectUI.onStatusChange(async (wallet) => {
        console.log("🔄 Wallet Status Changed:", wallet);
        await updateWalletStatus();
    });

    // 🔹 Initialize UI after 1 second delay (fix potential race conditions)
    setTimeout(async () => {
        console.log("🔄 Checking Initial Wallet Status...");
        await updateWalletStatus();
    }, 1000);
});
