const Helpers = require('./lib/index.js');
const fs = require('fs');
const path = require('path');

const OUT_FILE = "abi.json";
const OUT_DIR_PATH = path.join(__dirname, 'dist', OUT_FILE);

// Initialize compilation
Helpers.compile()
  // Reduce the contract information
  .then(contracts => {
    console.log('Contracts compilation succeeded.');
    let reducedContracts = {};
    for (const [fileName, attributes] of Object.entries(contracts)) {
      const contractName = path.basename(fileName, path.extname(fileName));
      if (Helpers.CONTRACTS.includes(contractName))
        reducedContracts[contractName] = { "abi": attributes[contractName]["abi"] };
    }
    return reducedContracts;
  })
  // Ensure dist/ directory exists
  .then(contracts => {
    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath);
    }
    return contracts;
  })
  // Write to file
  .then(contracts => {
    fs.writeFileSync(OUT_DIR_PATH, JSON.stringify(contracts, null, 2));
  })
  // Handle errors
  .catch(err => {
    console.log('Contracts compilation failed.');
    console.log(err);
    process.exit(1);
  });
