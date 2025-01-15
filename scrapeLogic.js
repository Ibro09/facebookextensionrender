const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (res) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: false,
    userDataDir: "./user_data",
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to the Facebook group
    await page.goto("https://web.facebook.com/groups/238990561518405", {
      waitUntil: "load",
      timeout: 60000,
    });
    try {
      const popupCloseButtonSelector = "div.x92rtbv.x10l6tqk.x1tk7jg1.x1vjfegm";
      await page.waitForSelector(popupCloseButtonSelector, { timeout: 100000 });
      await page.click(popupCloseButtonSelector);
      console.log("Pop-up closed successfully.");
    } catch (error) {
      console.log("No pop-up found or pop-up close button not detected.");
    }

    // await page.waitForSelector("div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z", {
    //   timeout: 60000,
    // });

    const keyword = ["a"];
    const results = [];
    const links = [];

    await page.waitForSelector("div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z", {
      timeout: 60000,
    });
  for (const word of keyword) {
    console.log("Processing keyword:", word);
    const divContents = await page.evaluate(async (word) => {
      const results = [];
      const divs = Array.from(
        document.querySelectorAll("div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z")
      );
      console.log("Divs found:", divs);

      for (const div of divs) {
        console.log("Checking div:", div.innerText);
        if (div.innerText.includes(word)) {
          console.log("Found word:", word);
          const span = Array.from(
            div.querySelectorAll(
              "span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.x1s688f.xi81zsa"
            )
          ).find((span) => span.innerText.toLowerCase().includes("copy"));

          if (span) {
            span.click();
            await new Promise((resolve) => setTimeout(resolve, 100));
            results.push({ text: span.innerText, clicked: true });
          }
        }
      }

      return results;
    }, word);

    console.log("Div contents:", divContents);
  }

    console.log(`Clipboard-write permission state: ${writePermission}`);
    console.log(`Clipboard-read permission state: ${readPermission}`);
    res.status(200).json({ links: uniqueList });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (!res.headersSent) {
      res.status(500).send(`Error: ${error.message}`);
    }
  } finally {
    // await browser.close();
  }
};

module.exports = { scrapeLogic };
