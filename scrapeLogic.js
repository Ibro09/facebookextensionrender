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
      const context = await browser.defaultBrowserContext();
      await context.overridePermissions("https://web.facebook.com", [
        "clipboard-read",
        "clipboard-write",
      ]);
    await page.goto("https://developer.chrome.com/");
     await page.evaluate(async () => {
       await navigator.clipboard.writeText("Hello, Clipboard!");
       const text = await navigator.clipboard.readText();
       console.log(text); // Should log "Hello, Clipboard!"
       res.send(text);
     });
  context.clearPermissionOverrides();


  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
