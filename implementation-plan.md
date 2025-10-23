# Crypto Wallet Bank Statement Generator - Implementation Plan

## Project Overview
A React web application that generates PDF bank statements for cryptocurrency wallets using historical blockchain data from the Alchemy API.

## Technology Stack

### Frontend
- **React** (with TypeScript for type safety)
- **Vite** (for fast development and build tooling)
- **React Hook Form** (for form management and validation)
- **Date-fns** or **Day.js** (for date manipulation)
- **TailwindCSS** (for styling)

### APIs & Services
- **Alchemy API** (blockchain indexing and historical data)
  - Asset Transfers API (for transaction history)
  - Token Balances API (for wallet token holdings)
- **CoinGecko API** or **CryptoCompare API** (for historical price data)

### PDF Generation
- **react-pdf/renderer** or **jsPDF with html2canvas** (for PDF generation)

### State Management
- **React Context** or **Zustand** (lightweight state management)

## Architecture

### Component Structure
```
src/
├── components/
│   ├── forms/
│   │   ├── WalletInputForm.tsx
│   │   ├── AccountHolderForm.tsx
│   │   ├── StatementPeriodForm.tsx
│   │   └── TokenSelectionForm.tsx
│   ├── statement/
│   │   ├── StatementPreview.tsx
│   │   ├── StatementHeader.tsx
│   │   ├── BalanceSummary.tsx
│   │   ├── TransactionTable.tsx
│   │   └── ActivitySummary.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── DatePicker.tsx
│   │   ├── Loader.tsx
│   │   └── ErrorMessage.tsx
│   └── PDFDocument/
│       ├── BankStatementPDF.tsx
│       └── PDFStyles.ts
├── services/
│   ├── alchemy.service.ts
│   ├── pricing.service.ts
│   ├── statement.service.ts
│   └── pdf.service.ts
├── hooks/
│   ├── useWalletData.ts
│   ├── useHistoricalPrices.ts
│   └── useStatementGeneration.ts
├── types/
│   ├── wallet.types.ts
│   ├── transaction.types.ts
│   └── statement.types.ts
├── utils/
│   ├── formatters.ts
│   ├── calculations.ts
│   └── validators.ts
└── App.tsx
```

## Implementation Phases

### Phase 1: Project Setup & Basic UI (Day 1)

#### Tasks:
1. **Initialize React + Vite project with TypeScript**
   ```bash
   npm create vite@latest wallet-statement -- --template react-ts
   ```

2. **Install dependencies**
   ```bash
   npm install @tanstack/react-query axios date-fns
   npm install react-hook-form @hookform/resolvers zod
   npm install @react-pdf/renderer
   npm install -D tailwindcss postcss autoprefixer
   npm install lucide-react # for icons
   ```

3. **Configure TailwindCSS**
   - Set up tailwind.config.js
   - Configure base styles

4. **Set up environment variables**
   ```
   VITE_ALCHEMY_API_KEY=your_key_here
   VITE_PRICING_API_KEY=your_key_here
   ```

5. **Create basic type definitions**
   - Define interfaces for Wallet, Transaction, Token, Statement
   - Define API response types

6. **Build main form UI**
   - Account holder name input
   - Account holder address input (multi-line)
   - Wallet address input (with validation)
   - Statement period date pickers (start/end)
   - Token selection (multi-select or checkboxes)
   - Generate statement button

### Phase 2: Alchemy API Integration (Day 2)

#### Tasks:
1. **Set up Alchemy SDK/API client**
   ```typescript
   // alchemy.service.ts
   - Configure API endpoints
   - Set up authenticated requests
   - Handle rate limiting
   ```

2. **Implement wallet balance fetching**
   - Use `alchemy_getTokenBalances` endpoint
   - Filter for specific tokens
   - Handle pagination if needed

3. **Implement transaction history fetching**
   - Use `alchemy_getAssetTransfers` endpoint
   - Parameters:
     - fromBlock: calculate from start date
     - toBlock: calculate from end date
     - fromAddress/toAddress: wallet address
     - category: ['external', 'internal', 'erc20', 'erc721', 'erc1155']
   - Fetch all transactions in date range
   - Handle pagination for large transaction sets

4. **Get historical block numbers from timestamps**
   - Create utility to convert dates to block numbers
   - Use Alchemy's `eth_getBlockByNumber` or external services
   - Cache block number lookups

5. **Create custom React hooks**
   ```typescript
   // useWalletData.ts
   - Fetch wallet balances at specific block
   - Fetch transaction history
   - Handle loading/error states
   ```

