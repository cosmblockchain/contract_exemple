/**
 * les tests unitaires
 */

const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");
//onst { solidity } = require("ethereum-waffle");

// commande pour les tests : yarn hardhat test
// si on est dans le developmentChains () alors on execute describe(..) donc le test
console.log(
    `etat developmemnt : ${developmentChains.includes(network.name)}  `
);
/**
 * developmentChains est une liste de réseaux (voir helper...js) , si abc est dans la liste, alors
 * l'expression developmentChains.includes(network.name) est vraie. si on ne spécifie pas le reseau,
 * alors developmentChains.includes(network.name) est vraie, dans ces deux cas , on execute le test unitaire
 * yarn hardhat test --network abc ou yarn hardhat test
 */
!developmentChains.includes(network.name) // 
    ? describe.skip
    : // test contrat
      describe("FundMe", async function () {
          let fundMe;
          let deployer;
          let mockV3Aggregator; // test en local
          // test addressToAmountFunded dans la finction fund() du contrat FundMe.sol
          // on utilse l'utilitaire de ethrs pour ne pas ecrire trop de 0
          // on met un fond de 1 eth
          let sendValue = ethers.utils.parseEther("1"); // 1 eth = 10 **18

          beforeEach(async function () {
              // deployer le contrat
              // en utilsant hardhat-deploy

              // const accounts = await ethers.getSigners() // retorune la clé privée dans la section networks (module.exports)
              // const accountZero = accounts[0]
              deployer = (await getNamedAccounts()).deployer; // quelle adresse de compte à connecter
              await deployments.fixture(["all"]); // la fonction fixture permet de deployer les contrats à la demande
              // connexion au contrat
              /**
         * ethers.getContract ( contractAddressOrName , contractInterface )
           Returns a new connection to a contract at contractAddressOrName with the contractInterface. 
         */
              fundMe = await ethers.getContract("FundMe", deployer); // connect contrat  to funMe account , retourne un nouveau contrat
              // deployer est le compte qui appelle la transaction
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              ); // connect contrat to funMe account
          });
          // test constructeur
          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed();

                  console.log(`response: ${response}`);
                  console.log(
                      `mockV3Aggregator.address: ${mockV3Aggregator.address}`
                  );
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          // test de la fonction fund
          describe("fund", async function () {
              it("fails if you don't send enough eth", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!" // meme phrase que celle dans le contrat
                  );
              });

              // test de minimum usd à envoyer
              // addressToAmountFunded dans la fonction fund() du contrat FundMe.sol
              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue }); // more than minimumusd
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  //const rr = await fundMe.getVersion();
                  //console.log(`version = ${rr}`);
                  console.log(`fond (deployer) : ${response.toString()}`);
                  console.log(` fond (sendValue : ${sendValue.toString()}`);
                  assert.equal(response.toString(), sendValue.toString());
              });
              // test d'ajout d'un funder à la liste des funders
              // verification des addresses , ajout des fonds
              it("adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funderAddress = await fundMe.getFunder(0);
                  console.log(`adrresse du bailleur : ${funderAddress}`);
                  console.log(`adrresse (deployer) : ${deployer}`);
                  //assert.equal(funderAddress, deployer);
              });
          });

          // test de la fonction withdraw
          describe("whithdraw", async function () {
              // seul le owner qui a le droit de se renseigner sur la balance
              // seul le owner qui a le droit de

              // on va créditer le contrat
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });
              // arrangement
              // obtenir la balance
              it("Withdraw ETH from a single founder", async function () {
                  // on utilise l'objet provider pour travailler avec la fonction getBalance()
                  // afin d'obtenir le solde du contrat à l'adresse en question
                  const startingFunMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  // la variable deployer fournit l'adresse du compte
                  // tartingFunMeBalance s'ajoute à startingDeployingBAlance
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  // acting
                  // appel de la fonction withdraw()
                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  // trouver les frais de gas
                  //console.log(transactionReceipt)
                  /** les objets entre acollades sont extraits de l'objet transactionReceipt
                   * ces objets sont définis dans l'objet transactionRceipt
                   */
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  // cout total gas
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  console.log(`GasCost: ${gasCost}`);
                  console.log(`GasUsed: ${gasUsed}`);
                  console.log(`GasPrice: ${effectiveGasPrice}`);
                  const endingFunMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  // assert
                  assert.equal(endingFunMeBalance, 0);
                  assert.equal(
                      startingFunMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  ); // car deployer consome du gas
              });

              it("cheaperWithdraw testing ...", async function () {
                  // on utilise l'objet provider pour travailler avec la fonction getBalance()
                  // afin d'obtenir le solde du contrat à l'adresse en question
                  const startingFunMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  // la variable deployer fournit l'adresse du compte
                  // tartingFunMeBalance s'ajoute à startingDeployingBAlance
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  // acting
                  // appel de la fonction withdraw()
                  const transactionResponse = await fundMe.cheaperWithdraw();
                  const transactionReceipt = await transactionResponse.wait(1);
                  // trouver les frais de gas
                  //console.log(transactionReceipt)
                  /** les objets entre acollades sont extraits de l'objet transactionReceipt
                   * ces objets sont définis dans l'objet transactionRceipt
                   */
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  // cout total gas
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  console.log(`GasCost: ${gasCost}`);
                  console.log(`GasUsed: ${gasUsed}`);
                  console.log(`GasPrice: ${effectiveGasPrice}`);
                  const endingFunMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  // assert
                  assert.equal(endingFunMeBalance, 0);
                  assert.equal(
                      startingFunMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  ); // car deployer consome du gas
              });

              // tests de retrait de plusieurs bayeurs
              it("nous permet de retirer avec plusieurs bayeurs", async function () {
                  // 1ere étape
                  const accounts = await ethers.getSigners();
                  // verification : affichage addresse du 1 er compte
                  console.log(`accounts: ${accounts[0].address}`);
                  // connexion aux différents comptes
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );

                      // envoi des fonds
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  // obtenir le solde par l'adresse du contrat
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // 2 eme étape:
                  // acting
                  // appel de la fonction withdraw()
                  // obtenir le solde sur les comptes
                  const transactionResponse = await fundMe.withdraw();

                  const transactionReceipt = await transactionResponse.wait(1);
                  // trouver les frais de gas
                  //console.log(transactionReceipt)
                  /** les objets entre acollades sont extraits de l'objet transactionReceipt
                   * ces objets sont définis dans l'objet transactionRceipt
                   */
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  // cout total gas
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  // 3eme étape:
                  // assert
                  const endingFunMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);
                  // assert
                  assert.equal(endingFunMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
                  // s'assurer que la liste funders est vide pour chaque compte
                  // test avec grep
                  await expect(fundMe.s_funders(0)).to.be.reverted;
                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              // verification qu'un hacker ne peut retirer rien du tout
              it("seul le propriétaire peut retirer", async function () {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  );
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });
          });
      });
