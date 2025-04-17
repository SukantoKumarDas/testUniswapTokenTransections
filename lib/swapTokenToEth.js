const { ethers } = require('ethers');
const { getBalance } = require('./getBalance') ;
require('dotenv').config() ;

const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);

const privateKey = process.env.privateKey;// Create a wallet instance from a private key
const wallet = new ethers.Wallet(privateKey, provider);
const signer = wallet.connect(provider);

const ERC20_ABI = require("../abi/ERC20_ABI.json");

async function swapTokenToEth(INPUT_TOKEN_ADDRESS, AMOUNT, router){
    
    console.log("swapeTokenToEth is calling");
    const INPUT_TOKEN_CONTRACT = new ethers.Contract(INPUT_TOKEN_ADDRESS, ERC20_ABI, provider);
    const DECIMALS = 18;

    const amountIn = ethers.parseUnits(AMOUNT, DECIMALS);
    const amountOutMin = 0; 
    const pathToSwap = [INPUT_TOKEN_ADDRESS, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2']; 
    const to = wallet.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 1; // 1 minute from now
    
    try {
      // Step 1: Approve spending X tokens by the Y Router contract
      const approvalTx = await INPUT_TOKEN_CONTRACT.connect(signer).approve(
        router.target,
        amountIn
      );
      await approvalTx.wait();
      console.log('Approval successful!');
  
      // Step 2: Swap INPUT TOKEN for ETH tokens
      const swapTx = await router.swapExactTokensForETH(
        amountIn,
        amountOutMin,
        pathToSwap,
        to,
        deadline,
        { gasLimit: 30000000 }
      );

      console.log('Swap transaction hash:', swapTx.hash);
      await swapTx.wait();
      console.log('Swap completed!');
      await getBalance();

    } catch (error) {
      console.log(error);
    }
}

module.exports = {swapTokenToEth} ;