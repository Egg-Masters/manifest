document.addEventListener("DOMContentLoaded", async () => {
    const contractAddress = "EQBUMjg7ROfjh_ou3Lz1lpNrTJN59h2S-Wm-ZPsWWVzn-xc9"; // Jetton contract addres.
    const receiverAddress = "UQAVhdnM_-BLbS6W4b1BF5UyGWuIapjXRZjNJjfve7StCqST";
      
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
            try {
                // Fetch TON balance
                const tonResponse = await fetch(`https://tonapi.io/v2/accounts/${userWallet.address}`);
                const tonData = await tonResponse.json();
                tonBalance.textContent = `${(tonData.balance / 1e9).toFixed(2)} TON`;

                // Fetch Jetton balance
                const spideyResponse = await fetch(`https://tonapi.io/v2/accounts/${userWallet.address}/jettons`);
                const spideyData = await spideyResponse.json();

                console.log("SPIDEY API Response:", spideyData);

                // Find the correct token using contract address
                const spideyToken = spideyData.balances.find(jetton => jetton.jetton.address === contractAddress);

                if (spideyToken) {
                    // Show the real balance but rename it as SPIDEY
                    spideyBalance.textContent = `${(spideyToken.balance / 1e9).toFixed(2)} SPIDEY`;
                } else {
                    spideyBalance.textContent = "0 SPIDEY";
                }
            } catch (error) {
                console.error("Error fetching balances:", error);
                tonBalance.textContent = "Error";
                spideyBalance.textContent = "Error";
            }
        } else {
            tonBalance.textContent = "0 TON";
            spideyBalance.textContent = "0 SPIDEY";
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
                        address: receiverAddress, // Correct contract address for receiving payment
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
