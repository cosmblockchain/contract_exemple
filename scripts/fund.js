const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding contract .... ");
    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.2"),
    });
    await transactionResponse.wait(1);
    console.log("funded!!!!!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

/**
 * procedure:
 * commande sur le 1er terminal : yarn hardhat node
 * puis commande sur le 2 eme terminal : yarn hardhat run scripts/fund.js --network localhost
 */