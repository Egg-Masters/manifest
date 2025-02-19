document.addEventListener("DOMContentLoaded", async () => {
    console.log("📢 DOM Loaded, Initializing TonConnect UI...");

    // Initialize TON Connect UI
    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://markmon08.github.io/Gem-SPIDER/tonconnect-manifest.json',
        buttonRootId: 'ton-connect'
    });

    const walletStatus = document.getElementById("wallet-status");
    const buyButton = document.getElementById("buy-tokens-btn");
    const amountInput = document.getElementById("amount-input");

    let userWallet = null;

    // 🔹 Function to update wallet status
    async function updateWalletStatus() {
        try {
            const connectedWallet = await tonConnectUI.getWallet();
            console.log("✅ Wallet Retrieved:", connectedWallet);

            if (connectedWallet && connectedWallet.account) {
                userWallet = connectedWallet.account.address;
                walletStatus.innerHTML = `🟢 Connected: <br> ${userWallet}`;
                walletStatus.style.color = "lightgreen";
                buyButton.disabled = false;
            } else {
                setDisconnected();
            }
        } catch (error) {
            console.error("⚠️ Error Checking Wallet Status:", error);
            setDisconnected();
        }
    }

    // 🔹 Function to set disconnected state
    function setDisconnected() {
        console.log("❌ No Wallet Connected");
        userWallet = null;
        walletStatus.innerText = "🔴 Not Connected";
        walletStatus.style.color = "red";
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
