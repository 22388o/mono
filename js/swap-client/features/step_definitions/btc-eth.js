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
//options.addArguments('--headless');
options.addArguments('--window-size=1920,1096')
options.addArguments('--disable-dev-shm-usage');

let alice, bob;

const wait = (t) => {
  return new Promise((res, rej)=>{
    setTimeout(res, t);
  })
}

Given('Alice browser is opened', {timeout: 10000}, async () => {
  alice = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
  await alice.navigate().to("http://localhost:5173")
});

Given('Bob browser is opened', {timeout: 10000}, async () => {
  bob = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();
  await bob.navigate().to("http://localhost:5173")
});

When('Alice clicks on login', {timeout: 10000}, async () => {
  let res = await alice.findElement(By.id('connect-wallet'));
  await res.click();
  
  await wait(500);
  
  //Alice Click
  let uls = await alice.findElement(By.className('MuiList-root'));
  let lis = await uls.findElements(By.tagName('li'));
  await lis[1].click();

  await wait(500);
});

When('Bob clicks on login', {timeout: 10000}, async () => {
  let res = await bob.findElement(By.id('connect-wallet'));
  await res.click();
  
  await wait(500);
  
  //bob Click
  let uls = await bob.findElement(By.className('MuiList-root'));
  let lis = await uls.findElements(By.tagName('li'));
  await lis[2].click();

  await wait(500);
});

Then('Alice logs in', async () => {
  const logs = await alice.manage().logs().get('browser');
  const idxLog = logs.findIndex(log => log.message.indexOf("Client Websocket initialized") >= 0);
  assert.ok(idxLog >= 0, 'Alice is not logged in');
})

Then('Bob logs in', async () => {
  const logs = await bob.manage().logs().get('browser');
  const idxLog = logs.findIndex(log => log.message.indexOf("Client Websocket initialized") >= 0);
  assert.ok(idxLog >= 0, 'Bob is not logged in');
});

Given('Alice & Bob is logged in', () => {
  return 'success';
});

When('Alice creates an order from BTC to ETH', {timeout: 100000}, async() => {
  
  //Quantity Inputs
  let inputs = await alice.findElements(By.className('qty-input'));
  await inputs[0].sendKeys('1');
  await inputs[1].sendKeys('2');

  await wait(500);
  //Swap Button Click
  let swapBtn = await alice.findElement(By.xpath("//button[contains(text(), 'Swap')]"));
  await swapBtn.click();

  await wait(1500);

  let activityList = await alice.findElement(By.className('activitiesContainer'));
  let activities = await activityList.findElements(By.className('activity-item'));
  await activities[0].click();
});

When('Bob creates an order from ETH to BTC', {timeout: 100000}, async () => {

  let excBtn = await bob.findElement(By.className('exchange'));
  await excBtn.click();
   
  
  //Quantity Inputs
  let inputs = await bob.findElements(By.className('qty-input'));
  await inputs[0].sendKeys('2');
  await inputs[1].sendKeys('1');

  await wait(500);
  //Swap Button Click
  let swapBtn = await bob.findElement(By.xpath("//button[contains(text(), 'Swap')]"));
  await swapBtn.click();
 
  await wait(1500);

  let activityList = await bob.findElement(By.className('activitiesContainer'));
  let activities = await activityList.findElements(By.className('activity-item'));
  await activities[0].click();
});

Then('Swap fills and completes', {timeout: 100000}, async () => {
  await wait(10000);
  return 'success'
});