### Phase 3: Historical Pricing Integration (Day 3)

#### Tasks:
1. **Set up pricing service**
   ```typescript
   // pricing.service.ts
   - CoinGecko API integration (free tier: 50 calls/min)
   - Endpoints:
     - /coins/{id}/history (for specific date prices)
     - /coins/{id}/market_chart/range (for date range)
   ```

2. **Token price resolution**
   - Map token contract addresses to CoinGecko IDs
   - Create token mapping configuration
   - Handle common tokens (ETH, USDC, USDT, DAI, etc.)

3. **Calculate historical values**
   - Opening balance value (start date prices)
   - Closing balance value (end date prices)
   - Transaction values (price at transaction date)
   - Running balance calculations

4. **Implement caching strategy**
   - Cache price data to minimize API calls
   - Use React Query for automatic caching
   - Store computed values

### Phase 4: Statement Processing Logic (Day 4)

#### Tasks:
1. **Create statement service**
   ```typescript
   // statement.service.ts

   interface StatementData {
     accountHolder: {
       name: string;
       address: string;
     };
     walletAddress: string;
     statementPeriod: {
       startDate: Date;
       endDate: Date;
     };
     tokens: Token[];
     openingBalance: {
       tokens: TokenBalance[];
       usdValue: number;
     };
     closingBalance: {
       tokens: TokenBalance[];
       usdValue: number;
     };
     transactions: Transaction[];
     summary: {
       totalDeposits: number;
       totalWithdrawals: number;
       transactionCount: number;
     };
   }
   ```

2. **Implement balance calculations**
   - Calculate opening balance (balance at start block)
   - Calculate closing balance (balance at end block)
   - Running balance after each transaction

3. **Process transactions**
   - Sort transactions chronologically
   - Categorize as debit/credit
   - Calculate USD value at transaction time
   - Compute running balance

4. **Generate summary statistics**
   - Sum total deposits (credits)
   - Sum total withdrawals (debits)
   - Count transactions
   - Calculate net change

5. **Data validation**
   - Verify balance calculations
   - Check transaction completeness
   - Validate date ranges

### Phase 5: PDF Generation (Day 5)

#### Tasks:
1. **Design PDF layout using @react-pdf/renderer**
   ```typescript
   // BankStatementPDF.tsx
   import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
   ```

2. **Create PDF components**
   - **Header section**
     - Statement title
     - Generation date
     - Account holder information
     - Wallet address
     - Statement period

   - **Balance summary section**
     - Opening balance (with token breakdown)
     - Closing balance (with token breakdown)
     - Net change

   - **Transaction table**
     - Columns: Date | Description | Debit | Credit | Balance
     - Formatted currency values
     - Alternating row colors for readability

   - **Activity summary section**
     - Total deposits
     - Total withdrawals
     - Transaction count

   - **Footer**
     - Disclaimer about blockchain data source
     - Page numbers

3. **Styling**
   - Professional bank statement appearance
   - Monospace fonts for numbers
   - Clear section separators
   - Proper spacing and alignment

4. **Implement PDF download**
   ```typescript
   import { PDFDownloadLink } from '@react-pdf/renderer';

   <PDFDownloadLink
     document={<BankStatementPDF data={statementData} />}
     fileName={`statement_${walletAddress}_${dateRange}.pdf`}
   >
     {({ loading }) => loading ? 'Generating PDF...' : 'Download Statement'}
   </PDFDownloadLink>
   ```

### Phase 6: UI/UX Enhancements (Day 6)

#### Tasks:
1. **Add loading states**
   - Skeleton loaders during data fetching
   - Progress indicators for multi-step process
   - Spinners for PDF generation

2. **Error handling**
   - Display user-friendly error messages
   - Handle API failures gracefully
   - Validation errors on form inputs
   - Retry mechanisms

3. **Statement preview**
   - Show formatted statement data before PDF generation
   - Allow users to review before downloading
   - Edit option to go back and modify inputs

4. **Responsive design**
   - Mobile-friendly form layout
   - Tablet and desktop optimizations
   - Accessible UI components

5. **Form validation**
   - Wallet address format validation (0x... format)
   - Date range validation (end > start)
   - Required field checks
   - Token selection validation (at least one token)

### Phase 7: Testing & Optimization (Day 7)

#### Tasks:
1. **Unit tests**
   - Test calculation functions
   - Test data formatters
   - Test validation logic

2. **Integration tests**
   - Test API integrations
   - Test full statement generation flow

3. **Performance optimization**
   - Lazy load components
   - Optimize API calls (batching, caching)
   - Memoize expensive calculations
   - Code splitting

