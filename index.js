// app.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { Mutex } = require('async-mutex');
puppeteer.use(StealthPlugin());


let requestsCount=0;  // variable to monitor number of requests the server is processing.
class Aggregator {
  constructor() {
    this.randomDelay = (min, max) =>
      Math.floor(Math.random() * (max - min + 1) + min);
    this.browserOn = false;
    this.browser=null;
  }

  async typeWithDelay(page, selector, text) {
    for (const character of text) {
      await page.type(selector, character, {
        delay: this.randomDelay(30, 150),
      });
    }
  }
  
  async browserSwitch() {
    // function to switch on browser
    if (this.browserOn==false){
      await this.getBrowser();
      this.browserOn=true;
    }
  }

  broswerMonitor(){
    // function to monitor if server is processing requests, so that it can know whether to close browser or not.
    if (this.browserOn){
      if (requestsCount <= 0){
        this.browser.close();
        this.browserOn=false;
        requestsCount=0;
      }
    }
  }
   
  startBrowserMonitor() {
    // function to run browserMonitor at intervals
    setInterval(this.broswerMonitor.bind(this), 60000);
  }

  async getBrowser() {
    try {
        this.browser = await puppeteer.launch({
        headless: 'new', // Assuming you want to run headless mode
        // headless: false, // Assuming you want to run head mode
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--proxy-server=proxy.packetstream.io:31112',
        ], // Add these arguments
        });
    } catch (error) {
      console.log('Error launching browser: ' + (error.message || error));
      throw new Error(error.message);
    }
  }

  async performMonsterAuth(credentials){
    try{
      const {email, password} = credentials;
      await this.browserSwitch();
      try{
        const page = await this.browser.newPage();
        page.authenticate({
          username: 'cv2career',
          password: '0IwkbXc8mEHu2UKL_country-Australia',
        });

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
            message: 'An error occured. Try again.',
            error_detail: 'email field or password field or signinbutton not on page.',
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
            message:'Monster account verification completed.',
          };
        }
        return {
          data: {status: true},
          message: 'Monster account verification completed.',
        };

      } catch (error) {
        console.error('An error occured', error)
        return {
          data: {status:false},
          message: 'An error occured. Try again.',
          error_detail:error.message,
        }
      }

    } catch (error){
      console.error('An error occured', error)
      return {
        data:{status:false},
        message: 'An error occured. Try again.',
        error_detail: error.message,

      };
    }
  }

  async performJobserveAuth(credentials){
    try{
      const {email, password} = credentials;
      await this.browserSwitch();
      try{
        const page = await this.browser.newPage();
        page.authenticate({
          username: 'cv2career',
          password: '0IwkbXc8mEHu2UKL_country-Australia',
        });
        const signinUrl = 'https://www.jobserve.com/gb/en/Candidate/Login.aspx'
        // go to sigin page
        await page.goto(signinUrl, {timeout:60000});
        const cookieButton=await page.waitForSelector('#PolicyOptInLink')
        if (cookieButton==null){
          return {
            data: {status: false},
            message: 'An error occured. Try again.',
            error_detail:'cookie button not on page.',

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
            message: 'An error occured. Try again',
            error_detail: 'email field or password field or signin button not on page.',
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
            message:'Jobserve account verification completed.',
          };
        }
        return {
          data: {status: true},
          message: 'Jobserve account verification completed.',
        };

      } catch (error) {
        console.error('An error occured: ',error)
        return {
          data:{status:false},
          message:'An error occured. Try again.',
          error_detail:error.message,
        }

      }
    } catch {
      console.error(' An error occured: ', error)
      return {
        data: {status: false},
        message:'An error occured. Try again.',
        error_detail: error.message,
      }
    }
  }

  async performIndeedAuth(credentials){
    try{
      const {email} = credentials;
      await this.browserSwitch();
      try{
        const page = await this.browser.newPage();
        page.authenticate({
          username: 'cv2career',
          password: '0IwkbXc8mEHu2UKL_country-Australia',
        });
        const signinUrl= 'https://secure.indeed.com/auth?hl=en_NG&co=NG&continue=https%3A%2F%2Fng.indeed.com%2F&tmpl=desktop&service=my&from=gnav-util-homepage&jsContinue=https%3A%2F%2Fng.indeed.com%2F&empContinue=https%3A%2F%2Faccount.indeed.com%2Fmyaccess&_ga=2.179854244.107516761.1694862912-1765997225.1680444170'
        // go to sigin page
        await page.goto(signinUrl, {timeout:60000});
        // ensure email input field appears on page
        const emailField=await page.waitForSelector('input[type="email"]')
        if (emailField==null){
          return {
            data: { status: false },
            message: 'An error occured. Try again.',
            error_detail: 'email field not on page.',
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
            message: 'Indeed account verification completed.',
          };
        }
        return {
          data: { status: false },
          message: 'Indeed account verification completed.',
        };

      } catch (error) {
        console.error('An error occured: ',error.message);
        return {
          data: { status: false },
          message: 'An error occured. Try again.',
          error_detail: error.message,

        }
      }
    } catch(error){
      console.error('An error occured: ',error.message);
      return {
        data: { status: false },
        message: 'An error occured. Try again.',
        error_detail: error.message,
      };
    } 
  }

  async performLinkedInAuth(credentials) {
    try {
      const { email, password } = credentials;
      await this.browserSwitch();
      try {
        const page = await this.browser.newPage();
        page.authenticate({
          username: 'cv2career',
          password: '0IwkbXc8mEHu2UKL_country-Australia',
        });
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
            message: 'LinkedIn account verification completed.',
          };
        }
        if (
          page.url() ===
          'https://www.linkedin.com/feed/?trk=homepage-basic_sign-in-submit'
        ) {
          return {
            data: { status: true },
            message: 'LinkedIn account verification completed.',
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
              message: 'LinkedIn account verification completed.',
            };
          } else {
            return {
              data: { status: false },
              message: 'LinkedIn account not verified.',
            };
          }
        }
        return {
          data: { status: true },
          message: 'LinkedIn account verification completed.',
        };
      } catch (error) {
        console.error('An error occurred:', error);
        return {
          data: { status: false },
          message: 'An error occured. Try again.',
          error_detail: error.message,
        };
      }
    } catch (error) {
      console.error('An error occurred:', error);
      return {
        data: { status: false },
        message: 'An error occured. Try again.',
        error_detail: error.message,
      };
    }
  }

}

