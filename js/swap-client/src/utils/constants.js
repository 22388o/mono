//import * as alice from '../../../portal/config/alice.json'
//import * as bob from '../../../portal/config/bob.json'

export const CHAIN_INFO = {
  'BTC': {
    url: 'https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/bitcoin/info/logo.png?raw=true',
    name: 'Bitcoin'
  }, 
  'ETH': {
    url: 'https://github.com/dapphub/trustwallet-assets/blob/master/blockchains/ethereum/info/logo.png?raw=true',
    name: 'Ethereum'
  }
}

export const getAlice = () => {
  return {
    "lightning": {
      "socket": "localhost:10001",
      "cert": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNKakNDQWMyZ0F3SUJBZ0lSQUxqUStqblRWSDV5WnFMLy9iWldPRmt3Q2dZSUtvWkl6ajBFQXdJd01URWYKTUIwR0ExVUVDaE1XYkc1a0lHRjFkRzluWlc1bGNtRjBaV1FnWTJWeWRERU9NQXdHQTFVRUF4TUZZV3hwWTJVdwpIaGNOTWpNd01UQTBNVFl4TkRNM1doY05NalF3TWpJNU1UWXhORE0zV2pBeE1SOHdIUVlEVlFRS0V4WnNibVFnCllYVjBiMmRsYm1WeVlYUmxaQ0JqWlhKME1RNHdEQVlEVlFRREV3VmhiR2xqWlRCWk1CTUdCeXFHU000OUFnRUcKQ0NxR1NNNDlBd0VIQTBJQUJEOG9vdFR5Nm0zWDN0c1ZNTloyMjlSdnBPcjdxSnZLaHFHN09Ea1QyWEJBbFBsbApQUlRNVUh5dFA4VmN2bW51TERnTnY4aVRxN1hYd2tYWkI5Mm9WRU9qZ2NVd2djSXdEZ1lEVlIwUEFRSC9CQVFECkFnS2tNQk1HQTFVZEpRUU1NQW9HQ0NzR0FRVUZCd01CTUE4R0ExVWRFd0VCL3dRRk1BTUJBZjh3SFFZRFZSME8KQkJZRUZNWmM4YUhOMnRLOUJJWkdiaTFBYWlaU3B1Wk1NR3NHQTFVZEVRUmtNR0tDQldGc2FXTmxnZ2xzYjJOaApiR2h2YzNTQ0JXRnNhV05sZ2c1d2IyeGhjaTF1TVMxaGJHbGpaWUlFZFc1cGVJSUtkVzVwZUhCaFkydGxkSUlIClluVm1ZMjl1Ym9jRWZ3QUFBWWNRQUFBQUFBQUFBQUFBQUFBQUFBQUFBWWNFckJNQUFqQUtCZ2dxaGtqT1BRUUQKQWdOSEFEQkVBaUI2SUlLSVZiWG40UnhoWEZ2ZWhSY1pkdGZMUkZndEVaYzArb2xYWjFuUnl3SWdQQUl4ZkdQQwpJQjhHWDRMVVU1ekNyOUNNUTByUkZLSkFPUGJqMndmY0NsYz0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=",
      "admin": "AgEDbG5kAvgBAwoQS8eFVqksJiYPlNVamUCpEhIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYg01JRbtJdiPTXLN3/BMqsR85PkTS7VPsRy/D9Agwg0oU=",
      "invoice": "AgEDbG5kAlgDChBJx4VWqSwmJg+U1VqZQKkSEgEwGhYKB2FkZHJlc3MSBHJlYWQSBXdyaXRlGhcKCGludm9pY2VzEgRyZWFkEgV3cml0ZRoPCgdvbmNoYWluEgRyZWFkAAAGIBNQFE2B207D5lcgfNZpsJzIpkexuQoK5Ob6eP6DskfT"
    },
    "ethl2": {
      "public": "0xb7f337B1244709aafd9baf50057eD0df934f2076",
      "private": "0a4beb249e3302806f5616f32d12907dd5eadc4406546a3fc2c06758f1787017"
    }
  }
}

