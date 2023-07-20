import webdriver from "selenium-webdriver";
const driver = new webdriver.Builder().forBrowser("chrome").build();
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
  let inputs = await driver.findElements(By.className('_qty-input_1caiq_17'));
  await inputs[0].sendKeys('1');
  await inputs[1].sendKeys('2');

  await wait(500);
  
  //Swap Button Click
  let swapBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Swap')]"));
  await swapBtn.click();
}

main()
