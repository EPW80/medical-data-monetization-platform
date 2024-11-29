# Health Data Monetization Platform Frontend

A Next.js frontend application for managing and monetizing health data using blockchain technology. This frontend interfaces with the Health Data Monetization smart contract deployed on the Sepolia testnet.

## Features

- Wallet connection using RainbowKit
- Health data submission and viewing
- Blockchain integration with Ethereum (Sepolia testnet)
- Real-time data updates
- Secure authentication system

## Prerequisites

- Node.js 18.17.0 or later
- MetaMask or another Web3 wallet
- Sepolia testnet ETH for transactions
- WalletConnect Project ID

## Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd health-data-frontend-new
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Using the Platform

1. Connect your wallet using the "Connect Wallet" button
2. Make sure you're on the Sepolia testnet
3. Submit health data using the form
4. View your submitted data in the list
5. Manage your health data transactions

## Project Structure

```
health-data-frontend-new/
├── app/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── HealthDataList.tsx
│   ├── HomeContent.tsx
│   ├── Navbar.tsx
│   └── SubmitHealthDataForm.tsx
├── providers/
│   └── Web3Provider.tsx
└── public/
```

## Backend Integration

This frontend is designed to work with the Health Data Monetization backend running on `http://localhost:3000`. Make sure the backend server is running before using the application.

## Development

To modify the frontend:

1. Components are in the `components/` directory
2. Main page logic is in `app/page.tsx`
3. Wallet integration is handled in `providers/Web3Provider.tsx`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs/introduction)
- [wagmi Documentation](https://wagmi.sh/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
