/**
 * quand on utilise hardhat-deploy, il ya plus d'import ni fonction main ni appel de la fonction main
 * ce plugin s'occupe de cela.
 * donc il suffit de créer la fonction anonyme que ce plugin va chercher par défaut
 * avec -> module.exports = async (....) => {}
 * equivalent à la ligne 15
 *async function deployFunc() {
 *  console.log("oh")
 *  hre.getNamedAcounts()
 *  hre.deployments
 *}
 * module.exports.default = deployFunc
 */

const { verify } = require("../utils/verify");
const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
console.log(process.env)

module.exports = async ({ getNamedAccounts, deployments }) => {
    // equiv à const {getNameAcounts, deployments } = hre  equiv hre.getNameAcounts et hre.deployments
    // voir fichier hardhat.config.js
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // si le reseau est x alors l'adresse est y
    // on crée le fichier helper-hardhat-config.js pour definir les propriétés
    // des blockchain à utiliser
    // yarn hardhat deploy --network "sepolia"

    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddressConf"]
    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress =
            networkConfig[chainId]["ethUsdPriceFeedAddressConf"];
    }

    // verification contrat
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations:network.config.blockConfirmations || 1, // pas de confirmation on attend 1 block
    });

    // verification du contrat
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // verify
        await verify(fundMe.address, args);
    }
    log("-----------------------------");
};
module.exports.tags = ["all", "fundme"];
