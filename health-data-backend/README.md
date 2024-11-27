# Health Data Monetization Platform

A blockchain-powered platform that revolutionizes health data sharing by enabling secure, transparent, and profitable exchange between data providers and researchers. Built on Ethereum smart contracts, our platform ensures data privacy, maintains regulatory compliance, and creates a seamless marketplace for valuable health datasets.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Platform](https://img.shields.io/badge/platform-Ethereum--Sepolia-purple.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2018.0.0-green.svg)

## 🌟 Key Features

### For Data Providers

- **Secure Data Monetization:** Monetize health datasets while maintaining complete control
- **Smart Contract Integration:** Automated access management through Ethereum smart contracts
- **Blockchain Security:** All transactions and access rights managed on Sepolia testnet
- **Flexible Pricing:** Set and update prices for your health data

### For Researchers

- **Secure Access:** Authenticated access to health datasets
- **Data Verification:** All data hashed and verified on-chain
- **Transparent Pricing:** Clear pricing structure for each dataset
- **JWT Authentication:** Secure token-based access to the platform

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm
- MetaMask or Ethereum wallet
- Infura API key
- Sepolia testnet ETH

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/health-data-backend.git

# Install dependencies
cd health-data-backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### Environment Setup

Create a `.env` file with:

```env
INFURA_API_KEY=your_infura_key
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Smart Contract Deployment

```bash
# Compile the contract
node scripts/compile.js

# Deploy to Sepolia
node scripts/deploy.js

# Verify deployment
node scripts/check-wallet.js
```

### Running the Server

```bash
# Start the server
node src/index.js

# Seed test data (optional)
node scripts/seedData.js
```

## 💻 API Endpoints

### Authentication

```http
POST /api/auth/challenge    # Get authentication challenge
POST /api/auth/verify      # Verify signature and get JWT token
```

### Health Data Management

```http
POST /api/health-data/submit    # Submit new health data
GET /api/health-data/:id        # Get health data by ID
GET /api/health-data            # List all available health data
```

### Wallet Operations

```http
GET /api/wallet/info            # Get wallet information
```

### Contract Management

```http
GET /api/contract/status        # Check contract status
```

## 🔒 Security Features

- JWT-based authentication
- Ethereum wallet signature verification
- Smart contract access control
- Request validation
- Error handling and logging

## 📝 Scripts

- `check-wallet.js`: Verify wallet connection and balance
- `compile.js`: Compile smart contracts
- `deploy.js`: Deploy contracts to Sepolia
- `seedData.js`: Generate and upload test data
- `signMessage.js`: Helper for signing authentication messages

## 🛠️ Tech Stack

- **Backend:** Node.js, Express
- **Blockchain:** Ethereum (Sepolia), ethers.js
- **Authentication:** JWT, Ethereum signatures
- **Smart Contracts:** Solidity
- **Development:** Infura, Sepolia testnet

## 🔐 Smart Contract

The `HealthDataMonetization` smart contract includes:

- Data registration
- Access control
- Price management
- Ownership verification

## 🧪 Testing

```bash
# Test authentication flow
node scripts/testAuth.js

# Test contract connection
node scripts/check-wallet.js
```

## 📈 Next Steps

- [ ] Add data encryption
- [ ] Implement data access revocation
- [ ] Add payment processing
- [ ] Create frontend interface
- [ ] Add data validation rules
- [ ] Implement rate limiting

## 📄 License

ISC License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
