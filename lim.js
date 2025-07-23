require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const readline = require('readline');
const UserAgent = require('user-agents');

const colors = {
    reset: "\x1b[0m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    white: "\x1b[37m",
    bold: "\x1b[1m",
    magenta: "\x1b[35m",
    blue: "\x1b[34m",
    gray: "\x1b[90m",
};

const logger = {
    info: (msg) => console.log(`${colors.cyan}[i] ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}[!] ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}[x] ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}[+] ${msg}${colors.reset}`),
    loading: (msg) => console.log(`${colors.magenta}[*] ${msg}${colors.reset}`),
    step: (msg) => console.log(`${colors.blue}[>] ${colors.bold}${msg}${colors.reset}`),
    critical: (msg) => console.log(`${colors.red}${colors.bold}[FATAL] ${msg}${colors.reset}`),
    summary: (msg) => console.log(`${colors.green}${colors.bold}[SUMMARY] ${msg}${colors.reset}`),
    banner: () => {
        const border = `${colors.blue}${colors.bold}╔═════════════════════════════════════════╗${colors.reset}`;
        const title = `${colors.blue}${colors.bold}║   � 19Seniman From Insider   🍉   ║${colors.reset}`;
        const bottomBorder = `${colors.blue}${colors.bold}╚═════════════════════════════════════════╝${colors.reset}`;
        
        console.log(`\n${border}`);
        console.log(`${title}`);
        console.log(`${bottomBorder}\n`);
    },
    section: (msg) => {
        const line = '─'.repeat(40);
        console.log(`\n${colors.gray}${line}${colors.reset}`);
        if (msg) console.log(`${colors.white}${colors.bold} ${msg} ${colors.reset}`);
        console.log(`${colors.gray}${line}${colors.reset}\n`);
    },
};

const RPC_URL = 'https://sepolia.drpc.org/';
const API_BASE_URL = 'https://api.deperp.xyz/api/v1';

const provider = new ethers.JsonRpcProvider(RPC_URL);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise(resolve => rl.question(`${colors.cyan}[?] ${query}${colors.reset}`, resolve));
};

const getWallets = () => {
    const privateKeys = Object.keys(process.env)
        .filter(key => key.startsWith('PRIVATE_KEY_'))
        .map(key => process.env[key]);

    if (privateKeys.length === 0) {
        logger.error('No PRIVATE_KEY found in the .env file.');
        process.exit(1);
    }

    return privateKeys.map(pk => new ethers.Wallet(pk, provider));
};

const getRandomUserAgent = () => {
    const userAgent = new UserAgent();
    return userAgent.toString();
};

