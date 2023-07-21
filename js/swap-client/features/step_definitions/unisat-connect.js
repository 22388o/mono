const assert = require('assert');
const { Given, When, Then } = require('@cucumber/cucumber');
const webdriver = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome.js');

const By = webdriver.By;
const options = new chrome.Options();
options.setLoggingPrefs({
  browser: 'ALL'
});
options.addArguments('--enable-logging');
options.addArguments("--log-level=0")
options.addArguments('--window-size=1920,1096')
options.addArguments('--disable-dev-shm-usage');
options.addArguments("--user-data-dir=/Users/dev/Library/Application\ Support/Google/Chrome");
options.addArguments("--profile-directory=Profile 1");

let driver, windows;

const wait = (t) => {
  return new Promise((res, rej)=>{
    setTimeout(res, t);
  })
}

Given('Test Browser is opened - FU', {timeout: 100000}, async () => {
  driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
  await driver.navigate().to("http://localhost:5173")
});

When('Click on Bitcoin Connect Button - FU', {timeout: 100000}, async () => {
  
  let res = await driver.findElement(By.className('connect-bitcoin'));
  await res.click();

  let connectL1 = await driver.findElement(By.id('connect-l1'));
  await connectL1.click();
  await wait(500);
  await driver.switchTo().alert().accept();

  await wait(10000);

  windows = await driver.getAllWindowHandles();
  await driver.switchTo().window(windows[1]); // assuming the extension popup is the second window

  //Unisat control
  const pwdInput = await driver.findElement(By.tagName('input'));
  await pwdInput.sendKeys('TESTPW123');

  const firstDiv = await driver.findElement(By.css('.layout > div:first-child > div:first-child > div:nth-child(2) > div:nth-child(3)'));
  await firstDiv.click();
});

Then('Connect Unisat Wallet - FU', {timeout: 100000}, async () => {
  await wait(2000);

  windows = await driver.getAllWindowHandles();
  if(windows.length === 1) {
    console.log('Unisat Wallet Connected!');
  }
  else {
    await driver.switchTo().window(windows[1]); // assuming the extension popup is the second window

    const approveBtn = await driver.findElement(By.css('.layout > div:nth-child(3) > div:first-child > div:nth-child(2)'));
    await approveBtn.click();
    console.log('Unisat Wallet Connected!');

    await wait(1000);
  }

  const logs = await driver.manage().logs().get('browser');
  const idxLog = logs.findIndex(log => log.message.indexOf("Unisat Wallet Connected") >= 0);
  if(idxLog >= 0) {
    console.log('Address Detected');
    console.log(logs[idxLog].message);
  }

});

Then('Simulate Unisat Payment - FU', {timeout: 100000}, async() => {
  await driver.switchTo().window(windows[0]);

  const modal = await driver.findElement(By.className('connect-modal-color'));
  const simulate = await modal.findElement(By.className('simulate-l1'));
  await simulate.click();

  await driver.quit();
});