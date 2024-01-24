// app.js

const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

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
      const browser = await puppeteer.launch({
        headless: 'new', // Assuming you want to run headless
        // headless: false, // Assuming you want to run headless
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          // '--proxy-server=https://dc.smartproxy.com:10021',
        ], // Add these arguments
      });
      const page = await browser.newPage();
      // page.authenticate({
      //   username: 'user-cv2career-country-au',
      //   password: 'wspG7q9oJtIutr2z7R',
      // });

      return { browser, page };
    } catch (error) {
      console.log('Error launching browser: ' + (error.message || error));
      throw new Error(error.message);
    }
  }
  // LinkedIn Aggregator Credential Test
  async performLinkedInAuth(credentials) {
    try {
      console.log('LINKEDIN CREDENTIALS HAVE ARRIVED', credentials);
      const { email, password } = credentials;

      const { browser, page } = await this.getBrowser();
      // const page = await browser.newPage();

      try {
        const baseUrl = 'https://www.linkedin.com/';
        await page.goto(baseUrl);

        let credStatus;
        await this.typeWithDelay(page, '#session_key', email);
        await page.waitForTimeout(this.randomDelay(500, 1000));
        await this.typeWithDelay(page, '#session_password', password);
        await page.waitForTimeout(this.randomDelay(500, 1000));

        await page.click('button[type="submit"]');
        await page.waitForTimeout(10000);
        // await page.waitForNavigation({ timeout: 0 });
        console.log('ur', page.url());
        if (page.url() === 'https://www.linkedin.com/uas/login-submit') {
          const failedContent = await page.content();
          // fs.writeFile("failepageContent.html", failedContent, (err) => {
          // if (err) {
          //   console.error("Error writing to failed file:", err);
          // } else {
          //   console.log("Page content saved to pageContent.html");
          // }
          // });
          return {
            data: { status: false },
            message: 'LinkedIn account verification completed',
          };
        }
        if (
          page.url() ===
          'https://www.linkedin.com/feed/?trk=homepage-basic_sign-in-submit'
        ) {
          return {
            data: { status: true },
            message: 'LinkedIn account verification completed',
          };
        }

        if (
          page.url().includes('https://www.linkedin.com/checkpoint/challenge/')
        ) {
          const INDENT =
            'The login attempt seems suspicious. To finish signing in please enter the verification code we sent to your email address';
          if ((await page.content()).includes(INDENT)) {
            return {
              data: { status: true },
              message: 'LinkedIn account verification completed',
            };
          } else {
            return {
              data: { status: false },
              message: 'LinkedIn account not verified',
            };
          }
        }
        // await page.waitForTimeout(30000);
        // await page.waitForNavigation({ timeout: 70000 });
        console.log('url', page.url());
        // if (
        //   page.url() ===
        //   "https://www.linkedin.com/feed/?trk=homepage-basic_sign-in-submit"
        // ) {
        //   const content = await page.content();
        //   // Write the content to a file
        //   // fs.writeFile("failepageContent.html", content, (err) => {
        //   //   if (err) {
        //   //     console.error("Error writing file:", err);
        //   //   } else {
        //   //     console.log("Page content saved to pageContent.html");
        //   //   }
        //   // });
        //   return {
        //     data: { status: true },
        //     message: "LinkedIn account verification completed",
        //   };
        // }

        //   const initiateLoadAnimations = await page.$$(
        //     ".initiate-load-animation"
        //   );
        //   return {
        //     data: { status: false },
        //     message: "LinkedIn account verification completed",
        //   };
        // }

        // if (initiateLoadAnimations.length > 0) {
        //   console.log(">>> Success: Credentials verified <<<");
        //   credStatus = true;
        // }
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
          data: { status: true },
          message: 'LinkedIn account verification completed',
          url: page.url(),
        };
      } catch (error) {
        console.error('An error occurred:', error);
        return {
          data: { status: false },
          message: 'LinkedIn account verification completed',
        };
      } finally {
        await page.deleteCookie();
        await browser.close();
      }
    } catch (error) {
      console.error('An error occurred:', error);
      return {
        data: { status: false },
        message: 'LinkedIn account verification completed',
      };
    }
  }

  async linkedInAuth(page, email, password) {
    await this.typeWithDelay(page, '#session_key', email);
    await page.waitForTimeout(this.randomDelay(500, 1000));
    await this.typeWithDelay(page, '#session_password', password);
    await page.waitForTimeout(this.randomDelay(500, 1000));

    await page.click('button[type="submit"]');

    if (page.$$('.initiate-load-animation')) {
      console.log('>>> Success: Credentials verified <<<');
      return true;
    } else if (
      (await page.$('#error-for-username')) ||
      (await page.$('p[error-for="password"]'))
    ) {
      console.log('>>> Failed due to username error <<<');
      return false;
    } else if (
      (await page.$('#error-for-password')) ||
      (await page.$('p[error-for="password"]'))
    ) {
      console.log('>>> Failed due to password error <<<');
      return false;
    } else if (await page.$('p[role="alert"]')) {
      console.log('>>> Failed due to error alert <<<');
      return false;
    }
  }
}

const app = express();
const port = 3001;

app.use(express.json());

app.post('/performLinkedInAuth', async (req, res) => {
  try {
    const credentials = req.body;
    console.log({ credentials });
    const aggregator = new Aggregator(); // Create an instance of Aggregator
    const result = await aggregator.performLinkedInAuth(
      credentials
      // {
      //   email: 'edahmitchel@gmail.com',
      //   password: 'mitchel76',
      // }
    );
    res.json(result);
  } catch (error) {
    console.error('Error performing LinkedIn authentication:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/', function (req, res) {
  res.json({ status: false });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// {
//   "data": {
//     "status": true
//   },
//   "message": "LinkedIn account verification completed",
//   "url": "https://www.linkedin.com/checkpoint/challenge/AgHRZzO4BXoY8AAAAY07poNAAGiSG2JDyg1JVlUuMe75GVdZz2QQpexQT5dnwmM00vJQg4_ChCjxobo4nN_J4hoGwAAo0A?ut=3XU55yjFVCUH41"
// }
