const webdriver = require("selenium-webdriver");
const chrome = require('selenium-webdriver/chrome.js');
const path = require('path');
const projDir = path.resolve(__dirname, '../..')

const options = new chrome.Options();
options.setLoggingPrefs({
  browser: 'ALL'
});
options.addArguments('--enable-logging');
options.addArguments("--log-level=0")
options.addExtensions(`${projDir}/src/test/crx/metamask.crx`);

const By = webdriver.By; 
const driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();

const wait = (t) => {
  return new Promise((res, rej)=>{
    setTimeout(res, t);
  })
}


async function main() {
  await driver.navigate().to("http://localhost:5173");

  await wait(2000);

  await driver.switchTo().window((await driver.getAllWindowHandles())[1]);
  await (await driver.findElement(By.className('check-box'))).click(); // Checkbox Accept
  await wait(500);
  await (await driver.findElement(By.className('btn-primary'))).click(); // Accept Button
  await wait(500);
  await (await driver.findElement(By.className('btn-primary'))).click(); // Create button
  await wait(500);
  const pwdInputs = await driver.findElements(By.className('form-field__input')); // Input Passwords
  await pwdInputs[0].sendKeys('TESTPW123');
  await pwdInputs[1].sendKeys('TESTPW123');
  await (await driver.findElement(By.className('check-box'))).click(); // Next
  await wait(500);
  await (await driver.findElement(By.className('btn-primary'))).click(); // Skip the Backup step
  await wait(500);
  await (await driver.findElement(By.className('mm-button-base'))).click();
  await wait(500);
  await (await driver.findElement(By.className('skip-srp-backup-popover__checkbox'))).click();
  await wait(500);
  await (await (await driver.findElement(By.className('skip-srp-backup-popover__footer'))).findElements(By.tagName('button')))[1].click();
  await wait(500);
  await (await driver.findElement(By.className('btn-primary'))).click(); // Next
  await wait(500);
  await (await driver.findElement(By.className('btn-primary'))).click(); // Done
  await wait(500);
  await (await driver.findElement(By.className('btn-primary'))).click(); // Close
  await driver.close();

  await driver.switchTo().window((await driver.getAllWindowHandles())[0]);

  let res = await driver.findElement(By.className('connect-ethereum'));
  await res.click();

  let connectLightning = await driver.findElement(By.id('connect-metamask'));
  await connectLightning.click();

  await wait(2000);

  let windows = await driver.getAllWindowHandles();
  await driver.switchTo().window(windows[1]); // assuming the extension popup is the second window

  //Metamask control
  /*const pwdInput = await driver.findElement(By.tagName('input'));
  await pwdInput.sendKeys('TESTPW123');

  const buttons = await driver.findElements(By.tagName('button'));
  await buttons[0].click();*/

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

  await driver.switchTo().window(windows[0]);
}

main();
