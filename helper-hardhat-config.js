// configuration du reseau
// sera importé dans le fichier 01-deploy-fund-me.js
/**
 * sepolia testnet :
 * chanId : 11155111
 * adresse de la paire eth/usd :0x694AA1769357215DE4FAC081bf1f309aDC325306
 * 8 decimales
 */
const networkConfig = {
    11155111: {
        name: "sepolia",
         // Price Feed Address, values can be obtained at https://docs.chain.link/data-feeds/price-feeds/addresses
        ethUsdPriceFeedAddressConf:
            "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    5: {
        name: "Goerli",
        ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    31337: {
        name: "localhost",
    },
};

// choix du reseau lors de la phase de developpement
// les mocks contrat MockV3Aggregator
const developmentChains = ["hardhat", "localhost"];
// données se trouvant dans le constructeur  MockV3Aggregator
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
};
