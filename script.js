// Initialize TON Connect UI
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://markmon08.github.io/Gem-SPIDER/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

// DOM Elements
document.addEventListener("DOMContentLoaded", async () => {
    const walletStatus = document.getElementById("wallet-status");
    const buyButton = document.getElementById("buy-tokens-btn");
    const amountInput = document.getElementById("amount-input");
    const balanceDisplay = document.createElement("p");

    let userWallet = null;

    // 🔹 Function to update wallet status
    async function updateWalletStatus() {
        try {
            const connectedWallet = await tonConnectUI.getWallet();
            if (connectedWallet && connectedWallet.account) {
                userWallet = connectedWallet.account.address;
                walletStatus.innerHTML = `🟢 Connected: <br> ${userWallet}`;
                walletStatus.style.color = "lightgreen";
                buyButton.disabled = false;
                await fetchTokenBalance();
            } else {
                setDisconnected();
            }
        } catch (error) {
            console.error("Error checking wallet status:", error);
            setDisconnected();
        }
    }

    // 🔹 Function to set disconnected state
    function setDisconnected() {
        userWallet = null;
        walletStatus.innerText = "🔴 Not Connected";
        walletStatus.style.color = "red";
        buyButton.disabled = true;
        balanceDisplay.innerText = "";
    }

    // 🔹 Fetch user's $SPIDER token balance
    async function fetchTokenBalance() {
        if (!userWallet) return;

        try {
            const response = await fetch(`https://tonapi.io/v2/accounts/${userWallet}/jettons`);
            const data = await response.json();

            const spiderToken = data.jettons.find(jetton => jetton.jetton.address === "YOUR_SPIDER_TOKEN_CONTRACT");

            balanceDisplay.innerText = spiderToken
                ? `Your $SPIDER Balance: ${(parseFloat(spiderToken.balance) / 1e9).toFixed(2)}`
                : "Your $SPIDER Balance: 0";
        } catch (error) {
            console.error("Failed to fetch token balance:", error);
            balanceDisplay.innerText = "Error fetching balance!";
        }
    }

    // 🔹 Listen for Wallet Connection Status Changes
    tonConnectUI.onStatusChange(async (wallet) => {
        console.log("Wallet Status Changed:", wallet);
        await updateWalletStatus();
    });

    // 🔹 Send TON when "Buy" button is clicked
    buyButton.addEventListener("click", async () => {
        if (!userWallet) {
            alert("Please connect your wallet first!");
            return;
        }

        const amount = parseFloat(amountInput.value);
        if (isNaN(amount) || amount <= 0) {
            alert("Enter a valid TON amount.");
            return;
        }

        try {
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [
                    {
                        address: "UQAVhdnM_-BLbS6W4b1BF5UyGWuIapjXRZjNJjfve7StCqST", // Replace with actual TON receiving address
                        amount: (amount * 1e9).toString(),
                        payload: "Purchase of $SPIDER tokens"
                    }
                ]
            };

            await tonConnectUI.sendTransaction(transaction);
            alert(`✅ Transaction sent: ${amount} TON`);

            setTimeout(fetchTokenBalance, 5000);
        } catch (error) {
            console.error("Transaction failed:", error);
            alert("❌ Transaction failed!");
        }
    });

    // Append balance display under wallet status
    walletStatus.parentElement.appendChild(balanceDisplay);

    // Initial status check when the page loads
    await updateWalletStatus();
});
