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
        // headless: 'new', // Assuming you want to run headless
        headless: false, // Assuming you want to run headless
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--proxy-server=proxy.packetstream.io:31112',
        ], // Add these arguments
      });
      const page = await browser.newPage();
      // ('proxy.packetstream.io', '31112', 'cv2career', '0IwkbXc8mEHu2UKL_country-Australia')
      page.authenticate({
        username: 'cv2career',
        password: '0IwkbXc8mEHu2UKL_country-Australia',
      });

      return { browser, page };
    } catch (error) {
      console.log('Error launching browser: ' + (error.message || error));
      throw new Error(error.message);
    }
  }

  // Indeed Aggregator Credential Test
  async performIndeedAuth(credentials){
    try{
      console.log('INDEED CREDENTIALS HAVE ARRIVED', credentials);
      const {email} = credentials;

      const { browser, page } = await this.getBrowser();

      try{
        const signinUrl= 'https://secure.indeed.com/auth?hl=en_NG&co=NG&continue=https%3A%2F%2Fng.indeed.com%2F&tmpl=desktop&service=my&from=gnav-util-homepage&jsContinue=https%3A%2F%2Fng.indeed.com%2F&empContinue=https%3A%2F%2Faccount.indeed.com%2Fmyaccess&_ga=2.179854244.107516761.1694862912-1765997225.1680444170'
        // go to sigin page
        await page.goto(signinUrl);
        await page.waitForSelector('input[type="email"]')
        await new Promise((e)=>setTimeout(e),this.randomDelay(1000,5000));
        // type in the email field on the page
        await this.typeWithDelay(page, 'input[type="email"]', email);
        await new Promise((e)=>setTimeout(e),this.randomDelay(500,1000));
        // click continue button
        await page.click('button[type="submit"]');
        await new Promise((e)=>setTimeout(e),2000);

        // check the presence of sign in with login code instead
        const codeMethod= await page.waitForSelector('#auth-page-google-otp-fallback')
        console.log("sign in with login code presense: ",codeMethod)
        if (codeMethod){
          return {
            data: { status: true},
            message: 'Indeed account verification completed',
          };
        }
        return {
          data: { status: false },
          message: 'Indeed account verification completed',
        };

      } catch (error) {
        console.error('An error occured: ',error.message);
        return {
          data: { status: false },
          message: 'Indeed account verification completed',
        }
      } finally {
          await page.deleteCookie();
          await browser.close();
      }
        
    } catch(error){
      console.error('An error occured: ',error.message);
      return {
        data: { status: false },
        message: 'Indeed account verification completed',
      };
    } 
  }

  // LinkedIn Aggregator Credential Test
  async performLinkedInAuth(credentials) {
    try {
      console.log('INDEED CREDENTIALS HAVE ARRIVED', credentials);
      const { email, password } = credentials;

      const { browser, page } = await this.getBrowser();
      // const page = await browser.newPage();

      try {
        const baseUrl = 'https://www.linkedin.com/';
        await page.goto(baseUrl);
        await this.typeWithDelay(page, '#session_key', email);
        await new Promise((e)=>setTimeout(e),this.randomDelay(500,1000))
        await this.typeWithDelay(page, '#session_password', password);
        await new Promise((e)=>setTimeout(e),this.randomDelay(500,1000))
        await page.click('button[type="submit"]');
        await new Promise((e)=>setTimeout(e),1000)
        try {
          await page.waitForNavigation({ timeout: 20000 });
        } catch {}
        console.log('ur', page.url());
        if (page.url() === 'https://www.linkedin.com/uas/login-submit') {
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
        console.log('url', page.url());
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

}

const app = express();
const port = 3001;

app.use(express.json());

// app.post('/performLinkedInAuth', async (req, res) => {
app.post('/aggregator/linkedIn', async (req, res) => {
  try {
    const credentials = req.body;
    console.log({ credentials });
    const aggregator = new Aggregator(); // Create an instance of Aggregator
    const result = await aggregator.performLinkedInAuth(credentials);
    res.json(result);
  } catch (error) {
    console.error('Error performing LinkedIn authentication:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/aggregator/indeed', async(req, res) => {
  try {
    const credentials = req.body;
    console.log({ credentials });
    const aggregator = new Aggregator(); // Create an instance of Aggregator
    const result = await aggregator.performIndeedAuth(credentials);
    res.json(result);
  } catch (error) {
    console.error('Error performing Indeed authentication:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', function (req, res) {
  res.json({ status: false });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});