import webdriver from "selenium-webdriver";
const driver = new webdriver.Builder().forBrowser("chrome").build();
const driver1 = new webdriver.Builder().forBrowser("chrome").build();
// Instantiate a web browser page
const By = webdriver.By; // useful Locator utility to describe a query for a WebElement
const wait = (t) => {
  return new Promise((res, rej)=>{
    setTimeout(res, t);
  })
}

async function main(){
  //Connect to the project
  await driver.navigate().to("http://localhost:5173")
  
  //Connect Wallet Button Click
  let res = await driver.findElement(By.id('connect-wallet'));
  await res.click();
  
  await wait(500);
  
  //Alice Click
  let uls = await driver.findElement(By.className('MuiList-root'));
  let lis = await uls.findElements(By.tagName('li'));
  await lis[1].click();

  await wait(500);
  
  
  //Quantity Inputs
  let btcAsset = await driver.findElement(By.className('coin-select'));
  await btcAsset.click();

  await wait(500);
  let modal = await driver.findElement(By.className('modal-container'));
  let items = await modal.findElements(By.className('asset-item'));
  await items[4].click();
/*
  const logs = await driver.manage().logs().get(webdriver.logging.BROWSER);
  console.log(logs);
 */
  let collModal = await driver.findElement(By.className('modal-container'));
  let ordinals = await collModal.findElements(By.className('nft-card'));
  await wait(200);
  await ordinals[0].click();

  //Quantity Inputs
  let inputs = await driver.findElements(By.className('qty-input'));
  await inputs[0].sendKeys('1');

  await wait(500);
  //Swap Button Click
  let swapBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Swap')]"));
  await swapBtn.click();

  await wait(1500);

  let activityList = await driver.findElement(By.className('activitiesContainer'));
  let activities = await activityList.findElements(By.className('activity-item'));
  await activities[0].click();
}



async function main2(){
  //Connect to the project
  await driver1.navigate().to("http://localhost:5173")
  
  //Connect Wallet Button Click
  let res = await driver1.findElement(By.id('connect-wallet'));
  await res.click();
  
  await wait(500);
  
  //Bob Click
  let uls = await driver1.findElement(By.className('MuiList-root'));
  let lis = await uls.findElements(By.tagName('li'));
  await lis[2].click();

  await wait(500);
  
  
  //Quantity Inputs
  let btcAssets = await driver1.findElements(By.className('coin-select'));
  await btcAssets[1].click();

  await wait(500);
  let modal = await driver1.findElement(By.className('modal-container'));
  let items = await modal.findElements(By.className('asset-item'));
  await items[4].click();
 
  await wait(500);
  let collModal = await driver1.findElement(By.className('modal-container'));
  let ordinals = await collModal.findElements(By.className('nft-card'));
  await wait(200);
  await ordinals[0].click();

  //Quantity Inputs
  let inputs = await driver1.findElements(By.className('qty-input'));
  await inputs[0].sendKeys('1');

  await wait(500);
  //Swap Button Click
  let swapBtn = await driver1.findElement(By.xpath("//button[contains(text(), 'Swap')]"));
  await swapBtn.click();
 
  await wait(1500);

  let activityList = await driver1.findElement(By.className('activitiesContainer'));
  let activities = await activityList.findElements(By.className('activity-item'));
  await activities[0].click();
 
}

main()

main2()