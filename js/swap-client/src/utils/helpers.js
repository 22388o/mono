import { toast } from "react-toastify"

export const SWAP_STATUS = [
  'Submitting order',
  'Finding match',
  'Swap matched',
  'Holder Invoice Created',
  'Holder Invoice Sent',
  'Seeker Invoice Created',
  'Seeker Invoice Sent',
  'Holder Invoice Paid',
  'Seeker Invoice Paid',
  'Holder Invoice Settled',
  'Seeker Invoice Settled',
  'Completed'
]

export const getStringFromDate = (date) => {
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return month[date.month] + ' ' + date.day + ', ' + (date.year - 2000)
}

export const hashSecret = async function hash (bytes) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
  console.log('hashBuffer', hashBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  console.log('hashArray', hashArray)
  const hashHex = hashArray
    .map(bytes => bytes.toString(16).padStart(2, '0'))
    .join('')
  console.log('hashHex', hashHex)
  return hashHex
}

export const toWei = (num) => { return num * 1000000000000000000 }
export const fromWei = (num) => { return num / 1000000000000000000 }
export const toSats = (num) => { return num * 100000000 }
export const fromSats = (num) => { return num / 100000000 }

export const log = (message, obj, title = 'SwapCreate') => {
  console.log(message + ` (${title})`)
  if (obj) console.log(obj)
}

export const validateInvoiceAddress = (addr) => {
  return addr && addr.length > 6
}


export const toastSuccess = (msg) => {
  toast.success(
    msg,
    {
      theme: 'colored',
      autoClose: 1000
    }
  )
}

export const toastError = (msg) => {
  toast.error(
    msg,
    {
      theme: 'colored',
      autoClose: 1000
    }
  )
}

export function formatNumber(num) {
  const numStr = num.toString();
  const arr = numStr.split('.');
  const numArr = arr[0].split('');
  numArr.reverse();

  for (let i = 3; i < numArr.length; i += 4) {
    numArr.splice(i, 0, ',');
  }
  const formattedNum = numArr.reverse().join('');
  
  if(arr.length === 1) return formattedNum;
  return [formattedNum, arr[1]].join('.');
}

const contracts = {
  "Swap": {
    "abi": [
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "swap",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "payee",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "asset",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "quantity",
            "type": "uint256"
          }
        ],
        "name": "InvoiceCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "swap",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "payer",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "asset",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "quantity",
            "type": "uint256"
          }
        ],
        "name": "InvoicePaid",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "indexed": true,
            "internalType": "bytes32",
            "name": "swap",
            "type": "bytes32"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "payer",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "payee",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "asset",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "quantity",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "bytes32",
            "name": "secret",
            "type": "bytes32"
          }
        ],
        "name": "InvoiceSettled",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "swap",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "asset",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "quantity",
            "type": "uint256"
          }
        ],
        "name": "createInvoice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "id",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "swap",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "asset",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "quantity",
            "type": "uint256"
          }
        ],
        "name": "payInvoice",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "secret",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "swap",
            "type": "bytes32"
          }
        ],
        "name": "settleInvoice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    "address": "0xbc6BBA2C03cf91D06CD63BEA79238E0eEd330766"
  }
};

