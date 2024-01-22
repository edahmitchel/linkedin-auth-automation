// app.js

const express = require("express");
const path = require("path");
const puppeteer = require("puppeteer");

class Aggregator {
  constructor() {
    this.randomDelay = (min, max) =>
      Math.floor(Math.random() * (max - min + 1) + min);
  }

  async typeWithDelay(page, selector, text) {
    for (const character of text) {
      await page.type(selector, character, {
        delay: this.randomDelay(30, 150),
      });
    }
  }

  async getBrowser() {
    try {
      return await puppeteer.launch({
        headless: "new",
      });
    } catch (error) {
      console.log("Error launching browser: " + (error.message || error));
    }
  }

  // LinkedIn Aggregator Credential Test
  async performLinkedInAuth(credentials) {
    try {
      console.log("LINKEDIN CREDENTIALS HAVE ARRIVED", credentials);
      const { email, password } = credentials;

      const browser = await this.getBrowser();
      const page = await browser.newPage();

      try {
        const baseUrl = "https://www.linkedin.com/";
        await page.goto(baseUrl);

        let credStatus;
        await this.typeWithDelay(page, "#session_key", email);
        await page.waitForTimeout(this.randomDelay(500, 1000));
        await this.typeWithDelay(page, "#session_password", password);
        await page.waitForTimeout(this.randomDelay(500, 1000));

        await page.click('button[type="submit"]');
        await page.waitForTimeout(70000);
        console.log("url", page.url());
        const initiateLoadAnimations = await page.$$(
          ".initiate-load-animation"
        );
        console.log(page.content());
        if (initiateLoadAnimations.length > 0) {
          console.log(">>> Success: Credentials verified <<<");
          credStatus = true;
        }
        // else if (
        //   (await page.$("#error-for-username")) ||
        //   (await page.$('p[error-for="password"]'))
        // ) {
        //   console.log(">>> Failed due to username error <<<");
        //   credStatus = false;
        // } else if (
        //   (await page.$("#error-for-password")) ||
        //   (await page.$('p[error-for="password"]'))
        // ) {
        //   console.log(">>> Failed due to password error <<<");
        //   credStatus = false;
        // } else {
        //   console.log(
        //     ">>> Authentication failed. Admin should investigate <<<"
        //   );
        //   credStatus = false;
        // }

        return {
          data: { status: credStatus },
          message: "LinkedIn account verification completed",
        };
      } catch (error) {
        console.error("An error occurred:", error);
        return {
          data: { status: false },
          message: "LinkedIn account verification completed",
        };
      } finally {
        await browser.close();
      }
    } catch (error) {
      console.error("An error occurred:", error);
      return {
        data: { status: false },
        message: "LinkedIn account verification completed",
      };
    }
  }

  async linkedInAuth(page, email, password) {
    await this.typeWithDelay(page, "#session_key", email);
    await page.waitForTimeout(this.randomDelay(500, 1000));
    await this.typeWithDelay(page, "#session_password", password);
    await page.waitForTimeout(this.randomDelay(500, 1000));

    await page.click('button[type="submit"]');

    if (page.$$(".initiate-load-animation")) {
      console.log(">>> Success: Credentials verified <<<");
      return true;
    } else if (
      (await page.$("#error-for-username")) ||
      (await page.$('p[error-for="password"]'))
    ) {
      console.log(">>> Failed due to username error <<<");
      return false;
    } else if (
      (await page.$("#error-for-password")) ||
      (await page.$('p[error-for="password"]'))
    ) {
      console.log(">>> Failed due to password error <<<");
      return false;
    } else if (await page.$('p[role="alert"]')) {
      console.log(">>> Failed due to error alert <<<");
      return false;
    }
  }
}

const app = express();
const port = 3001;

app.use(express.json());

app.get("/performLinkedInAuth", async (req, res) => {
  try {
    const aggregator = new Aggregator(); // Create an instance of Aggregator
    const result = await aggregator.performLinkedInAuth({
      email: "edahmitchel@gmail.com",
      password: "mitchel76",
    });
    res.json(result);
  } catch (error) {
    console.error("Error performing LinkedIn authentication:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
