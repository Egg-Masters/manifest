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

  // Function to fetch and update balances
  async function updateBalances() {
    const tonBalanceEl = document.getElementById('ton-balance');
    const spideyBalanceEl = document.getElementById('spidey-balance');

    if (!userWallet) {
      tonBalanceEl.textContent = '0 TON';
      spideyBalanceEl.textContent = '0 SPIDEY';
      return;
    }

    try {
      // Fetch TON balance
      const tonBalance = await fetchTonBalance(userWallet.address);
      tonBalanceEl.textContent = `${tonBalance} TON`;

      // Fetch SPIDEY token balance
      const spideyBalance = await fetchTokenBalance(userWallet.address);
      spideyBalanceEl.textContent = `${spideyBalance} SPIDEY`;
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    }
  }

  // Function to fetch TON balance from API
  async function fetchTonBalance(address) {
    try {
      const response = await fetch(`https://tonapi.io/v2/accounts/${address}`);
      const data = await response.json();
      
      if (data && data.balance) {
        return (parseInt(data.balance) / 1e9).toFixed(3); // Convert from nanotons to TON (3 decimal places)
      } 
      
      return "0.000";
    } catch (error) {
      console.error("Error fetching TON balance:", error);
      return "0.000";
    }
  }

  // Function to fetch SPIDEY token balance from contract
  async function fetchTokenBalance(address) {
    const contractAddress = "EQBUMjg7ROfjh_ou3Lz1lpNrTJN59h2S-Wm-ZPsWWVzn-xc9"; // Your correct SPIDEY token contract
    try {
      const response = await fetch(`https://tonapi.io/v2/accounts/${address}/tokens/${contractAddress}`);
      const data = await response.json();
      
      if (data && data.balance) {
        return data.balance.toString(); // Return token balance as a string
      }
      
      return "0";
    } catch (error) {
      console.error("Error fetching SPIDEY balance:", error);
      return "0";
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
            address: "UQAVhdnM_-BLbS6W4b1BF5UyGWuIapjXRZjNJjfve7StCqST", // Correct SPIDEY token contract address
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
