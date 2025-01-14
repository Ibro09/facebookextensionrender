const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    // headless: false,
  });
  try {
    const page = await browser.newPage();

    await page.goto("https://developer.chrome.com/");
     await page.overridePermissions("https://developer.chrome.com/");
     await page.evaluate(async () => {
       await navigator.clipboard.writeText("Hello, Clipboard!");
       const text = await navigator.clipboard.readText();
       console.log(text); // Should log "Hello, Clipboard!"
     });

    res.send('done');
  } catch (e) {
    console.error(e);
    res.send(`Something went wrong while running Puppeteer: ${e}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
