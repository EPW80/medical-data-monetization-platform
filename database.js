// database/index.js
const mongoose = require("mongoose");

const healthDataSchema = new mongoose.Schema({
  dataHash: {
    type: String,
    required: true,
    unique: true,
  },
  encryptedData: {
    encrypted: String,
    iv: String,
    authTag: String,
  },
  owner: {
    type: String,
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  accessList: [
    {
      address: String,
      grantedAt: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const HealthData = mongoose.model("HealthData", healthDataSchema);

class DatabaseHandler {
  async connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  }

  async storeHealthData(dataHash, encryptedData, owner, price) {
    const healthData = new HealthData({
      dataHash,
      encryptedData,
      owner,
      price,
    });

    return await healthData.save();
  }

  async getHealthData(dataHash, requesterAddress) {
    const data = await HealthData.findOne({ dataHash });

    if (!data) {
      throw new Error("Data not found");
    }

    // Check if requester has access
    const hasAccess =
      data.owner === requesterAddress ||
      data.accessList.some((access) => access.address === requesterAddress);

    if (!hasAccess) {
      throw new Error("Access denied");
    }

    return data;
  }
}

module.exports = new DatabaseHandler();