4. **Error scenarios**
   - Test with invalid wallet addresses
   - Test with wallets having no transactions
   - Test with unsupported tokens
   - Test API rate limiting

## Data Flow

```
1. User Input
   ↓
2. Form Validation
   ↓
3. Fetch Block Numbers (convert dates → blocks)
   ↓
4. Parallel API Calls:
   - Alchemy: Get opening balance (at start block)
   - Alchemy: Get closing balance (at end block)
   - Alchemy: Get all transactions (between blocks)
   ↓
5. Fetch Historical Prices:
   - Get prices for opening balance date
   - Get prices for closing balance date
   - Get prices for each transaction date
   ↓
6. Process Data:
   - Calculate USD values
   - Sort transactions
   - Compute running balances
   - Generate summary statistics
   ↓
7. Generate Statement Preview
   ↓
8. User Reviews & Downloads PDF
```

## API Endpoints Reference

### Alchemy API
```typescript
// Get token balances at specific block
POST https://eth-mainnet.g.alchemy.com/v2/{apiKey}
{
  "jsonrpc": "2.0",
  "method": "alchemy_getTokenBalances",
  "params": ["{walletAddress}", "erc20"],
  "id": 1
}

// Get asset transfers
POST https://eth-mainnet.g.alchemy.com/v2/{apiKey}
{
  "jsonrpc": "2.0",
  "method": "alchemy_getAssetTransfers",
  "params": [{
    "fromBlock": "0x...",
    "toBlock": "0x...",
    "fromAddress": "0x...",
    "category": ["external", "erc20"],
    "withMetadata": true,
    "excludeZeroValue": true
  }],
  "id": 1
}
```

### CoinGecko API (Price History)
```
GET https://api.coingecko.com/api/v3/coins/{coin_id}/history
?date={dd-mm-yyyy}

GET https://api.coingecko.com/api/v3/simple/token_price/ethereum
?contract_addresses={address}&vs_currencies=usd&date={timestamp}
```

## Key Considerations

### 1. Blockchain Networks
- Start with Ethereum mainnet
- Consider supporting other chains (Polygon, Arbitrum, etc.) later
- Use Alchemy's multi-chain support

### 2. Token Support
- Focus on major ERC-20 tokens initially
- Support ETH (native token)
- Add NFT support (ERC-721, ERC-1155) as enhancement

### 3. Date/Block Conversion
- Ethereum blocks are ~12 seconds apart
- Use Alchemy or Etherscan API to get exact block numbers
- Cache block-to-timestamp mappings

### 4. Rate Limiting
- Alchemy free tier: 300 compute units/second
- CoinGecko free tier: 50 calls/minute
- Implement request queuing and caching

### 5. Privacy & Security
- All processing happens client-side
- No wallet private keys required (read-only)
- API keys exposed in frontend (use backend proxy for production)

### 6. Edge Cases
- Zero balance wallets
- Wallets with thousands of transactions (pagination)
- Failed transactions
- Token decimals handling (different tokens have different decimals)
- Contract interactions vs. simple transfers

## Future Enhancements

1. **Multi-chain support** - Polygon, BSC, Arbitrum, Optimism
2. **Multiple wallet addresses** - Consolidated statements
3. **Tax reporting** - Capital gains calculations
4. **Custom token addition** - Allow users to add any ERC-20
5. **Statement templates** - Different bank statement styles
6. **CSV export** - Alternative to PDF
7. **Recurring generation** - Schedule automatic statement creation
8. **Historical statement storage** - Save generated statements
9. **DeFi protocol integration** - Include staking, lending positions
10. **Email delivery** - Send statement to email address

## Development Timeline

- **Day 1**: Project setup + Basic UI
- **Day 2**: Alchemy integration
- **Day 3**: Price data integration
- **Day 4**: Statement processing logic
- **Day 5**: PDF generation
- **Day 6**: UI/UX polish
- **Day 7**: Testing & optimization

**Total Estimated Time**: 7 days (1 developer)

## Success Criteria

- [x] User can input wallet address and date range
- [x] Application fetches real blockchain data via Alchemy
- [x] Historical prices are accurately retrieved
- [x] Statement shows opening/closing balances in USD
- [x] All transactions are listed with correct debit/credit
- [x] Running balance is calculated correctly
- [x] Activity summary shows accurate totals
- [x] PDF is generated and downloadable
- [x] PDF format resembles professional bank statement
- [x] Error handling for invalid inputs
- [x] Responsive design works on mobile/desktop