export const getBob = () => {
  return {
    "lightning": {
      "socket": "localhost:10002",
      "cert": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNIRENDQWNLZ0F3SUJBZ0lRUXR3L2JtMGc5M2o5TTd2UnVBOExNekFLQmdncWhrak9QUVFEQWpBdk1SOHcKSFFZRFZRUUtFeFpzYm1RZ1lYVjBiMmRsYm1WeVlYUmxaQ0JqWlhKME1Rd3dDZ1lEVlFRREV3TmliMkl3SGhjTgpNak13TVRBME1UWXhORE0zV2hjTk1qUXdNakk1TVRZeE5ETTNXakF2TVI4d0hRWURWUVFLRXhac2JtUWdZWFYwCmIyZGxibVZ5WVhSbFpDQmpaWEowTVF3d0NnWURWUVFERXdOaWIySXdXVEFUQmdjcWhrak9QUUlCQmdncWhrak8KUFFNQkJ3TkNBQVJSZG1Dd3loRGVqbmVCeThaZlNyU1JnZWNYZkhaekZ1MVM4UzFSTlZaaDlSU3VyY0Jkc01uUQo5ajJFSTNjWVFxUEFScFBmMjRjL2V3Z0JUSnVkUWVVNm80Ry9NSUc4TUE0R0ExVWREd0VCL3dRRUF3SUNwREFUCkJnTlZIU1VFRERBS0JnZ3JCZ0VGQlFjREFUQVBCZ05WSFJNQkFmOEVCVEFEQVFIL01CMEdBMVVkRGdRV0JCVGcKVXF4dmE4Nk82YWJER1JSR0IrUzB0TDlZSGpCbEJnTlZIUkVFWGpCY2dnTmliMktDQ1d4dlkyRnNhRzl6ZElJRApZbTlpZ2d4d2IyeGhjaTF1TVMxaWIyS0NCSFZ1YVhpQ0NuVnVhWGh3WVdOclpYU0NCMkoxWm1OdmJtNkhCSDhBCkFBR0hFQUFBQUFBQUFBQUFBQUFBQUFBQUFBR0hCS3dUQUFRd0NnWUlLb1pJemowRUF3SURTQUF3UlFJZ1lJUUYKSjMxYmYzTUhIL1NLQkJjYmtEN0lCTHpmbjFKSDg5VmRvcGtMSkNZQ0lRRHhEWUJrRW5uTDJ5WC9lZHozalVlMgpSelRldkV4L3o0aVlPVW1tMUhTUmRBPT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=",
      "admin": "AgEDbG5kAvgBAwoQLV7kucfxJGGXbRbwkzivMxIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgkJYyCRuI5D9Klab5lsUAY1cpArqHaL0LHEN0PZEX/BY=",
      "invoice": "AgEDbG5kAlgDChArXuS5x/EkYZdtFvCTOK8zEgEwGhYKB2FkZHJlc3MSBHJlYWQSBXdyaXRlGhcKCGludm9pY2VzEgRyZWFkEgV3cml0ZRoPCgdvbmNoYWluEgRyZWFkAAAGIDPksBM/tzDZfdswhfIsQbmludPbEGlaVipnCfzAlqKQ"
    },
    "ethl2": {
      "public": "0xD38099E977f17E39EC84b6d7807A6E0e81885144",
      "private": "c69bcf276bd8b53497150b793cf2661a078eb8ee3925ea534e943da27148f74f"
    }
  }
}

export const WALLETS = [{
  title: 'Rainbow',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Uniswap',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/32a77b79-ffe8-42c3-61a7-3e02e019ca00?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Trust Wallet',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/0528ee7e-16d1-4089-21e3-bbfb41933100?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Binance',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/ebac7b39-688c-41e3-7912-a4fefba74600?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Argent',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/215158d2-614b-49c9-410f-77aa661c3900?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Metamask',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/5195e9db-94d8-4579-6f11-ef553be95100?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Safe',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/a1cb2777-f8f9-49b0-53fd-443d20ee0b00?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Gnosis Safe Multising',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/0b7e0f05-0a5b-4f3c-315d-59c1c4c22c00?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Zapper',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/94b7adda-4a61-4895-17a7-1c6023ab4900?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'im Token',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/497781c4-ee1c-4087-c73a-0147b3a8d800?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Zerion',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/f216b371-96cf-409a-9d88-296392b85800?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Coin98',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/fc460647-ea95-447a-99f0-1bff8fa4be00?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Ledger Wallet',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/a7f416de-aa03-4c5e-3280-ab49269aef00?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Wallet 3',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/34ab7558-9e64-4436-f4e6-9069f2533d00?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Exodus',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/4c16cad4-cac9-4643-6726-c696efaf5200?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Zengo Wallet',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/cfc07342-23ea-4f3f-f071-ec9d2cd86b00?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'AlphaWallet',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/5b1cddfb-056e-4e78-029a-54de5d70c500?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Math Wallet',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/26a8f588-3231-4411-60ce-5bb6b805a700?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Ambire Wallet',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/c39b3a16-1a38-4588-f089-cb7aeb584700?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Infinity Wallet',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/9f259366-0bcd-4817-0af9-f78773e41900?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Spot Wallet',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/1bf33a89-b049-4a1c-d1f6-4dd7419ee400?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: '1inch Wallet',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/dce1ee99-403f-44a9-9f94-20de30616500?projectId=2f05ae7f1116030fde2d36508f472bfb'
}, {
  title: 'Coinbase Wallet',
  img: 'https://explorer-api.walletconnect.com/v3/logo/lg/a5ebc364-8f91-4200-fcc6-be81310a0000?projectId=2f05ae7f1116030fde2d36508f472bfb'
}]
