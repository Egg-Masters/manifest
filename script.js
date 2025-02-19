document.addEventListener("DOMContentLoaded", async () => {
    console.log("📢 DOM Loaded, Initializing TonWeb...");

    const tonweb = new TonWeb(); // Initialize TonWeb instance
    const buyButton = document.getElementById("buy-tokens-btn");
    const amountInput = document.getElementById("amount-input");
    const tonBalanceElem = document.getElementById("ton-balance");
    const spideyBalanceElem = document.getElementById("spidey-balance");

    let userWallet = null;
    const recipientAddress = "UQAVhdnM_-BLbS6W4b1BF5UyGWuIapjXRZjNJjfve7StCqST"; // Replace with your recipient wallet

    function formatBalance(balance) {
        return (balance / 1e9).toFixed(6).replace(/\.0+$/, ""); // Format TON balance
    }

    async function fetchBalances(walletAddress) {
        try {
            // Fetch TON balance
            const balance = await tonweb.getBalance(walletAddress);
            tonBalanceElem.textContent = balance ? formatBalance(balance) : "0";

            // Fetch $SPIDEY Token Balance (Jetton)
            const spideyTokenAddress = "EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Replace with actual contract address
            const tokenBalance = await tonweb.call(spideyTokenAddress, 'get_balance', []);
            spideyBalanceElem.textContent = tokenBalance ? formatBalance(tokenBalance) : "0";

            console.log("💰 Balances Updated:", { balance, tokenBalance });
        } catch (error) {
            console.error("⚠️ Error Fetching Balances:", error.message);
            tonBalanceElem.textContent = "Error";
            spideyBalanceElem.textContent = "Error";
        }
    }

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
            const tx = await tonweb.sendTransaction({
                from: userWallet,
                to: recipientAddress,
                value: TonWeb.utils.toNano(amount),
            });

            console.log("✅ Transaction Sent:", tx);
            alert("Transaction sent successfully!");
        } catch (error) {
            console.error("⚠️ Transaction Failed:", error);
            alert("Transaction failed: " + error.message);
        }
    }

    buyButton.addEventListener("click", sendTransaction);

    console.log("🔄 Ready for Wallet Connection!");
});
