const Helpers = require('./lib/index.js');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const OUT_DIR_PATH =  path.join(__dirname, 'dist');
const OUT_ABI_DIR_PATH = path.join(OUT_DIR_PATH, 'abi');
const OUT_PORTAL_DIR_PATH = path.join(OUT_DIR_PATH, 'portal');

// Initialize compilation
Helpers.compile()
  // Ensure dist/ directory exists and is empty
  .then(contracts => {
    if (fs.existsSync(OUT_DIR_PATH)) {
      rimraf.sync(OUT_DIR_PATH);
    }
    fs.mkdirSync(OUT_DIR_PATH, { recursive: true });
    fs.mkdirSync(OUT_ABI_DIR_PATH, { recursive: true });
    fs.mkdirSync(OUT_PORTAL_DIR_PATH, { recursive: true });
    return contracts;
  })
  // Reduce the contract information
  .then(contracts => {
    console.log('Contracts compilation succeeded.');
    let reducedContracts = {};
    let portalContracts = {};
    for (const [fileName, attributes] of Object.entries(contracts)) {
      const contractName = path.basename(fileName, path.extname(fileName));
      reducedContracts[contractName] = attributes[contractName];
      if (Helpers.CONTRACTS.includes(contractName))
        portalContracts[contractName] = { "abi": attributes[contractName]["abi"], "address": "" };
    }
    return { contracts: reducedContracts, portalContracts };
  })
  // Write to separate files for each inner contract
  .then(({ contracts, portalContracts }) => {
    for (const [contractName, contractData] of Object.entries(contracts)) {
      const filePath = path.join(OUT_ABI_DIR_PATH, `${contractName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2));
    }

    for (const [contractName, contractData] of Object.entries(portalContracts)) {
      const filePath = path.join(OUT_PORTAL_DIR_PATH, `${contractName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2));
    }
  })
  // Handle errors
  .catch(err => {
    console.log('Contracts compilation failed.');
    console.log(err);
    process.exit(1);
  });
