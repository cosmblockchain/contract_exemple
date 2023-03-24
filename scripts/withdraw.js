const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding .... ");
    const transactionResponse = await fundMe.withdraw();
    await transactionResponse.wait(1);
    console.log("got it back!!!!!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/**
 * procedure:
 * on garde le 1er terminal 
 * puis commande sur le 2 eme terminal : yarn hardhat run scripts/withdraw.js --network localhost
 */