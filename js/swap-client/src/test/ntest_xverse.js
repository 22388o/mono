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
options.addExtensions(`${projDir}/src/test/crx/xverse.crx`);

const By = webdriver.By; 
const driver = new webdriver.Builder().forBrowser("chrome").setChromeOptions(options).build();

const wait = (t) => {
  return new Promise((res, rej)=>{
    setTimeout(res, t);
  })
}


async function main() {
  await driver.navigate().to("http://localhost:5173");
  /** 
   * Create Xverse Wallet 
   */
  let res = await driver.findElement(By.className('connect-bitcoin'));
  await res.click();

  let connectLightning = await driver.findElement(By.id('connect-l1'));
  await connectLightning.click();
  await wait(500);
  await driver.switchTo().alert().sendKeys("2");
  await driver.switchTo().alert().accept();

  await wait(2000);

  let windows = await driver.getAllWindowHandles();
  await driver.switchTo().window(windows[1]); // assuming the extension popup is the second window

  await (await driver.findElements(By.tagName('button')))[0].click();

  await wait(2000); 

  /** Create Xverse Wallet Window opened */
  await driver.switchTo().window((await driver.getAllWindowHandles())[2]);
  await (await driver.findElements(By.tagName('button')))[1].click(); /** Next button */
  await wait(500);
  await (await driver.findElements(By.tagName('button')))[1].click(); /** Next button */
  await wait(500);
  await (await driver.findElements(By.tagName('button')))[0].click(); /** Continue button */
  await wait(500);
  await (await driver.findElements(By.tagName('button')))[0].click(); /** Accept button */
  await wait(500);
  await (await driver.findElements(By.tagName('button')))[0].click(); /** Backup Later button */
  await wait(500);
  await (await driver.findElements(By.tagName('input')))[0].sendKeys('TESTPW123'); /** Password Input */
  await wait(500);
  await (await driver.findElements(By.tagName('button')))[2].click();
  await wait(500);
  await (await driver.findElements(By.tagName('input')))[0].sendKeys('TESTPW123'); /** Password Confirm */
  await wait(500);
  await (await driver.findElements(By.tagName('button')))[2].click(); /** Confirm Button */
  await wait(2000);
  await (await driver.findElements(By.tagName('button')))[0].click(); /** Close Create Window */

  /** Connect Xverse Wallet Button */

  await wait(2000);
  await driver.switchTo().window((await driver.getAllWindowHandles())[1]);
  await driver.close();
  await driver.switchTo().window((await driver.getAllWindowHandles())[0]);

  connectLightning = await driver.findElement(By.id('connect-l1'));
  await connectLightning.click();
  await wait(500);
  await driver.switchTo().alert().sendKeys("2");
  await driver.switchTo().alert().accept();

  await wait(2000);
  await driver.switchTo().window((await driver.getAllWindowHandles())[1]);

  //Xverse control
  const pwdInput = await driver.findElement(By.tagName('input'));
  await pwdInput.sendKeys('TESTPW123');

  const loginBtn = (await driver.findElements(By.tagName('button')))[1];
  await loginBtn.click();

  await wait(15000);

  windows = await driver.getAllWindowHandles();
  if(windows.length === 1) {
    console.log('Xverse Wallet Connected!');
  }
  else {
    await driver.switchTo().window(windows[1]); // assuming the extension popup is the second window

    const approveBtn = (await driver.findElements(By.tagName('button')))[2];
    await approveBtn.click();
    console.log('Xverse Wallet Connected!');

    await wait(1000);
  }

  try {
    const logs = await driver.manage().logs().get('browser');
    const idxLog = logs.findIndex(log => log.message.indexOf("Xverse Wallet Connected") >= 0);
    if(idxLog >= 0) {
      console.log('Address Detected');
      console.log(logs[idxLog].message);
    }
  } catch (e) {

  }

  await driver.switchTo().window(windows[0]);

  const modal = await driver.findElement(By.className('connect-modal-color'));
  const simulate = await modal.findElement(By.className('simulate-l1'));
  await simulate.click();

  await wait(3000);

  windows = await driver.getAllWindowHandles();
  await driver.switchTo().window(windows[1]); // assuming the extension popup is the second window
  
  try {
    const approveBtn = await driver.findElement(By.className('iwDLzk'));
    const text = await approveBtn.getText();
    if(text.indexOf('Close') === -1) {
      await approveBtn.click();
    }
    else {
      await approveBtn.click();
      throw new Error('Insufficient Balance!');
    }
    console.log('Payment Simulation Done!');
  } catch (e) {
    console.error('Error occured on payment!');
  }
}

main();
