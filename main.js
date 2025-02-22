ldocument.addEventListener("DOMContentLoaded", () => {
  const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://markmon08.github.io/gemspider/tonconnect-manifest.json',
    buttonRootId: 'wallet-connection'
  });

  let userWallet = null;

  tonConnectUI.onStatusChange(wallet => {
    userWallet = wallet;
    updateBalances();
  });

  async function updateBalances() {
    const tonBalance = document.getElementById('ton-balance');
    const spideyBalance = document.getElementById('spidey-balance');

    if (userWallet) {
      tonBalance.textContent = `${(userWallet.balance / 1000000000).toFixed(2)} TON`;
      spideyBalance.textContent = '0 SPIDEY';
    } else {
      tonBalance.textContent = '0 TON';
      spideyBalance.textContent = '0 SPIDEY';
    }
  }

  document.getElementById('buy-button').addEventListener('click', async () => {
    if (!userWallet) {
      alert('Please connect your wallet first');
      return;
    }

    const amount = document.getElementById('ton-amount').value;
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      try {
  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 600, // Valid for 10 minutes
    messages: [
      {
        address: "UQAVhdnM_-BLbS6W4b1BF5UyGWuIapjXRZjNJjfve7StCqST",
        amount: (amount * 1e9).toString(), // Convert TON to nanotons
        payload: "" // If needed, add payload data here
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

    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    }
  });
});
