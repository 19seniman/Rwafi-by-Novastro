const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

// Logger object
const logger = {
  info: (msg) => console.log(${colors.cyan}[i] ${msg}${colors.reset}),
  warn: (msg) => console.log(${colors.yellow}[!] ${msg}${colors.reset}),
  error: (msg) => console.log(${colors.red}[x] ${msg}${colors.reset}),
  success: (msg) => console.log(${colors.green}[+] ${msg}${colors.reset}),
  loading: (msg) => console.log(${colors.magenta}[*] ${msg}${colors.reset}),
  step: (msg) =>
    console.log(${colors.blue}[>] ${colors.bold}${msg}${colors.reset}),
  critical: (msg) =>
    console.log(${colors.red}${colors.bold}[FATAL] ${msg}${colors.reset}),
  summary: (msg) =>
    console.log(${colors.green}${colors.bold}[SUMMARY] ${msg}${colors.reset}),
  banner: () => {
    const border = ${colors.blue}${colors.bold}╔═════════════════════════════════════════╗${colors.reset};
    const title = ${colors.blue}${colors.bold}║   🍉 19Seniman From Insider   🍉   ║${colors.reset};
    const bottomBorder = ${colors.blue}${colors.bold}╚═════════════════════════════════════════╝${colors.reset};

    console.log(\n${border});
    console.log(title);
    console.log(${bottomBorder}\n);
  },
  section: (msg) => {
    const line = "─".repeat(40);
    console.log(\n${colors.gray}${line}${colors.reset});
    if (msg) console.log(${colors.white}${colors.bold} ${msg} ${colors.reset});
    console.log(${colors.gray}${line}${colors.reset}\n);
  },
  countdown: (msg) =>
    process.stdout.write(\r${colors.blue}[⏰] ${msg}${colors.reset}),
};

// Panggil fungsi logger untuk menampilkan pesan
logger.banner();
logger.info("Script started...");

logger.section("ENGLISH VERSION");
logger.step("Hi !! How Are you Today??");
logger.info(
  "if you want to access the script please donate 1.6 usdt to evm wallet"
);
logger.info(
  "and send proof via telegram @VirtualAssistant19_bot Donate For Watermelon 🍉"
);
logger.info("Usdt Or USdc");
logger.success("💵: 0xf01fb9a6855f175d3f3e28e00fa617009c38ef59");
logger.info(
  "Send your proof to telegram @VirtualAssistant19_bot select menu /script_access_on_github"
);

logger.section("INDONESIAN VERSION");
logger.step("Hai !! Apa kabar hari ini?");
logger.info(
  "jika Anda ingin mengakses skrip, silakan donasikan 1,6 usdt ke dompet evm"
);
logger.info(
  "dan kirimkan buktinya melalui telegram @VirtualAssistant19_bot Donate For Watermelon 🍉"
);
logger.info("Usdt atau USdc");
logger.success("💵 : 0xf01fb9a6855f175d3f3e28e00fa617009c38ef59");
logger.info(
  "Kirim bukti Anda ke telegram @VirtualAssistant19_bot pilih menu /script_access_on_github"
);

logger.summary("Donation message displayed successfully.");
