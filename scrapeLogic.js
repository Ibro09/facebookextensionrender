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
    const page = await browser.newPage();

    const client = await page.target().createCDPSession();
    await page.setViewport({ width: 1280, height: 20720 });
    // Set permissions via DevTools Protocol
    await client.send("Browser.setPermission", {
      origin: "https://web.facebook.com",
      permission: { name: "clipboard-write", allowWithoutSanitization: true },
      setting: "granted",
    });
    await client.send("Browser.setPermission", {
      origin: "https://web.facebook.com/groups/238990561518405",
      permission: { name: "clipboard-read", allowWithoutSanitization: true },
      setting: "granted",
    });

    await context.overridePermissions(
      "https://web.facebook.com/groups/238990561518405",
      ["clipboard-read", "clipboard-write"]
    );

    // // Navigate to Facebook login
    // await page.goto("https://web.facebook.com");
    // await page.type("#email", "ibsalam24@gmail.com");
    // await page.type("#pass", "Password24@");
    // setTimeout(async () => {
    //   await page.click('[name="login"]');
    // }, 9000);
    // await page.waitForNavigation({ waitUntil: "load" });

    // Navigate to a specific group
    await page.goto("https://web.facebook.com/groups/238990561518405", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });
    await page.bringToFront(); // Bring the page into focus
    // Ensure the document is focused
    await page.evaluate(() => {
      if (!document.hasFocus()) {
        window.focus();
      }
    });
    const urls = await page.url();
    console.log(urls);
    if (
      urls ==
      "https://www.facebook.com/login/?next=https%3A%2F%2Fweb.facebook.com%2Fgroups%2F238990561518405&_rdc=1&_rdr"
    ) {
      console.log("aaaa");

      // Select the password input field using its type attribute
      const passwordInput = await page.$('input[type="password"]');

      // Type a password into the password input field
      await passwordInput.type("your-password-here"); // Replace with your password
      const submit = await page.$('input[type="submit"]');
      await page.click('[type="submit"]');
      await page.waitForNavigation({
        waitUntil: "load",
      });
    } // Navigate to a specific group
    setInterval(() => {
      const urls =  page.url();
    console.log(urls);
    }, 10000);
    await page.goto("https://web.facebook.com/groups/238990561518405", {
      waitUntil: "load",
    });
    // Wait for content to load
    await page.waitForSelector("div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z", {
      waitUntil: "networkidle2",
      timeout: 100000,
    });

    const keywords = ["a"];
    const results = [];
    const links = [];

    // Extract content matching keywords
    for (const word of keywords) {
      const divContents = await page.evaluate(async (word) => {
        const results = [];
        const divs = Array.from(
          document.querySelectorAll("div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z")
        );
        for (const div of divs) {
          if (div.innerText.includes(word)) {
            const span = Array.from(
              div.querySelectorAll(
                "span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.x1s688f.xi81zsa"
              )
            ).find((span) => span.innerText.toLowerCase().includes("copy"));

            if (span) {
              // Collect all attributes and their values
              const attributes = Array.from(span.attributes).reduce(
                (acc, attr) => {
                  acc[attr.name] = attr.value;
                  return acc;
                },
                {}
              );

              // Push attributes into the results array
              results.push({
                text: span.innerText,
                attributes,
                clicked: true,
              });

              console.log("Span Attributes:", attributes); // Log attributes for debugging

              // Simulate a click on the span
              span.click();
            }
          }
        }
        return results;
      }, word);

      results.push(...divContents);

      // Extract copied text for each clicked span
      for (const content of divContents) {
        if (content.clicked) {
          const copiedText = await page.evaluate(() =>
            navigator.clipboard.readText()
          );
          links.push(copiedText);
        }
      }
    }

    const uniqueLinks = [...new Set(links)];
    console.log("Final Results:", uniqueLinks);

    // Verify permissions
    const writePermission = await page.evaluate(async () => {
      return (await navigator.permissions.query({ name: "clipboard-write" }))
        .state;
    });
    const readPermission = await page.evaluate(async () => {
      return (await navigator.permissions.query({ name: "clipboard-read" }))
        .state;
    });

    console.log(`Clipboard-write permission state: ${writePermission}`);
    console.log(`Clipboard-read permission state: ${readPermission}`);

    // Return response to client
    res.status(200).json({
      results,
      uniqueLinks,
      writePermission,
      readPermission,
    });
  } catch (e) {
    console.error(`Error: ${e.message}`);
    if (!res.headersSent) {
      res.status(500).send(`Error: ${e.message}`);
    }
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
