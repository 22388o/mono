module.exports = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'channelId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'receiver',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address'
      }
    ],
    name: 'ChannelOpened',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'channelId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'deposited',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address'
      }
    ],
    name: 'Deposited',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'channelId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'receiver',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'withdrawing',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'spent',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'token',
        type: 'address'
      }
    ],
    name: 'Settled',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_channelId',
        type: 'uint256'
      }
    ],
    name: 'capacity',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'channels',
    outputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'receiver',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'deposited',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'claimed',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'token',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_channelId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address'
      }
    ],
    name: 'deposit',
    outputs: [
      {
        internalType: 'bool',
        name: 'success',
        type: 'bool'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_channelId',
        type: 'uint256'
      }
    ],
    name: 'depositEth',
    outputs: [
      {
        internalType: 'bool',
        name: 'success',
        type: 'bool'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_sender',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_receiver',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address'
      }
    ],
    name: 'getChannelId',
    outputs: [
      {
        internalType: 'uint256',
        name: 'channelId',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_sender',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_receiver',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address'
      }
    ],
    name: 'getChannelIdHex',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'channelId',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_sender',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_receiver',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address'
      }
    ],
    name: 'getChannelIdPreimage',
    outputs: [
      {
        internalType: 'bytes',
        name: 'channelInfo',
        type: 'bytes'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_channelId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      }
    ],
    name: 'getEthSignedHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_channelId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      }
    ],
    name: 'getHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_receiver',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: '_token',
        type: 'address'
      }
    ],
    name: 'openChannel',
    outputs: [
      {
        internalType: 'uint256',
        name: 'channelId',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_receiver',
        type: 'address'
      }
    ],
    name: 'openChannelEth',
    outputs: [
      {
        internalType: 'uint256',
        name: 'channelId',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_channelId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      },
      {
        internalType: 'bytes',
        name: '_sig',
        type: 'bytes'
      }
    ],
    name: 'settle',
    outputs: [
      {
        internalType: 'bool',
        name: 'success',
        type: 'bool'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_channelId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_amount',
        type: 'uint256'
      },
      {
        internalType: 'bytes',
        name: '_sig',
        type: 'bytes'
      }
    ],
    name: 'verify',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]