const app = express();
const port = 3001;

app.use(express.json());
const aggregator = new Aggregator(); // Create an instance of Aggregator.
const mutex = new Mutex(); // define mutex to prevent racing condition of requestsCount variable.
app.post('/aggregator/linkedIn', async (req, res) => {
  try {
    const release = await mutex.acquire();
    requestsCount++;
    release();
    const credentials = req.body;
    const result = await aggregator.performLinkedInAuth(credentials);
    const release2 = await mutex.acquire();
    requestsCount--;
    release2();
    res.json(result);
  } catch (error) {
    console.error('Error performing LinkedIn authentication:', error);
    const release3 = await mutex.require()
    requestsCount--
    release3()
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/aggregator/monster', async(req,res) => {
  try{
    const release = await mutex.acquire();
    requestsCount++;
    release();
    const credentials = req.body;
    const result= await aggregator.performMonsterAuth(credentials);
    const release2 = await mutex.acquire();
    requestsCount--;
    release2();
    res.json(result);
  } catch (error) {
    console.error('Error performing Monster authentication', error);
    const release3 = await mutex.acquire();
    requestsCount--;
    release3();
    res.status(500).json({error: 'Internal Server Error'});
  }
})

app.post('/aggregator/jobserve', async(req,res)=>{
  try{
    const release = await mutex.acquire();
    requestsCount++;
    release();
    const credentials = req.body;
    const result = await aggregator.performJobserveAuth(credentials);
    const release2 = await mutex.acquire();
    requestsCount--;
    release2();
    res.json(result);
  } catch (error) {
    console.error('Error performing Jobserve authentication:', error);
    const release3 = await mutex.acquire();
    requestsCount--;
    release3();
    res.status(500).json({error: 'Internal Server Error'});
  }
})

app.post('/aggregator/indeed', async(req, res) => {
  try {
    const release = await mutex.acquire();
    requestsCount++;
    release();
    const credentials = req.body;
    const result = await aggregator.performIndeedAuth(credentials);
    const release2 = await mutex.acquire();
    requestsCount--;
    release2();
    res.json(result);
  } catch (error) {
    console.error('Error performing Indeed authentication:', error);
    const release3 = await mutex.acquire();
    requestsCount--;
    release3();
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', function (req, res) {
  res.json({ status: false });
});
aggregator.startBrowserMonitor()

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});