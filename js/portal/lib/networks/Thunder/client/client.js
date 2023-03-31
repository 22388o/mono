const ChannelClient = require('./ChannelClient');

let envVars = {
    keypairIndex: "KEYPAIR_INDEX",
    keypairFile: "PORTAL_THUNDER_KEYPAIR_FILE",
    rpcPort: "PORTAL_THUNDER_PORT",
    ethRpcUrl: "PORTAL_ETHEREUM_URL",
    ethChainId: "PORTAL_ETHEREUM_NETWORKID",
}

let keys = null;
let rpc_port = null;
let keypairIndex = process.env[envVars.keypairIndex];
let keypairFile = process.env[envVars.keypairFile];

if(keypairIndex){
    const keypairs = require('./keypairs.js');
    keys = keypairs[keypairIndex];
    rpc_port = 3000 + parseInt(keypairIndex); 
}else if(keypairFile){
    let json = fs.readFileSync(keypairFile, 'utf8');
    let keys = JSON.parse(json);
    let l2keys = keys.ethl2;
    keys = {
        private: l2keys.private,
        address: l2keys.public,
    };
}

let eth_rpc_url = process.env[envVars.ethRpcUrl];
let eth_chain_id = process.env[envVars.ethChainId];

if(!eth_rpc_url || !eth_chain_id){
    try{
        let config = require('./config.js');
        eth_rpc_url = config.web3.goerli.rpc_url;
        eth_chain_id = config.web3.goerli.chain_id;
    }catch(ex){}
}

if(process.env[envVars.rpcPort]) rpc_port = process.env[envVars.rpcPort];

let notProvidedPrefix = `Please provide ENV variables: `;

if(!keys) throw(notProvidedPrefix + `${envVars.keypairFile} or ${envVars.keypairIndex}`);
if(!rpc_port) throw(notProvidedPrefix + envVars.rpcPort);
if(!eth_rpc_url) throw(notProvidedPrefix + envVars.ethRpcUrl);
if(!eth_chain_id) throw(notProvidedPrefix + envVars.ethChainId);

let client = new ChannelClient({ 
    keypair: keys, 
    rpc: eth_rpc_url, 
    chainId: eth_chain_id,
});
client.connect();

setTimeout(() => {
    client.setupRpc({port: rpc_port});
}, 2000);






