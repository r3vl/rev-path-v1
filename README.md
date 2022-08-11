# r3vl-rev-path

## Features

- ETH multi-layer distribution
- ERC20 distribution
- Withdraw revenue in single transaction

## Fee

- For ETH: If additional layer is added to distrbution of ETH, X% of fee is taken for distribution.

---

### Pre Requisites

Before running any command, you need to create a `.env` file and set a BIP-39 compatible mnemonic as an environment
variable. Follow the example in `.env.example`. If you don't already have a mnemonic, use this [website](https://iancoleman.io/bip39/) to generate one.

Then, proceed with installing dependencies:

```sh
npm install
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ npm run compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ npm run typechain
```

### Lint Solidity

Lint the Solidity code:

```sh
$ npm run lint:sol
```

### Test

Run the Mocha tests:

```sh
$ npm run test
```

### Coverage

Generate the code coverage report:

```sh
$ npm run coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true npm run test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ npm run clean
```

### Deploy

Deploy the contracts to the network of your choice. Make sure to review the initializing variables in the scripts.

```sh
$ npx hardhat run deploy/{SCRIPT_NAME} --network {NETWORK_NAME
```
e.g: 
```sh
$ npx hardhat run deploy/1_ReveelMain_deploy.js --network goerli
```


