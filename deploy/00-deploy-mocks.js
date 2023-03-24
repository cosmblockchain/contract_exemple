const { network } = require("hardhat");
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
    // equiv à const {getNameAcounts, deployments } = hre  equiv hre.getNameAcounts et hre.deployments
    // voir fichier hardhat.config.js
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    //const chainId = network.config.chainId;

    if (developmentChains.includes(network.name)) {
        log("local network detected ! Deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER], // dans l'ordre
        });
        log("Mocks deployed !");
        log("-----------------------------");
    }
};

// deployer que le contrat mocks
// flag a ajouer
// yarn hardhat deploy --tags mocks
module.exports.tags = ["all", "mocks"];
