// SPDX-License-Identifier: MIT
// pragma
pragma solidity ^0.8.8;

// imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// errors codes , nommer l'erreur avec le nom du contrat
error FundMe__NotOwner(); // convenstion de 2 underscores

// interfaces, libraries, Contracts
/**
 * @title A constract for crowd funding
 * @author mohammed
 * @notice This contract is to demo a simple funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    // type declarations
    using PriceConverter for uint256;

    // state variables
    // dictionnaire clé valeur (addresse bailler de fond, valeur des fonds)
    // s_ signifie storage : variable qui necessite un strorage (tres gourmante en gas!!!)
    mapping(address => uint256) private s_addressToAmountFunded; // privée: moins gourmant en gas
    // liste de bailleurs de fond
    address[] public s_funders;

    // le proprietaire
    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private immutable i_owner; // déclaré en une seule fois, (private) : pas besoin de connaitre l'adresse du propriétaite
    // minimum de versement
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18; // MINIMUM_USD rest public car tout le monde doit savoir quel est le montant mini
    //
    AggregatorV3Interface public s_priceFeed;

    // restreindre l'acces au contrat en utilisant un modifier
    // spécialement pour la fonction withdraw() où seul le propritaire est autorisé
    // à retirer les capitaux du contrat
    modifier onlyOwner() {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // constructeur :
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress); // initialiser la variable globale priceFeed
    }

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     */
    //Lorsque nous définissons la fonction comme payante, nous disons que
    // cette fonction peut être utilisée pour payer des choses.
    // verification du minimum à verser,
    // sauvegarde des fonds correspondant à chaque addresse dans le dico
    // après incrementation des fonds
    // ajout de l'adresse du bailleur dans la liste des bailleurs
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );
        // equivalent à : require(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    // fonction retrait, disponible seulement pour le propriétaire
    //
    // Dans ce cas, rendre tout l'argent du contrat à son créateur.
    function withdraw() public payable onlyOwner {
        // remplisssage de la liste des adresses bailleurs et le dictionnaire (adresse/fond)
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            // remise des fonds de tous les bailleurs  à 0
            s_addressToAmountFunded[funder] = 0;
        }

        // reset de la liste
        s_funders = new address[](0);
        // "this" veut dire ce contrat
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    // la fonction withdraw() est très gourmande en gas
    // on cree une nouvelle fonction moins gourmande
    function cheaperWithdraw() public payable onlyOwner {
        // on sauvegarde la liste des bayeurs s_funders du stockage en mémoire , et puis
        // on lit cette liste depuis la mémoire au lieu de lire du stockage
        // on comprends pourquoi on utilise "memory" pour les listes et les chaines de caractères
        address[] memory funders = s_funders;
        // le mappage ne peut se faire en mémoire
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    // création des getters: l'interet est que les devloppeurs sachent qu'il y le s_ devant les variables
    // qui signifie storage et donc faire attention au frais de gas en utilisant memory et aussi pour ne pas
    // desorienter ceux qui lisent le code
    // getter dico (adresse -> valeur fond)
    function getAddressToAmountFunded(
        address fundingAddress
    ) public view returns (uint256) {
        return s_addressToAmountFunded[fundingAddress];
    }

    // getter de la version
    function getVersion() public view returns (uint256) {
        return s_priceFeed.version();
    }

    // getter de la liste des bayeurs
    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    // un getter du proppritaire
    function getOwner() public view returns (address) {
        return i_owner;
    }

    // un getter du prix
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}

// ordre des fonctions:
/// constructeur
/// receive
/// fallback
/// external
/// public
/// internal
/// private
/// view/ pure

// procedure
/*
reseau "injected provider
reseau test goerli sur MM
deploy
ouverture de MM et confirmation de la création du contrat
verification de l'adresse du contrat sur etherscan
verification de l'adresse du compte de i_owner
verification de la version
verification du minimum usd
on envoie à travers MM (compte 1) un montant d'ether du compte owner vers l'adresse du contrat
la fonction receive() execute la fonction fund()
verification sur etherscan
verification sur remix de la case "funders": en entrant 0
nous obtenons l'adresse du compte 1 de MM utilisé pour l'envoi des fonds
on met cette adresse dans la case addressToaAmountFunders pour voir la balance (montant envoyé)












*/
