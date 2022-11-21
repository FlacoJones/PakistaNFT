# Save Pakistan Contracts

## Getting Started

- yarn
- yarn start (this will boot the Hardhat Testnet on port 8545)
- Set `TESTNET_URL=http://localhost:8545` in your `.env`

updated the tests to reflect it

if you run yarn start followed by yarn deploy:local with TESTNET_URL=http://localhost:8545 in you .env it should deploy the upgradeable contracts to http://localhost:8545 and print the contract addresses

address you're looking for will be printed as savePakistan
