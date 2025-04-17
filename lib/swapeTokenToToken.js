require('dotenv').config() ;
const { ethers } = require('ethers');
const getBalance = require('./getBalance');

// Connect to the Ethereum network using a provider
const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);

// Create a wallet instance from a private key
const privateKey = process.env.WALLET_PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);
const signer = wallet.connect(provider);

const ERC20_ABI = require("../abi/ERC20_ABI.json");


async function swapTokenToToken(TOKEN1_CNT_ADDRESS, TOKEN2_CNT_ADDRESS, AMOUNT, router) {

  const TOKEN1_CONTRACT = new ethers.Contract(TOKEN1_CNT_ADDRESS, ERC20_ABI, provider);
  const TOKEN2_CONTRACT = new ethers.Contract(TOKEN2_CNT_ADDRESS, ERC20_ABI, provider);

  const token1_name = await TOKEN1_CONTRACT.name();
  const token2_name = await TOKEN2_CONTRACT.name();
  const token1_decimals = await TOKEN1_CONTRACT.decimals();
  const token2_decimals = await TOKEN2_CONTRACT.decimals();

  const amountIn = ethers.parseUnits(AMOUNT, token1_decimals); 
  const path = [TOKEN1_CNT_ADDRESS, TOKEN2_CNT_ADDRESS];
  const amountOutMin = 0;
  const to = wallet.address;
  const deadline = Math.floor(Date.now() / 1000) + 60 * 1; // 1 minute from now

  // Approve Transection
  const approveTx = await TOKEN1_CONTRACT.connect(signer).approve(router.target, amountIn);
  await approveTx.wait();
  
  console.log("Approval Successed")

  // Step 2: Swap Token1 to Token2
  const currentNonce = await provider.getTransactionCount(signer.address);
  try {
    const swapTx = await router.connect(signer).swapExactTokensForTokens(
      amountIn,
      amountOutMin,
      path,
      to,
      deadline,
      {
        gasLimit: 1000000,
        nonce: currentNonce ,
      }
    );
    console.log('Swap transaction hash:', swapTx.hash);
    await swapTx.wait();
    const receipt = await provider.getTransactionReceipt(swapTx.hash);

    // Filter Transfer events from TOKEN2_CONTRACT (output token)
    const token2Iface = new ethers.Interface(ERC20_ABI);

    let amountReceived = 0n;

    for (const log of receipt.logs) {
      // Only look at logs from the TOKEN2 contract
      if (log.address.toLowerCase() === TOKEN2_CNT_ADDRESS.toLowerCase()) {
        try {
          const parsed = token2Iface.parseLog(log);
          if (
            parsed.name === "Transfer" &&
            parsed.args[1].toLowerCase() === wallet.address.toLowerCase()
          ) {
            amountReceived += parsed.args[2];
          }
        } catch (err) {
          console.log('Error parsing log:', err);
        }
      }
    }
    console.log('Amount In ', ethers.formatUnits(amountIn, token1_decimals), token1_name );
    console.log('Amount Out ', ethers.formatUnits(amountReceived, token2_decimals), token1_name );
    const price = (
      Number(ethers.formatUnits(amountReceived, token2_decimals)) /
      Number(ethers.formatUnits(amountIn, token1_decimals))
    ).toFixed(4);
    console.log();
    console.log(
      `Purchase Price: 1 ${token1_name} ≈ ${price} ${token2_name}`,
    );
    console.log();

    console.log(`You received ${ethers.formatUnits(amountReceived, token2_decimals )} ${token2_name}`);

    // console.log('Swap transaction confirmed in block:', swapTx);
    console.log(`Swaping From ${token1_name} to ${token2_name} completed!`);
    getBalance();
  } catch (error) {
    console.log("Error",error);
  } finally {
    console.log('Transaction completed');
  }
}

module.exports = swapTokenToToken ;