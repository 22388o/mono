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

Given('Test Browser is opened - FM', {timeout: 100000}, async () => {
  driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
  await driver.navigate().to("http://localhost:5173")
});

When('Click on Ethereum Connect Button - FM', {timeout: 100000}, async () => {
  
  let res = await driver.findElement(By.className('connect-ethereum'));
  await res.click();

  let connectLightning = await driver.findElement(By.id('connect-metamask'));
  await connectLightning.click();

  await wait(5000);

  let windows = await driver.getAllWindowHandles();
  await driver.switchTo().window(windows[1]); // assuming the extension popup is the second window

  //Unisat control
  const pwdInput = await driver.findElement(By.tagName('input'));
  await pwdInput.sendKeys('TESTPW123');

  const buttons = await driver.findElements(By.tagName('button'));
  await buttons[0].click();

});

Then('Connect Metamask Wallet - FM', {timeout: 100000}, async () => {
  await wait(2000);

  windows = await driver.getAllWindowHandles();
  if(windows.length === 1) {
    console.log('Metamask Wallet Connected!');
  }
  else {
    await driver.switchTo().window(windows[1]); // assuming the extension popup is the second window

    let footer = await driver.findElement(By.className('page-container__footer'));
    let approveBtn = await footer.findElements(By.tagName('button'));
    await approveBtn[1].click();

    footer = await driver.findElement(By.className('page-container__footer'));
    approveBtn = await footer.findElements(By.tagName('button'));
    await approveBtn[1].click();
    console.log('Metamask Wallet Connected!');

    await wait(1000);
  }

  const logs = await driver.manage().logs().get('browser');
  const idxLog = logs.findIndex(log => log.message.indexOf("Metamask Wallet Connected") >= 0);
  if(idxLog >= 0) {
    console.log('Address Detected');
    console.log(logs[idxLog].message);
  }

  await driver.quit();
});
