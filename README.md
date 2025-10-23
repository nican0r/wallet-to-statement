# Crypto Wallet Statement Generator

A React web application that generates professional bank-style statements for cryptocurrency wallets using blockchain data from the Alchemy API and historical pricing data from CoinGecko.

## Features

- Generate bank statements for Ethereum wallets
- Support for multiple ERC-20 tokens (ETH, USDC, USDT, DAI, WBTC, LINK, AAVE, UNI)
- Historical balance tracking with USD valuations
- Complete transaction history with running balances
- Professional PDF output resembling traditional bank statements
- Activity summary with deposits, withdrawals, and net change

## Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Alchemy API key (free tier available at [alchemy.com](https://www.alchemy.com))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Wallet_To_Statement
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your Alchemy API key to the `.env` file:
```
VITE_ALCHEMY_API_KEY=your_alchemy_api_key_here
```

## Usage

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Production Build

Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## How It Works

1. **User Input**: Enter account holder details, wallet address, statement period, and select tokens to track
2. **Data Fetching**: The app queries the Alchemy API for:
   - Token balances at the start and end of the period
   - All transactions during the specified timeframe
3. **Price Calculation**: Historical prices are fetched from CoinGecko API to calculate USD values
4. **Statement Generation**: All data is processed and formatted into a professional statement
5. **PDF Export**: Users can download a PDF version of the statement

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Query (TanStack Query)
- **Form Management**: React Hook Form + Zod
- **PDF Generation**: @react-pdf/renderer
- **APIs**:
  - Alchemy API (blockchain data)
  - CoinGecko API (historical prices)

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── PDFDocument/     # PDF generation components
│   ├── StatementForm.tsx
│   └── StatementPreview.tsx
├── services/
│   ├── alchemy.service.ts    # Blockchain data fetching
│   ├── pricing.service.ts    # Historical price data
│   └── statement.service.ts  # Statement generation logic
├── types/
│   ├── wallet.types.ts
│   ├── transaction.types.ts
│   └── statement.types.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── calculations.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Supported Tokens

- ETH (Ethereum)
- USDC (USD Coin)
- USDT (Tether USD)
- DAI (Dai Stablecoin)
- WBTC (Wrapped Bitcoin)
- LINK (Chainlink)
- AAVE (Aave)
- UNI (Uniswap)

## API Rate Limits

- **Alchemy API**: Free tier provides 300 compute units/second
- **CoinGecko API**: Free tier allows 10-50 calls/minute

The application includes built-in rate limiting and caching to stay within these limits.

## Limitations

- Currently supports Ethereum mainnet only
- Historical price data depends on CoinGecko availability
- Block number estimation may have slight inaccuracies
- Large transaction histories may take longer to process

## Future Enhancements

- Multi-chain support (Polygon, Arbitrum, etc.)
- NFT balance tracking
- DeFi protocol integration
- Tax reporting features
- Custom token addition
- Email delivery
- Multiple wallet consolidation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Disclaimer

This tool is for informational purposes only. Always verify blockchain data independently. The generated statements should not be considered as official financial documents. Historical prices are approximate and may not reflect actual trading prices at specific moments in time.
