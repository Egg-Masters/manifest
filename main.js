document.addEventListener("DOMContentLoaded", async () => {
    const contractAddress = "EQBUMjg7ROfjh_ou3Lz1lpNrTJN59h2S-Wm-ZPsWWVzn-xc9"; // Jetton contract address
    const receiverAddress = "UQAVhdnM_-BLbS6W4b1BF5UyGWuIapjXRZjNJjfve7StCqST"; // Receiver address
      
    // Initialize TonConnect UI
    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: 'https://markmon08.github.io/gemspider/tonconnect-manifest.json',
        buttonRootId: 'wallet-connection'
    });

    let userWallet = null;

    // Handle wallet connection changes
    tonConnectUI.onStatusChange(wallet => {
        console.log("Wallet Connected:", wallet);
        if (wallet && wallet.address) {
            userWallet = wallet;
            updateBalances();
        } else {
            console.error("Wallet connection failed or address not found.");
        }
    });

    // Function to update balances
    async function updateBalances() {
        const tonBalance = document.getElementById('ton-balance');
        const spideyBalance = document.getElementById('spidey-balance');

        if (!userWallet || !userWallet.address) {
            console.error("No user wallet detected.");
            tonBalance.textContent = "0.00 TON";
            spideyBalance.textContent = "0 SPIDEY";
            return;
        }

        try {
            console.log("Fetching balances for:", userWallet.address);

            // Fetch TON balance
            const tonResponse = await fetch(`https://tonapi.io/v2/accounts/${userWallet.address}`);
            if (!tonResponse.ok) throw new Error(`TON API Error: ${tonResponse.status}`);
            const tonData = await tonResponse.json();
            console.log("TON API Response:", tonData);

            tonBalance.textContent = tonData.balance 
                ? `${(tonData.balance / 1e9).toFixed(2)} TON`
                : "0.00 TON";

        } catch (error) {
            console.error("Error fetching TON balance:", error);
            tonBalance.textContent = "0.00 TON"; // Set to 0.00 on error
        }

        try {
            // Fetch Jetton balance (SPIDEY)
            const spideyResponse = await fetch(`https://tonapi.io/v2/accounts/${userWallet.address}/jettons/${contractAddress}`);
            if (!spideyResponse.ok) throw new Error(`SPIDEY API Error: ${spideyResponse.status}`);
            const spideyData = await spideyResponse.json();
            console.log("SPIDEY API Response:", spideyData);

            // Extract balance and convert from nanotokens
            const spideyBalanceAmount = spideyData.balance
                ? (parseFloat(spideyData.balance) / 1e9).toFixed(2)
                : "0";

            spideyBalance.textContent = `${spideyBalanceAmount} SPIDEY`;

        } catch (error) {
            console.error("Error fetching SPIDEY balance:", error);
            spideyBalance.textContent = "0 SPIDEY"; // Set to 0 on error
        }
    }
});
