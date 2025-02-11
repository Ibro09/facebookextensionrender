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
  const keyword = ["a"];
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
        userDataDir: "./user_data",
      });
      const page = await browser.newPage();
      const context = browser.defaultBrowserContext();

      page.setDefaultTimeout(120000); // 2 minutes

      // setInterval(() => {
      //   console.log(page.url());
      // }, 10000);
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
          timeout: 10000,
        });
        console.log("facebook loaded");

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

       if (page.url().includes()) {
        console.log(page.content())
       }

       https: setInterval(async () => {
         if (
           page.url().includes("https://www.facebook.com/login") ||
           page
             .url()
             .includes(
               "https://www.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F"
             )
         ) {
           console.log("page");
           await page.waitForSelector('input[name="pass"]'); // Wait for the password input field to appear
           // Replace with your credentials
           const emailSelector = "#email";
           const passwordSelector = "#pass";

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
           console.log("email and pass succesful");

           const secAcButtonSelector = 'input[data-testid="sec_ac_button"]';
           const loginBtnSelector = "#loginbutton";

           try {
             const buttons = await page.evaluate(() => {
               // Get all button elements
               const buttonElements = Array.from(
                 document.querySelectorAll(
                   'button, input[type="button"], input[type="submit"]'
                 )
               );

               // Map their attributes into an array of objects
               return buttonElements.map((button) => {
                 const attributes = {};
                 for (const attr of button.attributes) {
                   attributes[attr.name] = attr.value;
                 }
                 return {
                   tag: button.tagName.toLowerCase(),
                   attributes,
                   text: button.innerText || button.value || "", // Inner text or value for inputs
                 };
               });
             });
             // Check for a button with id 'loginbutton' and click it
             const buttonWithId = buttons.find(
               (button) => button.attributes.id === "loginbutton"
             );

             if (buttonWithId) {
               console.log("Button with ID 'loginbutton' found. Clicking...");
               await page.evaluate(() => {
                 const button = document.querySelector("#loginbutton");
                 if (button) button.click();
                 console.log("clicked");
               });
             } else {
               console.log("No button with ID 'loginbutton' found.");
             }
           } catch (error) {
             console.error("Error didnt find any button", error);
           }

           // Type the password
           // Wait for the button to appear
           await page.waitForNavigation({ waitUntil: "networkidle2" });
           console.log(page.url(), "thisssss");
           await page.goto(group, {
             waitUntil: "networkidle2",
             timeout: 60000,
           });
           console.log(page.url(), "that");
         }
       }, 10000);

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
        // res.status(200).json({ links: uniqueList });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error puppeteer data", error });
      } finally {
        await browser.close();
      }
    })();
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});
app.get("/a", async (req, res) => {
  const keyword = ["a"];
  const group = "https://web.facebook.com/groups/238990561518405";
  try {
    (async () => {
      const browser = await puppeteer.launch({
        headless:false,
        userDataDir: "./user_data",
      });
      const page = await browser.newPage(); 
      const context = browser.defaultBrowserContext();

      page.setDefaultTimeout(120000); // 2 minutes

      // setInterval(() => {
      //   console.log(page.url());
      // }, 10000);
      await context.overridePermissions("https://web.facebook.com/", [
        "clipboard-read",
        "clipboard-write",
      ]); // Replace with your domain
      await page.setViewport({ width: 1280, height: 20720 });

      // Set viewport for consistent content loading
      const links = [];
      try {
        // Navigate to the Facebook group
        await page.goto(group, {
          waitUntil: "networkidle0",   
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
        // res.status(200).json({ links: uniqueList });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error puppeteer data", error });
      } finally {
        await browser.close();
      }
    })();
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});
app.get("/login", async (req, res) => {
  try {
    (async () => {
      const browser = await puppeteer.launch({
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--enable-features=ClipboardReadWrite",
          "--unsafely-treat-insecure-origin-as-secure=http://web.facebook.com", // Replace with your domain
        ],
        // headless: false,
        userDataDir: "./user_data",
      });
      const page = await browser.newPage();
      const context = browser.defaultBrowserContext();

      page.setDefaultTimeout(1200000); // 2 minutes

      setInterval(() => {
        console.log(page.url());
      }, 10000);
      await context.overridePermissions("https://web.facebook.com/", [
        "clipboard-read",
        "clipboard-write",
      ]); // Replace with your domain
      await page.setViewport({ width: 1280, height: 20720 });

      // Set viewport for consistent content loading
      const links = [];
      try {
        await page.goto(
          "https://web.facebook.com/login/?next=https%3A%2F%2Fwww.facebook.com%2F&_rdc=1&_rdr",
          {
            waitUntil: "domcontentloaded",
            timeout: 100000,
          }
        );
        console.log("facebook loaded");
        if (page.url().includes("https://web.facebook.com/login")) {
          await page.waitForSelector('input[name="pass"]'); // Wait for the password input field to appear
          await page.type('input[name="pass"]', "Password24@"); // Type the password
          await page.waitForSelector('input[data-testid="sec_ac_button"]'); // Wait for the button to appear
          await page.click('input[data-testid="sec_ac_button"]'); // Click the button
          await page.waitForNavigation({ waitUntil: "networkidle2" });
          console.log(page.url());
        }

        res.status(200).json({ links: "uniqueList" });
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error puppeteer data", error });
      } finally {
        await browser.close();
      }
    })();
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
