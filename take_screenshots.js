const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const url = 'https://weatherappdhanshree.up.railway.app/';

  // Wait for the app to load
  await page.goto(url, { waitUntil: 'networkidle0' });

  // Screenshot 1: Home page (initial)
  await page.screenshot({ path: 'screenshot_home.png' });

  // Search for a city to populate data
  await page.type('.search-input', 'Mumbai');
  await page.click('.search-button');

  // Wait for the data to load
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshot_weather.png' });

  // Navigate to AQI
  await page.click('a[href="/aqi"]');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshot_aqi.png' });

  // Navigate to Allergies
  await page.click('a[href="/allergies"]');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshot_allergies.png' });

  await browser.close();
  console.log('Screenshots captured!');
})();
