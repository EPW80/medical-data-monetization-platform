# Health Data Monetization Platform

A decentralized platform for securely storing, managing, and monetizing health data using blockchain technology. This platform consists of a Node.js/Express backend and Next.js frontend, integrated with Ethereum smart contracts on the Sepolia testnet.

## Project Structure

```
health-data-backend/             # Backend server
├── src/
│   ├── routes/                  # API routes
│   ├── blockchain/              # Blockchain integration
│   ├── auth/                    # Authentication
│   └── utils/                   # Utilities
└── contracts/                   # Smart contracts

health-data-frontend-new/        # Frontend application
├── components/                  # React components
├── providers/                   # Context providers
└── public/                     # Static assets
```

## Features

- Web3 wallet integration using RainbowKit
- Smart contract interaction for health data management
- Secure authentication using JWT and wallet signatures
- Real-time health data submission and retrieval
- Blockchain-based data monetization

## Prerequisites

- Node.js v18.17.0 or later
- Ethereum wallet (MetaMask recommended)
- Sepolia testnet ETH for transactions
- MongoDB (optional)

## Quick Start

1. **Clone the repository**

```bash
git clone [repository-url]
```

2. **Backend Setup**

```bash
cd health-data-backend
npm install
# Create .env file with required variables
npm start
```

Required `.env` variables for backend:

```
INFURA_API_KEY=your_infura_key
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=your_contract_address
JWT_SECRET=your_jwt_secret
```

3. **Frontend Setup**

```bash
cd health-data-frontend-new
npm install
# Create .env.local file
npm run dev
```

Required `.env.local` variables for frontend:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

4. **Run both services concurrently**

```bash
cd health-data-backend
npm run dev
```

## Available Scripts

### Backend

- `npm start`: Start the production server
- `npm run dev`: Run both frontend and backend in development mode
- `npm run server`: Run backend only with nodemon
- `npm run client`: Run frontend only

### Frontend

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server

## API Endpoints

- `POST /api/submit-data`: Submit health data
- `GET /api/health-data`: Retrieve health data
- `POST /api/auth/challenge`: Get authentication challenge
- `POST /api/auth/verify`: Verify wallet signature

## Smart Contract

The platform uses a custom smart contract deployed on Sepolia testnet for:

- Data registration
- Access control
- Monetization features

## Security Features

- JWT authentication
- Wallet signature verification
- Rate limiting
- Request encryption
- CORS protection

## Development Notes

- Backend runs on port 3000 by default
- Frontend runs on port 3001
- Smart contract interactions require Sepolia ETH

## Contributing

Contributions are welcome! Please follow the standard fork and pull request workflow.

## License

ISC
