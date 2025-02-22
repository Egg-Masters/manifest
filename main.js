<script src="https://unpkg.com/@tonconnect/ui@latest/dist/tonconnect-ui.min.js"></script>

<script>
  const tonConnectUI = new TonConnectUI.TonConnectUI({
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
      // In a real application, you would fetch the actual balances from the blockchain
      tonBalance.textContent = `${(userWallet.balance / 1000000000).toFixed(2)} TON`;
      spideyBalance.textContent = '0 SPIDEY'; // This would be fetched from your token contract
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
      // In a real application, this would interact with your smart contract
      alert('This is a demo. In a real application, this would initiate a token purchase transaction.');
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    }
  });
</script>
