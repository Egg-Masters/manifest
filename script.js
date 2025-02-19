// Initialize TON Connect
const tonConnect = new TonConnect();

// DOM Elements
document.addEventListener("DOMContentLoaded", async () => {
    const connectButton = document.getElementById("connect-wallet-btn");
    const disconnectButton = document.getElementById("disconnect-wallet-btn");
    const walletStatus = document.getElementById("wallet-status");
    const buyButton = document.getElementById("buy-tokens-btn");
    const amountInput = document.getElementById("amount-input");
    const balanceDisplay = document.createElement("p"); // Token Balance Display

    let userWallet = null;

    // 🔹 Function to fetch user's $SPIDER token balance
    async function fetchTokenBalance() {
        if (!userWallet) return;
        
        try {
            const response = await fetch(`https://tonapi.io/v2/accounts/${userWallet}/jettons`);
            const data = await response.json();
            
            // Find the $SPIDER token in the user's wallet (replace contract address)
            const spiderToken = data.jettons.find(jetton => jetton.jetton.address === "YOUR_SPIDER_TOKEN_CONTRACT");

            if (spiderToken) {
                const balance = parseFloat(spiderToken.balance) / 1e9; // Convert from nano-tokens
                balanceDisplay.innerText = `Your $SPIDER Balance: ${balance.toFixed(2)}`;
            } else {
                balanceDisplay.innerText = "Your $SPIDER Balance: 0";
            }
        } catch (error) {
            console.error("Failed to fetch token balance:", error);
            balanceDisplay.innerText = "Error fetching balance!";
        }
    }

    // 🔹 Function to connect wallet
    connectButton.addEventListener("click", async () => {
        try {
            const wallet = await tonConnect.connect();
            userWallet = wallet.account.address;
            walletStatus.innerHTML = `✅ Connected: <br> ${userWallet}`;
            walletStatus.style.color = "lightgreen";

            // Update UI
            connectButton.classList.add("hidden");
            disconnectButton.classList.remove("hidden");
            buyButton.disabled = false; // Enable buy button

            // Fetch token balance
            await fetchTokenBalance();
        } catch (error) {
            console.error("Wallet connection failed:", error);
            walletStatus.innerText = "❌ Connection failed!";
            walletStatus.style.color = "red";
        }
    });

    // 🔹 Function to disconnect wallet
    disconnectButton.addEventListener("click", () => {
        tonConnect.disconnect();
        userWallet = null;
        walletStatus.innerText = "🔴 Wallet Disconnected!";
        walletStatus.style.color = "gray";
        
        // Update UI
        disconnectButton.classList.add("hidden");
        connectButton.classList.remove("hidden");
        buyButton.disabled = true; // Disable buy button
        balanceDisplay.innerText = "";
    });

    // 🔹 Function to send TON when "Buy" button is clicked
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
            // Send TON transaction
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 60, // Transaction expires in 60s
                messages: [
                    {
                        address: "UQAVhdnM_-BLbS6W4b1BF5UyGWuIapjXRZjNJjfve7StCqST", // Replace with your TON address
                        amount: (amount * 1e9).toString(), // Convert to nanoTON
                        payload: "Purchase of $SPIDER tokens"
                    }
                ]
            };

            await tonConnect.sendTransaction(transaction);
            alert(`✅ Transaction sent: ${amount} TON`);

            // Fetch updated token balance after transaction
            setTimeout(fetchTokenBalance, 5000); // Delay to allow blockchain update
        } catch (error) {
            console.error("Transaction failed:", error);
            alert("❌ Transaction failed!");
        }
    });

    // Append balance display under wallet status
    walletStatus.parentElement.appendChild(balanceDisplay);
});