const getNonce = async (walletAddress) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/auth/nonce/${walletAddress}`, {
            headers: { 'User-Agent': getRandomUserAgent(), 'Referer': 'https://testnet.novastro.xyz/' }
        });
        return response.data.data;
    } catch (error) {
        logger.error(`Failed to get nonce for ${walletAddress}: ${error.message}`);
        return null;
    }
};

const login = async (wallet, silent = false) => {
    if (!silent) logger.loading(`Attempting to log in with wallet: ${wallet.address}`);
    const nonceData = await getNonce(wallet.address);
    if (!nonceData) {
        if (!silent) logger.error(`Could not retrieve nonce for ${wallet.address}. Login aborted.`);
        return null;
    }

    try {
        const signature = await wallet.signMessage(nonceData.message);

        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            walletAddress: wallet.address,
            signature: signature,
            message: nonceData.message
        }, {
            headers: { 'User-Agent': getRandomUserAgent(), 'Referer': 'https://testnet.novastro.xyz/' }
        });
        if (!silent) logger.success(`Successfully logged in with wallet: ${wallet.address}`);
        return response.data.data.accessToken;
    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        if (!silent) logger.error(`Login failed for ${wallet.address}: ${errorMessage}`);
        return null;
    }
};


const claimFaucetOnChain = async (wallet, claimIndex, totalClaims) => {
    logger.loading(`[${claimIndex}/${totalClaims}] Preparing on-chain faucet claim for wallet ${wallet.address}...`);

    const faucetContractAddress = '0x57c5dc670eb6f571bdd8fc1cf178c46c9a917a74';
    const transactionData = '0x4e71d92d';

    try {
        logger.info(`Sending claim transaction to contract: ${faucetContractAddress}`);
        const tx = await wallet.sendTransaction({
            to: faucetContractAddress,
            data: transactionData,
            value: '0x0'
        });

        logger.loading(`Waiting for transaction confirmation: ${tx.hash}`);
        await tx.wait();
        logger.success(`[${claimIndex}/${totalClaims}] Faucet claim transaction confirmed! Hash: ${tx.hash}`);
        return true;

    } catch (error) {
        const errorMessage = error.reason || error.message;
        logger.error(`[${claimIndex}/${totalClaims}] On-chain faucet claim failed for ${wallet.address}: ${errorMessage}`);
        return false;
    }
};

const getProperties = async (accessToken) => {
    try {
        logger.loading('Fetching properties list...');
        const response = await axios.get(`${API_BASE_URL}/properties?page=1&limit=50`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': getRandomUserAgent(),
                'Referer': 'https://testnet.novastro.xyz/'
            }
        });
        logger.success('Properties list fetched successfully.');
        return response.data.data.properties;
    } catch (error) {
        logger.error(`Failed to get properties list: ${error.message}`);
        return [];
    }
};

const buyProperties = async (wallet, accessToken, numToBuy) => {
    logger.section(`Starting automatic purchase of ${numToBuy} properties for wallet ${wallet.address}`);
    let boughtCount = 0;
    const allProperties = await getProperties(accessToken);

    if (!allProperties || allProperties.length === 0) {
        logger.warn('No properties available for purchase.');
        return;
    }

    // Shuffle properties to attempt buying different ones each run
    const shuffledProperties = allProperties.sort(() => 0.5 - Math.random());

    for (const property of shuffledProperties) {
        if (boughtCount >= numToBuy) {
            break;
        }

        logger.info(`[${boughtCount + 1}/${numToBuy}] Attempting to buy property: ${colors.yellow}${property.title}${colors.reset}`);
        
        let amount = "100.00";
        if (property.token && property.token.minimumInvestment) {
            amount = property.token.minimumInvestment.toString();
        }

        logger.loading(`Preparing purchase for ${amount} USD for property ID: ${property.id}`);

        try {
            // Step 1: Prepare the purchase with the API
            const prepareResponse = await axios.post(`${API_BASE_URL}/properties/${property.id}/purchase/prepare`, {
                purchaseAmount: amount
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': getRandomUserAgent(),
                    'Referer': 'https://testnet.novastro.xyz/'
                }
            });

            const { transactionEventId, payload } = prepareResponse.data.data;
            let finalTxHash = '';

            // Step 2: Send on-chain transactions based on the payload
            for (const p of payload) {
                logger.info(`Sending on-chain transaction type: ${p.type} for property ${property.title}...`);
                const tx = await wallet.sendTransaction({
                    to: p.to,
                    data: p.data,
                    value: p.value || "0"
                });
                logger.loading(`Waiting for transaction confirmation: ${tx.hash}`);
                await tx.wait();
                logger.success(`Transaction for ${p.type} confirmed! Hash: ${tx.hash}`);
                finalTxHash = tx.hash;
            }

            // Step 3: Submit the transaction hash back to the API
            logger.loading('Submitting transaction hash to the API...');
            const submitResponse = await axios.post(`${API_BASE_URL}/properties/${property.id}/purchase/submit`, {
                transactionEventId,
                transactionHash: finalTxHash
            }, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': getRandomUserAgent(),
                    'Referer': 'https://testnet.novastro.xyz/'
                }
            });
            
            if (submitResponse.data.success) {
                logger.success(`Successfully purchased: ${property.title}`);
                boughtCount++;
            } else {
                // If API returns success: false, throw an error with the response data
                throw new Error(JSON.stringify(submitResponse.data));
            }

        } catch (error) {
            const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
            logger.warn(`Failed to purchase ${property.title}: ${errorMessage}`);
            logger.info('Trying next property...');
        }
    }
    
    if (boughtCount < numToBuy) {
        logger.error(`Could only purchase ${boughtCount} out of ${numToBuy} requested properties for wallet ${wallet.address}.`);
    } else {
        logger.success(`Daily purchase goal of ${numToBuy} properties met for wallet ${wallet.address}.`);
    }
    logger.section(`Finished property purchase for wallet ${wallet.address}`);
};

let numClaims = 0;
let numToBuy = 0;
let countdownInterval;

const runTasks = async (wallets) => {
    logger.section(`Starting Daily Tasks at ${new Date().toLocaleString()}`);
    for (const [index, wallet] of wallets.entries()) {
        logger.step(`--- Processing Wallet ${index + 1}/${wallets.length}: ${wallet.address} ---`);

        if (numClaims > 0) {
            logger.section(`Starting faucet claims for wallet ${wallet.address}`);
            for (let i = 0; i < numClaims; i++) {
                await claimFaucetOnChain(wallet, i + 1, numClaims);

                if (i < numClaims - 1) {
                    logger.loading(`Waiting 20 seconds before next claim...`);
                    await new Promise(resolve => setTimeout(resolve, 20000));
                }
            }
            logger.success(`Finished ${numClaims} faucet claims for wallet ${wallet.address}.`);
            logger.section(`Faucet claims completed for wallet ${wallet.address}`);
        }

        if (numToBuy > 0) {
            const accessToken = await login(wallet);
            if (accessToken) {
                await buyProperties(wallet, accessToken, numToBuy);
            } else {
                logger.error(`Skipping property purchase for wallet ${wallet.address} due to login failure.`);
            }
        }
    }
    logger.summary('All Daily Tasks Completed for all wallets.');
};

const startCountdown = () => {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }

    const twentyFourHours = 24 * 60 * 60 * 1000;
    const nextRun = new Date(new Date().getTime() + twentyFourHours);
    logger.info(`Next run scheduled for: ${nextRun.toLocaleString()}`);

    countdownInterval = setInterval(() => {
        const remaining = nextRun.getTime() - new Date().getTime();
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            process.stdout.write('\r');
            return;
        }
        const hours = Math.floor((remaining / (1000 * 60 * 60)));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        process.stdout.write(`\r${colors.cyan}Next run in: ${hours}h ${minutes}m ${seconds}s...${colors.reset}`);
    }, 1000);
};

const main = async () => {
    logger.banner();
    const wallets = getWallets();
    logger.info(`Found ${wallets.length} wallet(s).`);

    const numClaimsInput = await askQuestion(`Enter the number of faucet claims to perform per wallet: `);
    numClaims = parseInt(numClaimsInput);

    if (isNaN(numClaims) || numClaims < 0) {
        logger.critical('Invalid input for faucet claims. Please enter a non-negative number.');
        rl.close();
        return;
    }
    
    const numToBuyInput = await askQuestion(`Enter the number of properties to buy per wallet (0 for none): `);
    numToBuy = parseInt(numToBuyInput);

    if (isNaN(numToBuy) || numToBuy < 0) {
        logger.critical('Invalid input for properties to buy. Please enter a non-negative number.');
        rl.close();
        return;
    }
    
    logger.summary(`Bot configured for: ${numClaims} faucet claim(s) & ${numToBuy} property purchase(s) per wallet.`);
    rl.close();

    await runTasks(wallets);
    startCountdown();

    // Schedule subsequent runs every 24 hours
    setInterval(async () => {
        await runTasks(wallets);
        startCountdown();
    }, 24 * 60 * 60 * 1000);
};

main().catch(err => {
    logger.critical("An unexpected fatal error occurred in main execution:");
    console.error(err);
    process.exit(1);
});
�
