// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthDataMonetization {
    struct HealthData {
        string dataHash;
        address owner;
        bool isAvailable;
        uint256 price;
        mapping(address => bool) hasAccess;
    }

    // Mapping from data ID to HealthData
    mapping(uint256 => HealthData) public healthDataRegistry;
    uint256 public nextDataId;

    // Events
    event DataRegistered(
        uint256 indexed dataId,
        address indexed owner,
        uint256 price
    );
    event DataPurchased(uint256 indexed dataId, address indexed buyer);
    event DataAccessRevoked(
        uint256 indexed dataId,
        address indexed revokedUser
    );
    event PriceUpdated(uint256 indexed dataId, uint256 newPrice);

    constructor() {
        nextDataId = 1;
    }

    function registerHealthData(
        string memory dataHash,
        uint256 price
    ) public returns (uint256) {
        require(bytes(dataHash).length > 0, "Data hash cannot be empty");
        require(price > 0, "Price must be greater than 0");

        uint256 dataId = nextDataId++;
        HealthData storage newData = healthDataRegistry[dataId];
        newData.dataHash = dataHash;
        newData.owner = msg.sender;
        newData.isAvailable = true;
        newData.price = price;

        emit DataRegistered(dataId, msg.sender, price);
        return dataId;
    }

    function purchaseAccess(uint256 dataId) public payable {
        HealthData storage data = healthDataRegistry[dataId];
        require(data.owner != address(0), "Data does not exist");
        require(data.isAvailable, "Data is not available for purchase");
        require(msg.value >= data.price, "Insufficient payment");
        require(!data.hasAccess[msg.sender], "Already has access");

        data.hasAccess[msg.sender] = true;
        payable(data.owner).transfer(msg.value);

        emit DataPurchased(dataId, msg.sender);
    }

    function updatePrice(uint256 dataId, uint256 newPrice) public {
        HealthData storage data = healthDataRegistry[dataId];
        require(data.owner == msg.sender, "Only owner can update price");
        require(newPrice > 0, "Price must be greater than 0");

        data.price = newPrice;
        emit PriceUpdated(dataId, newPrice);
    }

    function revokeAccess(uint256 dataId, address user) public {
        HealthData storage data = healthDataRegistry[dataId];
        require(data.owner == msg.sender, "Only owner can revoke access");
        require(data.hasAccess[user], "User does not have access");

        data.hasAccess[user] = false;
        emit DataAccessRevoked(dataId, user);
    }

    function hasAccess(
        uint256 dataId,
        address user
    ) public view returns (bool) {
        return healthDataRegistry[dataId].hasAccess[user];
    }

    function getDataDetails(
        uint256 dataId
    )
        public
        view
        returns (
            string memory dataHash,
            address owner,
            bool isAvailable,
            uint256 price
        )
    {
        HealthData storage data = healthDataRegistry[dataId];
        return (data.dataHash, data.owner, data.isAvailable, data.price);
    }
}
