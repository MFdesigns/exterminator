export const encoding = {
  'registers': [
    {
      'name': 'ip',
      'bytecode': '0x1'
    },
    {
      'name': 'sp',
      'bytecode': '0x2'
    },
    {
      'name': 'bp',
      'bytecode': '0x3'
    },
    {
      'name': 'r0',
      'bytecode': '0x5'
    },
    {
      'name': 'r1',
      'bytecode': '0x6'
    },
    {
      'name': 'r2',
      'bytecode': '0x7'
    },
    {
      'name': 'r3',
      'bytecode': '0x8'
    },
    {
      'name': 'r4',
      'bytecode': '0x9'
    },
    {
      'name': 'r5',
      'bytecode': '0xA'
    },
    {
      'name': 'r6',
      'bytecode': '0xB'
    },
    {
      'name': 'r7',
      'bytecode': '0xC'
    },
    {
      'name': 'r8',
      'bytecode': '0xD'
    },
    {
      'name': 'r9',
      'bytecode': '0xE'
    },
    {
      'name': 'r10',
      'bytecode': '0xF'
    },
    {
      'name': 'r11',
      'bytecode': '0x10'
    },
    {
      'name': 'r12',
      'bytecode': '0x11'
    },
    {
      'name': 'r13',
      'bytecode': '0x12'
    },
    {
      'name': 'r14',
      'bytecode': '0x13'
    },
    {
      'name': 'r15',
      'bytecode': '0x14'
    },
    {
      'name': 'f0',
      'bytecode': '0x16'
    },
    {
      'name': 'f1',
      'bytecode': '0x17'
    },
    {
      'name': 'f2',
      'bytecode': '0x18'
    },
    {
      'name': 'f3',
      'bytecode': '0x19'
    },
    {
      'name': 'f4',
      'bytecode': '0x1A'
    },
    {
      'name': 'f5',
      'bytecode': '0x1B'
    },
    {
      'name': 'f6',
      'bytecode': '0x1C'
    },
    {
      'name': 'f7',
      'bytecode': '0x1D'
    },
    {
      'name': 'f8',
      'bytecode': '0x1E'
    },
    {
      'name': 'f9',
      'bytecode': '0x1F'
    },
    {
      'name': 'f10',
      'bytecode': '0x20'
    },
    {
      'name': 'f11',
      'bytecode': '0x21'
    },
    {
      'name': 'f12',
      'bytecode': '0x22'
    },
    {
      'name': 'f13',
      'bytecode': '0x23'
    },
    {
      'name': 'f14',
      'bytecode': '0x24'
    },
    {
      'name': 'f15',
      'bytecode': '0x25'
    }
  ],
  'instructions': [
    {
      'opcode': '0xA0',
      'name': 'nop',
      'paramList': [
        {
          'opcode': '0xA0',
          'encodeType': false,
          'params': [],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'push',
      'paramList': [
        {
          'opcode': '0x01',
          'encodeType': false,
          'params': [
            'iT',
            'int'
          ],
          'typeVariants': [
            {
              'type': 'i8',
              'opcode': '0x01'
            },
            {
              'type': 'i16',
              'opcode': '0x02'
            },
            {
              'type': 'i32',
              'opcode': '0x03'
            },
            {
              'type': 'i64',
              'opcode': '0x04'
            }
          ]
        },
        {
          'opcode': '0x05',
          'encodeType': true,
          'params': [
            'iT',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'pop',
      'paramList': [
        {
          'opcode': '0x06',
          'encodeType': true,
          'params': [
            'iT'
          ],
          'typeVariants': []
        },
        {
          'opcode': '0x07',
          'encodeType': true,
          'params': [
            'iT',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'load',
      'paramList': [
        {
          'opcode': '0x11',
          'encodeType': false,
          'params': [
            'iT',
            'int',
            'iReg'
          ],
          'typeVariants': [
            {
              'type': 'i8',
              'opcode': '0x11'
            },
            {
              'type': 'i16',
              'opcode': '0x12'
            },
            {
              'type': 'i32',
              'opcode': '0x13'
            },
            {
              'type': 'i64',
              'opcode': '0x14'
            }
          ]
        },
        {
          'opcode': '0x15',
          'encodeType': true,
          'params': [
            'iT',
            'RO',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'loadf',
      'paramList': [
        {
          'opcode': '0x16',
          'encodeType': false,
          'params': [
            'fT',
            'float',
            'fReg'
          ],
          'typeVariants': [
            {
              'type': 'f32',
              'opcode': '0x16'
            },
            {
              'type': 'f64',
              'opcode': '0x17'
            }
          ]
        },
        {
          'opcode': '0x18',
          'encodeType': true,
          'params': [
            'fT',
            'RO',
            'fReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'store',
      'paramList': [
        {
          'opcode': '0x08',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'RO'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'storef',
      'paramList': [
        {
          'opcode': '0x09',
          'encodeType': true,
          'params': [
            'fT',
            'fReg',
            'RO'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'copy',
      'paramList': [
        {
          'opcode': '0x21',
          'encodeType': false,
          'params': [
            'iT',
            'int',
            'RO'
          ],
          'typeVariants': [
            {
              'type': 'i8',
              'opcode': '0x21'
            },
            {
              'type': 'i16',
              'opcode': '0x22'
            },
            {
              'type': 'i32',
              'opcode': '0x23'
            },
            {
              'type': 'i64',
              'opcode': '0x24'
            }
          ]
        },
        {
          'opcode': '0x25',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        },
        {
          'opcode': '0x26',
          'encodeType': true,
          'params': [
            'iT',
            'RO',
            'RO'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'copyf',
      'paramList': [
        {
          'opcode': '0x27',
          'encodeType': false,
          'params': [
            'fT',
            'float',
            'RO'
          ],
          'typeVariants': [
            {
              'type': 'f32',
              'opcode': '0x27'
            },
            {
              'type': 'f64',
              'opcode': '0x28'
            }
          ]
        },
        {
          'opcode': '0x29',
          'encodeType': true,
          'params': [
            'fT',
            'fReg',
            'fReg'
          ],
          'typeVariants': []
        },
        {
          'opcode': '0x2A',
          'encodeType': true,
          'params': [
            'fT',
            'RO',
            'RO'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'exit',
      'paramList': [
        {
          'opcode': '0x50',
          'encodeType': false,
          'params': [],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'call',
      'paramList': [
        {
          'opcode': '0x20',
          'encodeType': false,
          'params': [
            'label'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'ret',
      'paramList': [
        {
          'opcode': '0x30',
          'encodeType': false,
          'params': [],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'sys',
      'paramList': [
        {
          'opcode': '0x40',
          'encodeType': false,
          'params': [
            'sysID'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'lea',
      'paramList': [
        {
          'opcode': '0x10',
          'encodeType': false,
          'params': [
            'RO',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'add',
      'paramList': [
        {
          'opcode': '0x31',
          'encodeType': false,
          'params': [
            'iT',
            'iReg',
            'int'
          ],
          'typeVariants': [
            {
              'type': 'i8',
              'opcode': '0x31'
            },
            {
              'type': 'i16',
              'opcode': '0x32'
            },
            {
              'type': 'i32',
              'opcode': '0x33'
            },
            {
              'type': 'i64',
              'opcode': '0x34'
            }
          ]
        },
        {
          'opcode': '0x35',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'addf',
      'paramList': [
        {
          'opcode': '0x36',
          'encodeType': false,
          'params': [
            'fT',
            'fReg',
            'float'
          ],
          'typeVariants': [
            {
              'type': 'f32',
              'opcode': '0x36'
            },
            {
              'type': 'f64',
              'opcode': '0x37'
            }
          ]
        },
        {
          'opcode': '0x38',
          'encodeType': true,
          'params': [
            'fT',
            'fReg',
            'fReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'sub',
      'paramList': [
        {
          'opcode': '0x41',
          'encodeType': false,
          'params': [
            'iT',
            'iReg',
            'int'
          ],
          'typeVariants': [
            {
              'type': 'i8',
              'opcode': '0x41'
            },
            {
              'type': 'i16',
              'opcode': '0x42'
            },
            {
              'type': 'i32',
              'opcode': '0x43'
            },
            {
              'type': 'i64',
              'opcode': '0x44'
            }
          ]
        },
        {
          'opcode': '0x45',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'subf',
      'paramList': [
        {
          'opcode': '0x46',
          'encodeType': false,
          'params': [
            'fT',
            'fReg',
            'float'
          ],
          'typeVariants': [
            {
              'type': 'f32',
              'opcode': '0x46'
            },
            {
              'type': 'f64',
              'opcode': '0x47'
            }
          ]
        },
        {
          'opcode': '0x48',
          'encodeType': true,
          'params': [
            'fT',
            'fReg',
            'fReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'mul',
      'paramList': [
        {
          'opcode': '0x51',
          'encodeType': false,
          'params': [
            'iT',
            'iReg',
            'int'
          ],
          'typeVariants': [
            {
              'type': 'i8',
              'opcode': '0x51'
            },
            {
              'type': 'i16',
              'opcode': '0x52'
            },
            {
              'type': 'i32',
              'opcode': '0x53'
            },
            {
              'type': 'i64',
              'opcode': '0x54'
            }
          ]
        },
        {
          'opcode': '0x55',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'mulf',
      'paramList': [
        {
          'opcode': '0x56',
          'encodeType': false,
          'params': [
            'fT',
            'fReg',
            'float'
          ],
          'typeVariants': [
            {
              'type': 'f32',
              'opcode': '0x56'
            },
            {
              'type': 'f64',
              'opcode': '0x57'
            }
          ]
        },
        {
          'opcode': '0x58',
          'encodeType': true,
          'params': [
            'fT',
            'fReg',
            'fReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'muls',
      'paramList': [
        {
          'opcode': '0x59',
          'encodeType': false,
          'params': [
            'iT',
            'iReg',
            'int'
          ],
          'typeVariants': [
            {
              'type': 'i8',
              'opcode': '0x59'
            },
            {
              'type': 'i16',
              'opcode': '0x5A'
            },
            {
              'type': 'i32',
              'opcode': '0x5B'
            },
            {
              'type': 'i64',
              'opcode': '0x5C'
            }
          ]
        },
        {
          'opcode': '0x5D',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'div',
      'paramList': [
        {
          'opcode': '0x61',
          'encodeType': false,
          'params': [
            'iT',
            'iReg',
            'int'
          ],
          'typeVariants': [
            {
              'type': 'i8',
              'opcode': '0x61'
            },
            {
              'type': 'i16',
              'opcode': '0x62'
            },
            {
              'type': 'i32',
              'opcode': '0x63'
            },
            {
              'type': 'i64',
              'opcode': '0x64'
            }
          ]
        },
        {
          'opcode': '0x65',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'divf',
      'paramList': [
        {
          'opcode': '0x66',
          'encodeType': false,
          'params': [
            'fT',
            'fReg',
            'float'
          ],
          'typeVariants': [
            {
              'type': 'f32',
              'opcode': '0x66'
            },
            {
              'type': 'f64',
              'opcode': '0x67'
            }
          ]
        },
        {
          'opcode': '0x68',
          'encodeType': true,
          'params': [
            'fT',
            'fReg',
            'fReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'divs',
      'paramList': [
        {
          'opcode': '0x69',
          'encodeType': false,
          'params': [
            'iT',
            'iReg',
            'int'
          ],
          'typeVariants': [
            {
              'type': 'i8',
              'opcode': '0x69'
            },
            {
              'type': 'i16',
              'opcode': '0x6A'
            },
            {
              'type': 'i32',
              'opcode': '0x6B'
            },
            {
              'type': 'i64',
              'opcode': '0x6C'
            }
          ]
        },
        {
          'opcode': '0x6D',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'sqrt',
      'paramList': [
        {
          'opcode': '0x86',
          'encodeType': true,
          'params': [
            'fT',
            'fReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'mod',
      'paramList': [
        {
          'opcode': '0x96',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'and',
      'paramList': [
        {
          'opcode': '0x75',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'or',
      'paramList': [
        {
          'opcode': '0x85',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'xor',
      'paramList': [
        {
          'opcode': '0x95',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'not',
      'paramList': [
        {
          'opcode': '0xA5',
          'encodeType': true,
          'params': [
            'iT',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'lsh',
      'paramList': [
        {
          'opcode': '0x76',
          'encodeType': false,
          'params': [
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'rsh',
      'paramList': [
        {
          'opcode': '0x77',
          'encodeType': false,
          'params': [
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'srsh',
      'paramList': [
        {
          'opcode': '0x78',
          'encodeType': false,
          'params': [
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'b2l',
      'paramList': [
        {
          'opcode': '0xB1',
          'encodeType': false,
          'params': [
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 's2l',
      'paramList': [
        {
          'opcode': '0xB2',
          'encodeType': false,
          'params': [
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'i2l',
      'paramList': [
        {
          'opcode': '0xB3',
          'encodeType': false,
          'params': [
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'b2sl',
      'paramList': [
        {
          'opcode': '0xC1',
          'encodeType': false,
          'params': [
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 's2sl',
      'paramList': [
        {
          'opcode': '0xC2',
          'encodeType': false,
          'params': [
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'i2sl',
      'paramList': [
        {
          'opcode': '0xC3',
          'encodeType': false,
          'params': [
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'f2d',
      'paramList': [
        {
          'opcode': '0xB4',
          'encodeType': false,
          'params': [
            'fReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'd2f',
      'paramList': [
        {
          'opcode': '0xC4',
          'encodeType': false,
          'params': [
            'fReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'i2f',
      'paramList': [
        {
          'opcode': '0xB5',
          'encodeType': false,
          'params': [
            'iReg',
            'fReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'i2d',
      'paramList': [
        {
          'opcode': '0xC5',
          'encodeType': false,
          'params': [
            'iReg',
            'fReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'f2i',
      'paramList': [
        {
          'opcode': '0xB6',
          'encodeType': false,
          'params': [
            'fReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'd2i',
      'paramList': [
        {
          'opcode': '0xC6',
          'encodeType': false,
          'params': [
            'fReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'cmp',
      'paramList': [
        {
          'opcode': '0xD1',
          'encodeType': true,
          'params': [
            'iT',
            'iReg',
            'iReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'cmpf',
      'paramList': [
        {
          'opcode': '0xD5',
          'encodeType': true,
          'params': [
            'fT',
            'fReg',
            'fReg'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'jmp',
      'paramList': [
        {
          'opcode': '0xE1',
          'encodeType': false,
          'params': [
            'label'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'je',
      'paramList': [
        {
          'opcode': '0xE2',
          'encodeType': false,
          'params': [
            'label'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'jne',
      'paramList': [
        {
          'opcode': '0xE3',
          'encodeType': false,
          'params': [
            'label'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'jgt',
      'paramList': [
        {
          'opcode': '0xE4',
          'encodeType': false,
          'params': [
            'label'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'jlt',
      'paramList': [
        {
          'opcode': '0xE5',
          'encodeType': false,
          'params': [
            'label'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'jge',
      'paramList': [
        {
          'opcode': '0xE6',
          'encodeType': false,
          'params': [
            'label'
          ],
          'typeVariants': []
        }
      ]
    },
    {
      'opcode': '',
      'name': 'jle',
      'paramList': [
        {
          'opcode': '0xE7',
          'encodeType': false,
          'params': [
            'label'
          ],
          'typeVariants': []
        }
      ]
    }
  ]
}