export function getConfig(id) {
  const configs = { alice: {
    network: { hostname: '127.0.0.1', port: 18080 },
    store: {},
    blockchains: {
      ethereum: {
        url: 'ws://127.0.0.1:8545',
        chainId: '0x539',
        contracts: contracts,
        public: '0xf2428eed4b298829f7dc7630773e20b624ecc6b9',
        private: '3a02ea4a98d8c154486b1217263b7dcb78b5e6ff15e40dcd1a664d3f31ca0386'
      },
      lightning: {
        hostname: '127.0.0.1',
        port: 11001,
        cert: '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d49494377444343416d61674177494241674952414b78545166764356785043693149504e75745563576f77436759494b6f5a497a6a3045417749774d6a45660a4d4230474131554543684d576247356b494746316447396e5a57356c636d46305a57516759325679644445504d4130474131554541784d4764574a31626e52310a4d4234584454497a4d5445774f4441774d5467794e566f58445449314d4445774d6a41774d5467794e566f774d6a45664d4230474131554543684d576247356b0a494746316447396e5a57356c636d46305a57516759325679644445504d4130474131554541784d4764574a31626e52314d466b77457759484b6f5a497a6a30430a415159494b6f5a497a6a3044415163445167414534543377304658526b5863307154326166793170484c4569724d416f7344536b3137736362622f74334170680a39384e685162455136593951547238526971783341686b7551644b4939516f5164694c4a6a644b2b43614f4341567377676746584d41344741315564447745420a2f775145417749437044415442674e56485355454444414b4267677242674546425163444154415042674e5648524d4241663845425441444151482f4d4230470a4131556444675157424251356b58436d53644561654d3550387935445862776b77444534635443422f77594456523052424948334d49483067675a31596e56750a6448574343577876593246736147397a64494945645735706549494b64573570654842685932746c64494948596e566d59323975626f634566774141415963510a414141414141414141414141414141414141414141596345774b68736749634572424d41415963457242514141596345724249414159634572424541415963510a2f6f414141414141414142704256543337734b74645963512f6f41414141414141414141516e582f2f6c4b68553463512f6f41414141414141414141516f582f0a2f6b2b65385963512f6f414141414141414141303647662f2f72385a4e5963512f6f41414141414141414145766f372f2f746834743463512f6f4141414141410a4141413441646a2f2f737161476f63512f6f41414141414141414255414d722f2f673670393463512f6f414141414141414142737742762f2f7659677344414b0a42676771686b6a4f5051514441674e494144424641694277725667494d777148766c676c472f71435a627077634d4e7238674b38614b647375723867777832790a5367496841496d5a50644a5964494475706d66725334755744522b563155684b742f6f676348746834754d39634f61690a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a',
        admin: '0201036c6e6402f801030a107f6435096b6630e66d412fcabe8f1e011201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e65726174651204726561640000062091d78bd650f1aebf7376b0836ed15a600ad63ec186e379bda5bd98be2300f959',
        invoice: '0201036c6e640258030a107d6435096b6630e66d412fcabe8f1e011201301a160a0761646472657373120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e1204726561640000062038d2e062163314e592f92c7293245660fd0474c81956c48b98ea92aced078fd8'
      }
    },
    dex: {},
    swaps: {},
    id: 'alice'
  }, bob: 
  {
    network: { hostname: '127.0.0.1', port: 18080 },
    store: {},
    blockchains: {
      ethereum: {
        url: 'ws://127.0.0.1:8545',
        chainId: '0x539',
        contracts: contracts,
        public: '0x6df27c098c72e5cb0476218d61f56d2a470c7484',
        private: '8bd89791d14d639e8e8c844eb044c2da766a124fcdc4e6b44741b4c123958356'
      },
      lightning: {
        hostname: '127.0.0.1',
        port: 11002,
        cert: '2d2d2d2d2d424547494e2043455254494649434154452d2d2d2d2d0a4d49494377444343416d61674177494241674952414e686566323742497437414f4e7963622b6d7a32715977436759494b6f5a497a6a3045417749774d6a45660a4d4230474131554543684d576247356b494746316447396e5a57356c636d46305a57516759325679644445504d4130474131554541784d4764574a31626e52310a4d4234584454497a4d5445774f4441774d5467794f566f58445449314d4445774d6a41774d5467794f566f774d6a45664d4230474131554543684d576247356b0a494746316447396e5a57356c636d46305a57516759325679644445504d4130474131554541784d4764574a31626e52314d466b77457759484b6f5a497a6a30430a415159494b6f5a497a6a304441516344516741454b646157656c526e2f355761772f3073467a5435424b7657785777767037315a344836796f4b686f467a75360a43644d5278724a304e6146463357332f566942655a524f346361586358317079646d683246655867454b4f4341567377676746584d41344741315564447745420a2f775145417749437044415442674e56485355454444414b4267677242674546425163444154415042674e5648524d4241663845425441444151482f4d4230470a41315564446751574242514e37634956622b74737858426648634c48634d784e4b7349504d7a43422f77594456523052424948334d49483067675a31596e56750a6448574343577876593246736147397a64494945645735706549494b64573570654842685932746c64494948596e566d59323975626f634566774141415963510a414141414141414141414141414141414141414141596345774b68736749634572424d41415963457242514141596345724249414159634572424541415963510a2f6f414141414141414142704256543337734b74645963512f6f41414141414141414141516e582f2f6c4b68553463512f6f41414141414141414141516f582f0a2f6b2b65385963512f6f414141414141414141303647662f2f72385a4e5963512f6f41414141414141414145766f372f2f746834743463512f6f4141414141410a4141413441646a2f2f737161476f63512f6f41414141414141414255414d722f2f673670393463512f6f414141414141414142737742762f2f7659677344414b0a42676771686b6a4f5051514441674e494144424641694141355732522f2b6c414a6967462f5a576457306a5363474e30486d2f634b56694575485372366572470a64414968414f65573739457751334a634b365870376a394977387939434131494e6970485748494c4d666244755635430a2d2d2d2d2d454e442043455254494649434154452d2d2d2d2d0a',
        admin: '0201036c6e6402f801030a1001c0c8a8377f2ca0941f09b7d197b7181201301a160a0761646472657373120472656164120577726974651a130a04696e666f120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a210a086d616361726f6f6e120867656e6572617465120472656164120577726974651a160a076d657373616765120472656164120577726974651a170a086f6666636861696e120472656164120577726974651a160a076f6e636861696e120472656164120577726974651a140a057065657273120472656164120577726974651a180a067369676e6572120867656e6572617465120472656164000006209f02ee4fed4c3340d6071da0acda87137a8e09e3836baf7201953f140a0d0165',
        invoice: '0201036c6e640258030a10ffbfc8a8377f2ca0941f09b7d197b7181201301a160a0761646472657373120472656164120577726974651a170a08696e766f69636573120472656164120577726974651a0f0a076f6e636861696e12047265616400000620cf5bdfbc4690d62396b8a40c1f50b060f4a2122c55ad020ad1d21dfed829e773'
      }
    },
    dex: {},
    swaps: {},
    id: 'bob'
  }};
  return configs[id];
}