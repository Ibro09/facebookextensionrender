const express = require("express");
const { scrapeLogic } = require("./scrapeLogic");
const app = express();
const puppeteer = require("puppeteer");

const PORT = process.env.PORT || 4000;

app.get("/scrape", (req, res) => {
  scrapeLogic(res);
});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});

app.get("/api", async (req, res) => {
  const keyword =['a']
 const group = "https://web.facebook.com/groups/238990561518405";
  try {
    (async () => {
      const browser = await puppeteer.launch({
        executablePath:
          process.env.PUPPETEER_EXECUTABLE_PATH ||
          (await chromium.executablePath),
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--enable-features=ClipboardReadWrite",
          "--unsafely-treat-insecure-origin-as-secure=http://web.facebook.com", // Replace with your domain
        ],
        headless: true,
        userDataDir: "./user_data",
      });
      const page = await browser.newPage();
      const context = browser.defaultBrowserContext();
      await context.overridePermissions("https://web.facebook.com/", [
        "clipboard-read",
        "clipboard-write",
      ]); // Replace with your domain
      await page.setViewport({ width: 1280, height: 20720 });

      // Set viewport for consistent content loading
      const links = [];
      try {
        await page.goto("https://www.facebook.com", {
          waitUntil: "domcontentloaded",
          timeout:10000
        });
        console.log('facebook loaded');
        
        // Replace with your credentials
        const emailSelector = "#email";
        const passwordSelector = "#pass";
        const loginButtonSelector = '[name="login"]';

        if (await page.$(emailSelector)) {
          await page.type(emailSelector, "ibsalam24@gmail.com");
        } else {
          console.log("Email input not found, continuing...");
        }

        if (await page.$(passwordSelector)) {
          await page.type(passwordSelector, "Password24@");
        } else {
          console.log("Password input not found, continuing...");
        }

        if (await page.$(loginButtonSelector)) {
          await page.click(loginButtonSelector);
          // Wait for the page to load after login
          await page.waitForNavigation({ waitUntil: "networkidle2" });
        } else {
          console.log("Login button not found, continuing...");
        }

        // Navigate to the Facebook group
        await page.goto(group, {
          waitUntil: "networkidle2",
          timeout: 60000,
        });
               console.log("group loaded");

        // Wait for the specific class to load
        await page.waitForSelector("div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z", {
          timeout: 60000,
        });

        const keywords = ["posts"];
        const results = [];

        for (const word of keyword) {
          const divContents = await page.evaluate(async (word) => {
            const results = [];
            const links = [];
            const divs = Array.from(
              document.querySelectorAll(
                "div.x1yztbdb.x1n2onr6.xh8yej3.x1ja2u2z"
              )
            );

            for (const div of divs) {
              if (div.innerText.includes(word)) {
                const span = Array.from(
                  div.querySelectorAll(
                    "span.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1xmvt09.x1lliihq.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.xudqn12.x3x7a5m.x6prxxf.xvq8zen.x1s688f.xi81zsa"
                  )
                ).find((span) => span.innerText.toLowerCase().includes("copy"));

                if (span) {
                  span.click(); // Click the span
                  results.push({ text: span.innerText, clicked: true });
                  //  const copiedText =navigator.clipboard.readText()
                  //  links.push(copiedText)
                }
              }
            }

            return results;
          }, word);

          results.push(...divContents);

          // Ensure clipboard content for all matches
          for (const content of divContents) {
            if (content.clicked) {
              const copiedText = await page.evaluate(() =>
                navigator.clipboard.readText()
              );
              links.push(copiedText);
            }
          }
        }
        const permissions = await page.evaluate(async () => {
          const writePermission = await navigator.permissions.query({
            name: "clipboard-write",
          });
          const readPermission = await navigator.permissions.query({
            name: "clipboard-read",
          });
          return { write: writePermission.state, read: readPermission.state };
        });
        console.log("Permissions:", permissions);
        const uniqueList = [...new Set(links)];
        console.log("Final Results:", results, uniqueList);
        res.status(200).json({ links: uniqueList });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error puppeteer data", error });
      } finally {
        await browser.close()
      }
    })();
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});




app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
