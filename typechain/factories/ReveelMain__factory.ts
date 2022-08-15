/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Signer,
  utils,
  BigNumberish,
  Contract,
  ContractFactory,
  Overrides,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ReveelMain, ReveelMainInterface } from "../ReveelMain";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_libraryAddress",
        type: "address",
      },
      {
        internalType: "uint88",
        name: "_platformFee",
        type: "uint88",
      },
      {
        internalType: "address",
        name: "_platformWallet",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ZeroAddressProvided",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract RevenuePath",
        name: "path",
        type: "address",
      },
      {
        indexed: true,
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "RevenuePathCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newLibrary",
        type: "address",
      },
    ],
    name: "UpdatedLibraryAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint88",
        name: "newFeePercentage",
        type: "uint88",
      },
    ],
    name: "UpdatedPlatformFee",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "newWallet",
        type: "address",
      },
    ],
    name: "UpdatedPlatformWallet",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address[][]",
        name: "_walletList",
        type: "address[][]",
      },
      {
        internalType: "uint256[][]",
        name: "_distribution",
        type: "uint256[][]",
      },
      {
        internalType: "uint256[]",
        name: "tierLimit",
        type: "uint256[]",
      },
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isImmutable",
        type: "bool",
      },
    ],
    name: "createRevenuePath",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getLibraryAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPaths",
    outputs: [
      {
        internalType: "contract RevenuePath[]",
        name: "",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "totalPaths",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPlatformFee",
    outputs: [
      {
        internalType: "uint88",
        name: "",
        type: "uint88",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPlatformWallet",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_libraryAddress",
        type: "address",
      },
    ],
    name: "setLibraryAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint88",
        name: "newFeePercentage",
        type: "uint88",
      },
    ],
    name: "setPlatformFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newWallet",
        type: "address",
      },
    ],
    name: "setPlatformWallet",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "toggleContractState",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b50604051620012a3380380620012a383398101604081905262000034916200014f565b6200003f33620000e2565b6000805460ff60a01b191690556001600160a01b03831615806200006a57506001600160a01b038116155b156200008957604051638474420160e01b815260040160405180910390fd5b600380546001600160a01b039485166001600160a01b031991821617909155600080546001600160581b03909416600160a81b026001600160a81b039094169390931790925560018054919093169116179055620001a7565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b80516001600160a01b03811681146200014a57600080fd5b919050565b6000806000606084860312156200016557600080fd5b620001708462000132565b60208501519093506001600160581b03811681146200018e57600080fd5b91506200019e6040850162000132565b90509250925092565b6110ec80620001b76000396000f3fe608060405234801561001057600080fd5b50600436106100df5760003560e01c8063715018a61161008c5780639c6eb6a1116100665780639c6eb6a1146101c3578063d76a09f4146101d6578063f2a19b5b146101e7578063f2fde38b146101f857600080fd5b8063715018a6146101835780638831e9cf1461018b5780638da5cb5b1461019e57600080fd5b80635c975abb116100bd5780635c975abb146101205780636ea8bc101461013d5780636edbd2121461017057600080fd5b80631767ae33146100e457806324fde1e2146101035780634863ba171461010d575b600080fd5b6100ec61020b565b6040516100fa929190610a8a565b60405180910390f35b61010b61027a565b005b61010b61011b366004610af2565b6102fc565b600054600160a01b900460ff1660405190151581526020016100fa565b600054600160a81b90046affffffffffffffffffffff166040516affffffffffffffffffffff90911681526020016100fa565b61010b61017e366004610cea565b6103d2565b61010b610573565b61010b610199366004610af2565b6105d7565b6000546001600160a01b03165b6040516001600160a01b0390911681526020016100fa565b61010b6101d1366004610e82565b6106a6565b6001546001600160a01b03166101ab565b6003546001600160a01b03166101ab565b61010b610206366004610af2565b61076b565b60606000600280805490508180548060200260200160405190810160405280929190818152602001828054801561026b57602002820191906000526020600020905b81546001600160a01b0316815260019091019060200180831161024d575b50505050509150915091509091565b6000546001600160a01b031633146102d95760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064015b60405180910390fd5b600054600160a01b900460ff166102f4576102f261084d565b565b6102f26108f2565b6000546001600160a01b031633146103565760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016102d0565b6001600160a01b03811661037d57604051638474420160e01b815260040160405180910390fd5b600380546001600160a01b0319166001600160a01b0383169081179091556040519081527fc293dac3270f9da5df797e89ca9205a15be886c025c4d634bf5d83faa56ac5d1906020015b60405180910390a150565b600054600160a01b900460ff161561041f5760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b60448201526064016102d0565b600354600090610437906001600160a01b031661097f565b600280546001808201835560009283527f405787fa12a823e0f2b7631cc41b3ba8828b3321ca811111fa75cd3aa3bb5ace90910180546001600160a01b0319166001600160a01b0385811691821790925560408051608081018252606081018a90529454600160a81b90046affffffffffffffffffffff16855292549091166020840152851515838301529051631fcb1adb60e01b81529293509091631fcb1adb906104ef908a908a908a9087903390600401610fdb565b600060405180830381600087803b15801561050957600080fd5b505af115801561051d573d6000803e3d6000fd5b505050508360405161052f91906110c3565b604051908190038120906001600160a01b038416907fb2fee2a56b52647eac919691e5fe49559ae2fb2a3d2262c898f6b76055c6f00090600090a350505050505050565b6000546001600160a01b031633146105cd5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016102d0565b6102f26000610a3a565b6000546001600160a01b031633146106315760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016102d0565b6001600160a01b03811661065857604051638474420160e01b815260040160405180910390fd5b600180546001600160a01b0319166001600160a01b0383169081179091556040519081527fd4b9d905e115b504182eec9ed10da900e8b66d84932a7e08ebc88e01856e5d5c906020016103c7565b6000546001600160a01b031633146107005760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016102d0565b6000805474ffffffffffffffffffffffffffffffffffffffffff16600160a81b6affffffffffffffffffffff8481168202929092179283905560405192041681527f10be3315dddeee55a2d97074a5f39af34cea2497a0e2121c9ee35f3de1c51edc906020016103c7565b6000546001600160a01b031633146107c55760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016102d0565b6001600160a01b0381166108415760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f646472657373000000000000000000000000000000000000000000000000000060648201526084016102d0565b61084a81610a3a565b50565b600054600160a01b900460ff161561089a5760405162461bcd60e51b815260206004820152601060248201526f14185d5cd8589b194e881c185d5cd95960821b60448201526064016102d0565b6000805460ff60a01b1916600160a01b1790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586108d53390565b6040516001600160a01b03909116815260200160405180910390a1565b600054600160a01b900460ff1661094b5760405162461bcd60e51b815260206004820152601460248201527f5061757361626c653a206e6f742070617573656400000000000000000000000060448201526064016102d0565b6000805460ff60a01b191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa336108d5565b60006040517f3d602d80600a3d3981f3363d3d373d3d3d363d7300000000000000000000000081528260601b60148201527f5af43d82803e903d91602b57fd5bf3000000000000000000000000000000000060288201526037816000f09150506001600160a01b038116610a355760405162461bcd60e51b815260206004820152601660248201527f455243313136373a20637265617465206661696c65640000000000000000000060448201526064016102d0565b919050565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b604080825283519082018190526000906020906060840190828701845b82811015610acc5781516001600160a01b031684529284019290840190600101610aa7565b50505092019290925292915050565b80356001600160a01b0381168114610a3557600080fd5b600060208284031215610b0457600080fd5b610b0d82610adb565b9392505050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715610b5357610b53610b14565b604052919050565b600067ffffffffffffffff821115610b7557610b75610b14565b5060051b60200190565b600082601f830112610b9057600080fd5b81356020610ba5610ba083610b5b565b610b2a565b82815260059290921b84018101918181019086841115610bc457600080fd5b8286015b84811015610bdf5780358352918301918301610bc8565b509695505050505050565b600082601f830112610bfb57600080fd5b81356020610c0b610ba083610b5b565b82815260059290921b84018101918181019086841115610c2a57600080fd5b8286015b84811015610bdf57803567ffffffffffffffff811115610c4e5760008081fd5b610c5c8986838b0101610b7f565b845250918301918301610c2e565b600082601f830112610c7b57600080fd5b813567ffffffffffffffff811115610c9557610c95610b14565b610ca8601f8201601f1916602001610b2a565b818152846020838601011115610cbd57600080fd5b816020850160208301376000918101602001919091529392505050565b80358015158114610a3557600080fd5b600080600080600060a08688031215610d0257600080fd5b67ffffffffffffffff8087351115610d1957600080fd5b8635870188601f820112610d2c57600080fd5b610d39610ba08235610b5b565b81358082526020808301929160051b8401018b1015610d5757600080fd5b602083015b6020843560051b850101811015610dfb578481351115610d7b57600080fd5b803584018c603f820112610d8e57600080fd5b610d9e610ba06020830135610b5b565b602082810135808352908201919060051b83016040018f811115610dc157600080fd5b6040840193505b80841015610dea57610dd984610adb565b835260209384019390920191610dc8565b508552505060209283019201610d5c565b50975050506020870135811015610e1157600080fd5b610e218860208901358901610bea565b94508060408801351115610e3457600080fd5b610e448860408901358901610b7f565b93508060608801351115610e5757600080fd5b50610e688760608801358801610c6a565b9150610e7660808701610cda565b90509295509295909350565b600060208284031215610e9457600080fd5b81356affffffffffffffffffffff81168114610b0d57600080fd5b600081518084526020808501945080840160005b83811015610edf57815187529582019590820190600101610ec3565b509495945050505050565b600081518084526020808501808196508360051b8101915082860160005b85811015610f32578284038952610f20848351610eaf565b98850198935090840190600101610f08565b5091979650505050505050565b60005b83811015610f5a578181015183820152602001610f42565b83811115610f69576000848401525b50505050565b6affffffffffffffffffffff81511682526001600160a01b03602082015116602083015260408101511515604083015260006060820151608060608501528051806080860152610fc68160a0870160208501610f3f565b601f01601f19169390930160a0019392505050565b600060a0820160a0835280885180835260c08501915060c08160051b86010192506020808b016000805b848110156110625788870360bf19018652825180518089529085019085890190845b8181101561104c5783516001600160a01b031683529287019291870191600101611027565b5090985050509483019491830191600101611005565b505050858403818701525050506110798188610eea565b9050828103604084015261108d8187610eaf565b905082810360608401526110a18186610f6f565b9150506110b960808301846001600160a01b03169052565b9695505050505050565b600082516110d5818460208701610f3f565b919091019291505056fea164736f6c6343000809000a";

export class ReveelMain__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    _libraryAddress: string,
    _platformFee: BigNumberish,
    _platformWallet: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ReveelMain> {
    return super.deploy(
      _libraryAddress,
      _platformFee,
      _platformWallet,
      overrides || {}
    ) as Promise<ReveelMain>;
  }
  getDeployTransaction(
    _libraryAddress: string,
    _platformFee: BigNumberish,
    _platformWallet: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _libraryAddress,
      _platformFee,
      _platformWallet,
      overrides || {}
    );
  }
  attach(address: string): ReveelMain {
    return super.attach(address) as ReveelMain;
  }
  connect(signer: Signer): ReveelMain__factory {
    return super.connect(signer) as ReveelMain__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ReveelMainInterface {
    return new utils.Interface(_abi) as ReveelMainInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ReveelMain {
    return new Contract(address, _abi, signerOrProvider) as ReveelMain;
  }
}
