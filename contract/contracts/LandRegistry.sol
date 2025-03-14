// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract LandRegistry is ERC721Enumerable, Ownable {
    using Strings for uint256;

    struct OwnershipHistory {
        uint256 date;
        address owner;
    }

    struct LandDetails {
        string landId;
        address owner;
        string location;
        string state;
        string city;
        uint256 area;
        string areaInCent;
        string areaInSqft;
        OwnershipHistory[] history;
    }

    struct MarketplaceListing {
        string landId;
        address seller;
        string ratePerCent;
        string totalPrice;
        bool isForSale;
    }

    mapping(string => LandDetails) public landRegistry;
    mapping(string => MarketplaceListing) public marketplace;

    event LandMinted(string indexed landId, address indexed owner);
    event LandTransferred(string indexed landId, address indexed newOwner);
    event LandListedForSale(string indexed landId, string price);
    event LandSaleCancelled(string indexed landId);
    event LandSold(string indexed landId, address indexed newOwner);

    constructor() ERC721("LandNFT", "LAND") Ownable(msg.sender) {}

    // 🟢 Mint New Land (Only Admin/Govt)
    function mintLand(
        address owner,
        string memory landId,
        string memory location,
        string memory state,
        string memory city,
        uint256 area,
        string memory areaInCent,
        string memory areaInSqft
    ) public {
        _safeMint(owner, uint256(keccak256(abi.encodePacked(landId))));
        landRegistry[landId].landId = landId;
        landRegistry[landId].owner = owner;
        landRegistry[landId].location = location;
        landRegistry[landId].state = state;
        landRegistry[landId].city = city;
        landRegistry[landId].area = area;
        landRegistry[landId].areaInCent = areaInCent;
        landRegistry[landId].areaInSqft = areaInSqft;
        landRegistry[landId].history.push(
            OwnershipHistory(block.timestamp, owner)
        );

        emit LandMinted(landId, owner);
    }

    // 🔍 Get Land Details
    function getLand(
        string memory landId
    ) public view returns (LandDetails memory) {
        require(
            bytes(landRegistry[landId].landId).length > 0,
            "Land does not exist"
        );
        return landRegistry[landId];
    }

    // 🔄 Transfer Land Ownership
    // Add this function to your contract
    function transferLand(
        string memory landId,
        address newOwner
    ) public {
        landRegistry[landId].owner = newOwner;
        landRegistry[landId].history.push(
            OwnershipHistory(block.timestamp, newOwner)
        );

        emit LandTransferred(landId, newOwner);
    }

    function getLandsByOwner(
        address _owner
    ) public view returns (LandDetails[] memory) {
        uint256 totalLands = totalSupply();
        uint256 counter = 0;

        LandDetails[] memory ownedLands = new LandDetails[](totalLands);

        for (uint256 i = 0; i < totalLands; i++) {
            uint256 tokenId = tokenByIndex(i);
            string memory landId = tokenURI(tokenId);

            if (landRegistry[landId].owner == _owner) {
                ownedLands[counter] = landRegistry[landId];
                counter++;
            }
        }

        // Resize the array to actual owned lands count
        LandDetails[] memory resizedArray = new LandDetails[](counter);
        for (uint256 j = 0; j < counter; j++) {
            resizedArray[j] = ownedLands[j];
        }

        return resizedArray;
    }
}
