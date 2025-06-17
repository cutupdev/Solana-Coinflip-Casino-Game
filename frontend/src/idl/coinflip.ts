export type Coinflip = {
  "version": "0.1.0",
  "name": "coinflip",
  "instructions": [
    {
      "name": "createGame",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "tokenMint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setRoyalty",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "royaltyWallet",
          "type": "publicKey"
        },
        {
          "name": "royaltyFee",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setWinning",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "winPercents",
          "type": {
            "array": [
              "u16",
              6
            ]
          }
        }
      ]
    },
    {
      "name": "addPlayer",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "play",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameTreasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "royaltyTreasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "instructionSysvarAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "betAmount",
          "type": "u8"
        },
        {
          "name": "betNumber",
          "type": "u8"
        }
      ]
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "claimerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameTreasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "instructionSysvarAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "claimerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameTreasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fund",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameTreasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "royaltyFee",
            "type": "u16"
          },
          {
            "name": "royaltyWallet",
            "type": "publicKey"
          },
          {
            "name": "mainBalance",
            "type": "u64"
          },
          {
            "name": "totalRound",
            "type": "u64"
          },
          {
            "name": "winPercents",
            "type": {
              "array": [
                "u16",
                6
              ]
            }
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "game",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "earnedMoney",
            "type": "u64"
          },
          {
            "name": "winTimes",
            "type": "u64"
          },
          {
            "name": "round",
            "type": "u64"
          },
          {
            "name": "rand",
            "type": "u32"
          },
          {
            "name": "playedTime",
            "type": "u64"
          },
          {
            "name": "betNumber",
            "type": "u8"
          },
          {
            "name": "betAmount",
            "type": "u8"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "UnauthorizedWallet",
      "msg": "Unauthorized wallet cannot create game"
    },
    {
      "code": 6001,
      "name": "MinimumPrice",
      "msg": "You should bet at least 0.05 sol"
    },
    {
      "code": 6002,
      "name": "InvalidInstructionAdded",
      "msg": "Invalid Instruction Added"
    },
    {
      "code": 6003,
      "name": "InvalidProgramId",
      "msg": "Invalid Program"
    }
  ]
};

export const IDL: Coinflip = {
  "version": "0.1.0",
  "name": "coinflip",
  "instructions": [
    {
      "name": "createGame",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "bump",
          "type": "u8"
        },
        {
          "name": "tokenMint",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "setRoyalty",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "royaltyWallet",
          "type": "publicKey"
        },
        {
          "name": "royaltyFee",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setWinning",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "winPercents",
          "type": {
            "array": [
              "u16",
              6
            ]
          }
        }
      ]
    },
    {
      "name": "addPlayer",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "play",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameTreasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "royaltyTreasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "instructionSysvarAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "betAmount",
          "type": "u8"
        },
        {
          "name": "betNumber",
          "type": "u8"
        }
      ]
    },
    {
      "name": "claim",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "claimerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameTreasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "instructionSysvarAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "claimerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameTreasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fund",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "payerAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameTreasuryAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "tokenMint",
            "type": "publicKey"
          },
          {
            "name": "royaltyFee",
            "type": "u16"
          },
          {
            "name": "royaltyWallet",
            "type": "publicKey"
          },
          {
            "name": "mainBalance",
            "type": "u64"
          },
          {
            "name": "totalRound",
            "type": "u64"
          },
          {
            "name": "winPercents",
            "type": {
              "array": [
                "u16",
                6
              ]
            }
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "game",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "earnedMoney",
            "type": "u64"
          },
          {
            "name": "winTimes",
            "type": "u64"
          },
          {
            "name": "round",
            "type": "u64"
          },
          {
            "name": "rand",
            "type": "u32"
          },
          {
            "name": "playedTime",
            "type": "u64"
          },
          {
            "name": "betNumber",
            "type": "u8"
          },
          {
            "name": "betAmount",
            "type": "u8"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "UnauthorizedWallet",
      "msg": "Unauthorized wallet cannot create game"
    },
    {
      "code": 6001,
      "name": "MinimumPrice",
      "msg": "You should bet at least 0.05 sol"
    },
    {
      "code": 6002,
      "name": "InvalidInstructionAdded",
      "msg": "Invalid Instruction Added"
    },
    {
      "code": 6003,
      "name": "InvalidProgramId",
      "msg": "Invalid Program"
    }
  ]
};
