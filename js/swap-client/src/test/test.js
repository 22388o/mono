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
  let btcAsset = await driver.findElement(By.className('_coin-select_1caiq_85'));
  await btcAsset.click();

  await wait(500);
  let modal = await driver.findElement(By.className('modal-container'));
  let items = await modal.findElements(By.className('css-1f064cs-MuiGrid-root'));
  await items[3].click();
 
  await wait(500);
  let collModal = await driver.findElement(By.className('modal-container'));
  let ordinals = await collModal.findElements(By.className('css-1y066f1-MuiGrid-root'));
  await ordinals[0].click();

  //Quantity Inputs
  let inputs = await driver.findElements(By.className('_qty-input_1caiq_17'));
  await inputs[0].sendKeys('1');

  await wait(500);
  //Swap Button Click
  let swapBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Swap')]"));
  await swapBtn.click();
 
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
  let btcAssets = await driver1.findElements(By.className('_coin-select_1caiq_85'));
  await btcAssets[1].click();

  await wait(500);
  let modal = await driver1.findElement(By.className('modal-container'));
  let items = await modal.findElements(By.className('css-1f064cs-MuiGrid-root'));
  await items[3].click();
 
  await wait(500);
  let collModal = await driver1.findElement(By.className('modal-container'));
  let ordinals = await collModal.findElements(By.className('css-1y066f1-MuiGrid-root'));
  await ordinals[0].click();

  //Quantity Inputs
  let inputs = await driver1.findElements(By.className('_qty-input_1caiq_17'));
  await inputs[0].sendKeys('1');

  await wait(500);
  //Swap Button Click
  let swapBtn = await driver1.findElement(By.xpath("//button[contains(text(), 'Swap')]"));
  await swapBtn.click();
 
}

main()

main2()