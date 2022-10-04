# r3vl-rev-path

  

Reveel protocol v1, allows a group of collaborators to create an autonomous, non-upgradable revenue path to share revenue/earning proceeds among each other. 

The process is initiated by a path owner, who has the information of the collaborators, the distribution ratios for a given amount.

Based on that, anyone can create 2 types of revenue path:

 - **Immutable Path:** No updates regarding distribution ratio and members is allowed after the creation of the revenue path.
 - **Mutable Path:** The path owner/creator has the permission to add & update tiers/layers within the revenue path.

> For details on the contract methods refer to the `docs` folder. Generated via docgen.

## Features

  

-  ### ETH multi-layer/tier revenue distribution:

- For ether, we can create multiple layers within a revenue path. Each layer/tier of distribution logic will have a tier limit i.e the amount of ETH the revenue path should distribute based on that tier's distribution proportion. After that limit is reached, the next tier is activated and the future funds will be distributed based on that.

- If there's only one tier for ETH in a revenue path, the tier limit will be zero,which indicates there are no next tiers to be updated to.

- Once ether enters the revenue path, they are distributed according to the current tier distribution ratio.

![Reveel-Path-Tier](https://user-images.githubusercontent.com/18365101/184365662-5b1e2590-91c1-4f57-baa7-5121f6574084.png)
-  ### ERC20 single layer/tier revenue distribution

- For ERC20 token, we receive revenue through a single tier/layer of distribution logic.

- The ERC20 distribution ratio is handled separately from ETH

- During initialization, i.e creation of the revenue path, the last distribution tier will be considered as the distribution ratio for ERC20

- For mutable revenue paths, ERC20 distribution ratios can be updated separately.

-  ### Withdraw revenue in single transaction

- Through batch processing a bundled request can be sent across different revenue paths to submit a release request of funds for ETH & ERC20(provided address)

- If the revenue paths have eligible claim amount for the account, it will release the amount to the wallets.

## Fee

  

- For ETH: If additional layer(greater than 1 tier) is added to distrbution of ETH, a 1% fee is charged for the platform.

  

---
PRIMARY OPERATIONS
-----------------

*Creating New Revenue Path*
---------------------------
1. Multiple tiers are added with nested arrays. Two primary nested arrays are: the walletlist & the distribution list.
    
    Each of those lists are a list of arrays by themselves. The total number of walletList array elements, should always be equal to
    distribution list array elements.

2. Distribution, fees - all percentage integers should be raised to 1E2 value. 
e.g: If the percentage is 0.1%, it should be passed on as 10

    
-------------------------------------
*Adding Revenue Tier*
---------------------------
Revenue tiers are appended at the end of the existing list if a user decides to add one or multiple additional revenue path in the mutable 
version.
 

-------------------------------------
*Updating Revenue Tier (ETH)*
---------------------------

You can update one tier at a time, for current and future tiers). The past tiers are not updatable.

-------------------------------------
*Updating Revenue Path (ERC20)*
---------------------------

For mutable contracts ERC20 distribution is updatable anytime.




-------------------------------------
*Withdraw Revenue (ETH & ERC20)*
---------------------------

For multiple revenue paths, a withdraw request can be submitted to the aggregator contract.

  

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
