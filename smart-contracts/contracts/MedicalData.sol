// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalData {
    struct MedicalRecord {
        address owner;
        string dataHash; // IPFS hash of encrypted medical record
        uint price;
        bool isForSale;
    }

    mapping(uint => MedicalRecord) public records;
    uint public recordCount;

    function uploadMedicalRecord(string memory _dataHash, uint _price) public {
        recordCount++;
        records[recordCount] = MedicalRecord(
            msg.sender,
            _dataHash,
            _price,
            true
        );
    }

    function purchaseRecord(uint _id) public payable {
        MedicalRecord storage record = records[_id];
        require(msg.value >= record.price, "Insufficient funds");
        require(record.isForSale, "Record is not for sale");

        record.owner = msg.sender;
        record.isForSale = false;
    }
}
