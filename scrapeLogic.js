const puppeteer = require("puppeteer");
require("dotenv").config();

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const context = browser.defaultBrowserContext();
    const url = new URL("https://developer.chrome.com/");

    // Grant permissions using the DevTools Protocol
    await context._connection.send("Browser.grantPermissions", {
      origin: url.origin,
      browserContextId: undefined, // Use undefined for the default browser context
      permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"],
    });

    const page = await browser.newPage();
    await page.goto(url.href);

    // Check clipboard-write permission state
    const state = await page.evaluate(async () => {
      return (await navigator.permissions.query({ name: "clipboard-write" }))
        .state;
    });

    console.log(`Clipboard-write permission state: ${state}`); // Logs "granted"

    // Perform clipboard operations
    const clipboardContent = await page.evaluate(async () => {
      await navigator.clipboard.writeText("Hello, Clipboard!");
      return await navigator.clipboard.readText();
    });

    console.log(`Clipboard Content: ${clipboardContent}`); // Logs "Hello, Clipboard!"

    // Close the browser
    await browser.close();
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
})();


module.exports = { scrapeLogic };
