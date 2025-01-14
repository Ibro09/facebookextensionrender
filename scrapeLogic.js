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
     const context = browser.defaultBrowserContext();
    const url = new URL("https://web.facebook.com");

  const client = await page.target().createCDPSession();
  await client.send("Browser.setPermission", {
    origin: "https://web.facebook.com",
    permission: {
      name: "clipboard-write",
      allowWithoutSanitization: true,
    },
    setting: "granted",
  });

    const page = await browser.newPage();
    await context.overridePermissions("https://web.facebook.com", [
      "clipboard-read",
      "clipboard-write",
      "clipboard-Sanitized-write",
    ]);
    await page.goto("https://web.facebook.com");

    // Check clipboard-write permission state
    const state = await page.evaluate(async () => {
      return (await navigator.permissions.query({ name: "clipboard-write" })).state;
    });

    console.log(`Clipboard-write permission state: ${state}`); // Logs "granted"

    // Perform clipboard operations
    const clipboardContent = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });

    console.log(`Clipboard Content: ${clipboardContent}`); // Logs "Hello, Clipboard!"
    res.send(clipboardContent);
    // Close the browser
    await browser.close();
  } catch (e) {
    console.error(`Error: ${e.message}`);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
