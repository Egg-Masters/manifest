document.addEventListener("DOMContentLoaded", async () => {
  // Initialize TonConnect UI
  const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://markmon08.github.io/gemspider/tonconnect-manifest.json',
    buttonRootId: 'wallet-connection'
  });

  let userWallet = null;

  // Handle wallet connection changes
  tonConnectUI.onStatusChange(wallet => {
    userWallet = wallet;
    updateBalances();
  });

  // Function to update balances
  async function updateBalances() {
    const tonBalance = document.getElementById('ton-balance');
    const spideyBalance = document.getElementById('spidey-balance');

    if (userWallet) {
      tonBalance.textContent = `${(userWallet.balance / 1000000000).toFixed(2)} TON`;
      spideyBalance.textContent = '0 SPIDEY'; // This would be fetched from your token contract
    } else {
      tonBalance.textContent = '0 TON';
      spideyBalance.textContent = '0 SPIDEY';
    }
  }

  // Handle token purchase
  document.getElementById('buy-button').addEventListener('click', async () => {
    if (!userWallet) {
      alert('Please connect your wallet first.');
      return;
    }

    const amount = document.getElementById('ton-amount').value;
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // Transaction valid for 10 minutes
        messages: [
          {
            address: "UQAVhdnM_-BLbS6W4b1BF5UyGWuIapjXRZjNJjfve7StCqST", // Replace with your token contract address
            amount: (amount * 1e9).toString(), // Convert TON to nanotons
            payload: "" // Add payload if needed
          }
        ]
      };

      const result = await tonConnectUI.sendTransaction(transaction);
      console.log("Transaction sent:", result);
      alert("Transaction sent successfully!");
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    }
  });
});
