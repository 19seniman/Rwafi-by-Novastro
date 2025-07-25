require('dotenv').config();
const axios = require('axios');
const { ethers } = require('ethers');
const readline = require('readline');
const fs = require('fs');
const { HttpsProxyAgent } = require('https-proxy-agent');

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
    info: (msg) => console.log(${colors.cyan}[i] ${msg}${colors.reset}),
    warn: (msg) => console.log(${colors.yellow}[!] ${msg}${colors.reset}),
    error: (msg) => console.log(${colors.red}[x] ${msg}${colors.reset}),
    success: (msg) => console.log(${colors.green}[+] ${msg}${colors.reset}),
    loading: (msg) => console.log(${colors.magenta}[*] ${msg}${colors.reset}),
    step: (msg) => console.log(${colors.blue}[>] ${colors.bold}${msg}${colors.reset}),
    critical: (msg) => console.log(${colors.red}${colors.bold}[FATAL] ${msg}${colors.reset}),
    summary: (msg) => console.log(${colors.green}${colors.bold}[SUMMARY] ${msg}${colors.reset}),
    banner: () => {
        const border = ${colors.blue}${colors.bold}╔═════════════════════════════════════════╗${colors.reset};
        const title = ${colors.blue}${colors.bold}║   🍉 19Seniman From Insider   🍉    ║${colors.reset};
        const bottomBorder = ${colors.blue}${colors.bold}╚═════════════════════════════════════════╝${colors.reset};
        
        console.log(\n${border});
        console.log(${title});
        console.log(${bottomBorder}\n);
    },
    section: (msg) => {
        const line = '─'.repeat(40);
        console.log(\n${colors.gray}${line}${colors.reset});
        if (msg) console.log(${colors.white}${colors.bold} ${msg} ${colors.reset});
        console.log(${colors.gray}${line}${colors.reset}\n);
    },
    countdown: (msg) => process.stdout.write(\r${colors.blue}[⏰] ${msg}${colors.reset}),
};

function displayWelcomeMessage() {
    console.log(\n${colors.white}${colors.bold}Hi !!${colors.reset});
    console.log(${colors.white}${colors.bold}How Are you Today??${colors.reset}\n);
    
    console.log(${colors.yellow}1. Donate For Watermelon 🍉${colors.reset});
    console.log(${colors.yellow}   Usdt Or USdc${colors.reset});
    console.log(${colors.green}${colors.bold}   0xf01fb9a6855f175d3f3e28e00fa617009c38ef59${colors.reset}\n);
    
    const telegramUsername = 'VirtualAssistant19_bot';
    const telegramLink = `https://t.me/${telegramUsername}?start=select%20menu%20%2Fscript_access_on_github`;
    
    console.log(${colors.cyan}2. Send your proof to Telegram: ${colors.bold}${telegramLink}${colors.reset});
    console.log(${colors.cyan}3. Select menu /script_access_on_github${colors.reset}\n);
}

async function main() {
    logger.banner();
    displayWelcomeMessage(); 
    logger.section("Application Start");

    logger.info("Script is running...");

    await new Promise(resolve => setTimeout(resolve, 2000));

    logger.success("Script finished successfully!");
}

main().catch(error => {
    logger.critical(An unhandled error occurred: ${error.message});
    console.error(error);
});
