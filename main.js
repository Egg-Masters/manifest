document.addEventListener("DOMContentLoaded", async () => {
  // Initialize TonConnect UI
  const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://markmon08.github.io/gemspider/tonconnect-manifest.json',
    buttonRootId: 'wallet-connection'
  });

  let userWallet = null;
  const contractAddress = "EQBUMjg7ROfjh_ou3Lz1lpNrTJN59h2S-Wm-ZPsWWVzn-xc9"; // Your token contract address

  // Handle wallet connection changes
  tonConnectUI.onStatusChange(wallet => {
    console.log("Wallet Connected:", wallet);
    if (wallet && wallet.account && wallet.account.address) {
      userWallet = wallet.account.address;
      console.log("Wallet Address:", userWallet);
      updateBalances();
    } else {
      console.error("Wallet connection failed or address is missing.");
    }
  });

  // Function to update balances
  async function updateBalances() {
    const tonBalance = document.getElementById('ton-balance');
    const spideyBalance = document.getElementById('spidey-balance');

    if (userWallet) {
      try {
        // Fetch TON balance
        const tonResponse = await fetch(`https://tonapi.io/v2/accounts/${userWallet}`);
        const tonData = await tonResponse.json();
        const balance = (tonData.balance / 1e9).toFixed(2);
        tonBalance.textContent = `${balance} TON`;

        // Fetch $SPIDEY token balance
        const jettonResponse = await fetch(`https://tonapi.io/v2/accounts/${userWallet}/jettons`);
        const jettonData = await jettonResponse.json();
        
        console.log("Jetton Data:", jettonData); // Debugging

        const jetton = jettonData.balances.find(j => j.jetton.address === contractAddress);
        spideyBalance.textContent = jetton ? `${(jetton.balance / 1e9).toFixed(2)} SPIDEY` : "0 SPIDEY";
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    } else {
      tonBalance.textContent = "0 TON";
      spideyBalance.textContent = "0 SPIDEY";
    }
  }

  // Handle token purchase
  document.getElementById('buy-button').addEventListener('click', async () => {
    if (!userWallet) {
      alert("Please connect your wallet first.");
      return;
    }

    const amount = document.getElementById('ton-amount').value;
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600, // Transaction valid for 10 minutes
        messages: [
          {
            address: contractAddress,
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
