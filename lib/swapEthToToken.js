require('dotenv').config();
const { ethers } = require('ethers');
const  getBalance = require('./getBalance');

const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL); // Connect to the Ethereum network using a provider

const privateKey = process.env.WALLET_PRIVATE_KEY; // Create a wallet instance from a private key
const wallet = new ethers.Wallet(privateKey, provider);
const signer = wallet.connect(provider);

const ERC20_ABI = require('../abi/ERC20_ABI.json');

// input token address that you want to buy
// Amount of ETH you want to swap
// router 
async function swapEthToToken(OUTPUT_TOKEN_CONTRACT_ADDRESS, AMOUNT, router){

    console.log("swapeEthToToken is calling")
    
    const amountOutMin = 0;
    const path = [process.env.WETH_TOKEN_ADDRESS, OUTPUT_TOKEN_CONTRACT_ADDRESS ]; // token 1 to WETH token path
    const to = process.env.WALLET_ADDRESS; // recipient address
    const deadline = Math.floor(Date.now() / 1000) + 60 * 1; // 1 minute from now
    

    const OUTPUT_TOKEN_CONTRACT = new ethers.Contract(OUTPUT_TOKEN_CONTRACT_ADDRESS, ERC20_ABI, provider);
    const Output_Token_Name = await OUTPUT_TOKEN_CONTRACT.name();

    try {
        const value = ethers.parseEther(AMOUNT);
        const tx = await router.swapExactETHForTokens(
          amountOutMin,
          path,
          to,
          deadline,
          { value, gasLimit: 30000000 }
        );
        console.log('Transaction hash:', tx.hash);
        await tx.wait();
        console.log(`Swaping from WETH to ${Output_Token_Name} completed!`);
        getBalance();
      } catch (error) {
        console.log(error);
      }
}

module.exports = swapEthToToken;