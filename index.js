// app.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

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
        headless: 'new', // Assuming you want to run headless mode
        // headless: false, // Assuming you want to run head mode
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

  async performMonsterAuth(credentials){
    try{
      const {email, password} = credentials;
      const { browser, page } = await this.getBrowser();
      try{
        const signinUrl= 'https://www.monster.co.uk/profile/valid-profile-continue?redirectUri=%2Fprofile%2Fdashboard%3Ffrom%3Dhomepage&amp;mode=Login';
        // go to signin page
        await page.goto(signinUrl, {timeout:60000});
        await new Promise((e)=>setTimeout(e,this.randomDelay(1000,5000)));
        const emailField = await page.waitForSelector('#email');
        const passwordField = await page.waitForSelector('#password');
        const signinButton= await page.waitForSelector('button[data-testid="auth0-continue-with-email-button"]');
        if (emailField==null || passwordField==null || signinButton==null){
          return {
            data: {status: false},
            message: 'Monster account verification completed',
          };
        }
        // input email, password and click signin button
        await this.typeWithDelay(page, '#email', email);
        await new Promise((e)=>setTimeout(e,this.randomDelay(500,1000)));
        await this.typeWithDelay(page, '#password', password);
        await new Promise((e)=>setTimeout(e,this.randomDelay(500,1000)));
        await page.click('button[data-testid="auth0-continue-with-email-button"]');
        await new Promise((e)=>setTimeout(e, 30000));
        // if not homepage
        if (page.url().includes('https://identity.monster.com/login')){
          return {
            data: {staus: false},
            message:'Monster account verification completed',
          };
        }
        return {
          data: {status: true},
          message: 'Monster account verification completed',
        };

      } catch (error) {
        console.error('An error occured', error)
        return {
          data: {status:false},
          message: 'Monster account verification completed'
        }
      } finally{
        await page.deleteCookie();
        await browser.close();
      }

    } catch (error){
      console.error('An error occured', error)
      return {
        data:{status:false},
        message: 'Monster account verification completed',
      };
    }
  }

  async performJobserveAuth(credentials){
    try{
      const {email, password} = credentials;

      const { browser, page } = await this.getBrowser();
      try{
        const signinUrl = 'https://www.jobserve.com/gb/en/Candidate/Login.aspx'
        // go to sigin page
        await page.goto(signinUrl, {timeout:60000});
        const cookieButton=await page.waitForSelector('#PolicyOptInLink')
        if (cookieButton==null){
          return {
            data: {status: false},
            message: 'Jobserve account verification completed',
          };
        }
        // click cookie notice and ensure email and password fields exist
        await page.click('#PolicyOptInLink');
        const emailField = await page.waitForSelector('#txbEmail');
        const passwordField = await page.waitForSelector('#txbPassword');
        const signinButton= await page.waitForSelector('#btnlogin');
        if (emailField==null || passwordField==null || signinButton==null){
          return {
            data: {status: false},
            message: 'Jobserve account verification completed',
          };
        }
        // input email, password and click signin button
        await this.typeWithDelay(page, '#txbEmail', email);
        await new Promise((e)=>setTimeout(e,this.randomDelay(500,1000)));
        await this.typeWithDelay(page, '#txbPassword', password);
        await new Promise((e)=>setTimeout(e,this.randomDelay(500,1000)));
        await page.click('#btnlogin');
        await new Promise((e)=>setTimeout(e, this.randomDelay(5000,10000)));
        // ensure we are in the homepage
        if (page.url().includes('https://www.jobserve.com/gb/en/Candidate/Login.aspx')){
          return {
            data: {staus: false},
            message:'Jobserve account verification completed',
          };
        }
        return {
          data: {status: true},
          message: 'Jobserve account verification completed',
        };

      } catch (error) {
        console.error('An error occured: ',error)
        return {
          data:{status:false},
          message:'Jobserve account verification completed',
        }

      } finally {
        await page.deleteCookie();
        await browser.close();
      }

    } catch {
      console.error(' An error occured: ', error)
      return {
        data: {status: false},
        message:'Jobserve account verification completed',
      }
    }
  }

  async performIndeedAuth(credentials){
    try{
      const {email} = credentials;
      const { browser, page } = await this.getBrowser();

      try{
        const signinUrl= 'https://secure.indeed.com/auth?hl=en_NG&co=NG&continue=https%3A%2F%2Fng.indeed.com%2F&tmpl=desktop&service=my&from=gnav-util-homepage&jsContinue=https%3A%2F%2Fng.indeed.com%2F&empContinue=https%3A%2F%2Faccount.indeed.com%2Fmyaccess&_ga=2.179854244.107516761.1694862912-1765997225.1680444170'
        // go to sigin page
        await page.goto(signinUrl, {timeout:60000});
        // ensure email input field appears on page
        const emailField=await page.waitForSelector('input[type="email"]')
        if (emailField==null){
          return {
            data: { status: false },
            message: 'Indeed account verification completed',
          };
        }
        await new Promise((e)=>setTimeout(e,this.randomDelay(1000,5000)));
        // type in the email field on the page
        await this.typeWithDelay(page, 'input[type="email"]', email);
        await new Promise((e)=>setTimeout(e,this.randomDelay(500,1000)));
        // click continue button
        await page.click('button[type="submit"]');
        await new Promise((e)=>setTimeout(e,2000));

        // check the presence of sign in with login code instead
        const codeMethod= await page.waitForSelector('#auth-page-google-otp-fallback')
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

  async performLinkedInAuth(credentials) {
    try {
      const { email, password } = credentials;
      const { browser, page } = await this.getBrowser();
      try {
        const baseUrl = 'https://www.linkedin.com/';
        await page.goto(baseUrl, {timeout:60000});
        await this.typeWithDelay(page, '#session_key', email);
        await new Promise((e)=>setTimeout(e,this.randomDelay(500,1000)));
        await this.typeWithDelay(page, '#session_password', password);
        await new Promise((e)=>setTimeout(e,this.randomDelay(500,1000)));
        await page.click('button[type="submit"]');
        await new Promise((e)=>setTimeout(e,1000))
        try {
          await page.waitForNavigation({ timeout: 20000 });
        } catch {}
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

app.post('/aggregator/linkedIn', async (req, res) => {
  try {
    const credentials = req.body;
    const aggregator = new Aggregator(); // Create an instance of Aggregator
    const result = await aggregator.performLinkedInAuth(credentials);
    res.json(result);
  } catch (error) {
    console.error('Error performing LinkedIn authentication:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/aggregator/monster', async(req,res) => {
  try{
    const credentials = req.body;
    const aggregator = new Aggregator();
    const result= await aggregator.performMonsterAuth(credentials);
    res.json(result);
  } catch (error) {
    console.error('Error performing Monster authentication', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
})

app.post('/aggregator/jobserve', async(req,res)=>{
  try{
    const credentials = req.body;
    const aggregator= new Aggregator;
    const result = await aggregator.performJobserveAuth(credentials);
    res.json(result);
  } catch (error) {
    console.error('Error performing Jobserve authentication:', error);
    res.status(500).json({error: 'Internal Server Error'});
  }
})

app.post('/aggregator/indeed', async(req, res) => {
  try {
    const credentials = req.body;
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