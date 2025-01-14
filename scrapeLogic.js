const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
      "--enable-blink-features=ClipboardAPI",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    // headless: false,
  });
  try {
    const page = await browser.newPage();
      const context = browser.defaultBrowserContext();
      await context.overridePermissions("https://developer.chrome.com/", [
        "clipboard-read",
        "clipboard-write",
        "clipboard-sanitized-write",
      ]);
    await page.goto("https://developer.chrome.com/");
     await page.evaluate(async () => {
       await navigator.clipboard.writeText("Hello, Clipboard!");
       const text = await navigator.clipboard.readText();
       console.log(text); // Should log "Hello, Clipboard!"
       res.send(text);
     });

  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
