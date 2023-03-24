/**
 * les tests étagés
 * on utilise developmentChains de helper-hardhat-config.js
 */
const { ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");
const {assert} = require("chai");

/**
 * if (variable) { someVar = 'yes'} else { someVar = "no"}
 * equivalent à : let someVar = variable ? "yes": "no"
 * on execute le test si on n'est pas dans le developmentChains
 */
/**
 * developmentChains est une liste de réseaux (voir helper...js) elle contient le reseau hardhat et
 * le reseau local. si abc n'est pas dans la liste, alors l'expression developmentChains.includes(network.name) 
 * est fause. dans ce  cas , on execute le test étagé
 * yarn hardhat test --network abc 
 */

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Fundme", async function () {
          let fundMe;
          let deployer;
          //let mockV3Aggregator; // test en local
          // test addressToAmountFunded dans la finction fund() du contrat FundMe.sol
          // on utilse l'utilitaire de ethrs pour ne pas ecrire trop de 0
          // on met un fond de 1 eth
          const sendValue = ethers.utils.parseEther("0.5"); // 1 eth = 10 **18

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer; // quelle adresse de compte à connecter
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("permettre aux bayeurs de retirer les fonds", async function() {
            await fundMe.fund({value: sendValue});
            await fundMe.withdraw()
            const endingBalance = await fundMe.provider.getBalance(
                fundMe.address
            );
            
            // assert
            assert.equal(endingBalance.toString(), "0");


          })
      });
