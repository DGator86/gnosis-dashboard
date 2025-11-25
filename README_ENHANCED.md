# 🚀 Gnosis Dashboard - Professional Trading Terminal

A comprehensive, production-ready trading dashboard built with React, TypeScript, and integrated with **Alpaca Markets** and **Unusual Whales** APIs for real-time market data, trading execution, and options flow analysis.

## 🌐 Live Demo

**[View Live Application](https://5173-i1wwn9p5rld5425pe492z-ad490db5.sandbox.novita.ai)**

## ✨ Features

### 📊 Real-Time Market Data
- **Live Price Updates** via Alpaca WebSocket
- **Candlestick Charts** with volume display
- **Multiple Timeframes**: 1D, 5D, 1M, 3M, 1Y, ALL
- **Real-time Price Changes** with color-coded indicators

### 📈 Technical Analysis
- **Moving Averages**: SMA, EMA
- **Momentum Indicators**: RSI, MACD
- **Volatility Bands**: Bollinger Bands
- **Toggle Indicators** on/off dynamically
- **Dedicated Indicator Panels** for detailed analysis

### 💼 Trading Features
- **Order Execution** via Alpaca API
  - Market, Limit, Stop, Stop-Limit orders
  - Buy/Sell functionality
  - Real-time order status
- **Portfolio Management**
  - Live positions and P&L
  - Account balance tracking
  - Order history
- **Price Alerts**
  - Above/Below/Crosses conditions
  - Toast notifications
  - Enable/disable alerts

### 🐋 Options Flow (Unusual Whales)
- **Real-time Options Flow** tracking
- **Whale Activity** monitoring
- **Premium and Size** analysis
- **Sentiment Indicators** (Bullish/Bearish/Neutral)
- **Strike and Expiration** details

### 🎨 User Experience
- **Dark/Light Theme** with persistence
- **Responsive Design** for all devices
- **Toast Notifications** for all actions
- **User Authentication** with JWT
- **Settings Panel** for customization
- **Watchlist Management** with search

### 🤖 AI-Generated Trade Ideas
- **Technical Analysis-Based** suggestions
- **Confidence Scoring** for each idea
- **Time Horizon** indicators (Intraday/Swing/Position)
- **Long/Short Bias** recommendations

## 🏗️ Technology Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Recharts** - Beautiful, composable charts
- **Zustand** - Lightweight state management
- **React Hot Toast** - Elegant notifications
- **React Icons** - Comprehensive icon library
- **date-fns** - Modern date formatting

### APIs & Services
- **Alpaca Markets API** - Real-time trading and market data
- **Alpaca WebSocket** - Live price streaming
- **Unusual Whales API** - Options flow and whale activity

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Alpaca API credentials (paper or live)
- Unusual Whales API token (optional)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/DGator86/gnosis-dashboard.git
cd gnosis-dashboard
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Add your API credentials to `.env`**
```env
# Alpaca API Configuration
VITE_ALPACA_API_KEY=your_alpaca_key_here
VITE_ALPACA_SECRET_KEY=your_alpaca_secret_here
VITE_ALPACA_BASE_URL=https://paper-api.alpaca.markets
VITE_ALPACA_WS_URL=wss://stream.data.alpaca.markets/v2/iex

# Unusual Whales API Configuration (Optional)
VITE_UNUSUAL_WHALES_API_KEY=your_uw_api_key_here
VITE_UNUSUAL_WHALES_BASE_URL=https://api.unusualwhales.com/api
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to `http://localhost:5173`

## 🎯 Usage Guide

### Getting Started

1. **Sign In** (Optional for demo mode)
   - Click "Sign In" in the header
   - Use any email/password for demo mode
   - Unlocks: Trading, Alerts, Portfolio features

2. **View Live Market Data**
   - Select a symbol from the watchlist
   - View real-time price updates
   - Switch between Line and Candlestick charts

3. **Add Technical Indicators**
   - Click "Indicators" button
   - Select from: SMA, EMA, RSI, MACD, Bollinger Bands
   - Toggle on/off as needed

4. **Place Orders** (Signed in only)
   - Toggle order panel with `+` button
   - Select order type (Market/Limit/Stop/Stop-Limit)
   - Choose Buy or Sell
   - Enter quantity and prices
   - Submit order

5. **Set Price Alerts**
   - Navigate to Alerts panel
   - Click `+` to add alert
   - Choose condition (Above/Below/Crosses)
   - Enter target price
   - Enable/disable as needed

6. **View Options Flow**
   - Click "Options Flow" tab at bottom
   - See real-time whale activity
   - Analyze premium, size, and sentiment
   - Track calls vs puts

7. **Monitor Portfolio**
   - Click activity icon in header
   - View all open positions
   - Check P&L (dollar and percentage)
   - Review order history
   - Refresh for latest data

### Keyboard Shortcuts
- `/` - Focus search box
- `Esc` - Close modals

## 📂 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── AlertsPanel.tsx
│   ├── CandlestickChart.tsx
│   ├── IndicatorPanel.tsx
│   ├── LoginModal.tsx
│   ├── OptionsFlowPanel.tsx
│   ├── OrderPanel.tsx
│   ├── PortfolioPanel.tsx
│   ├── SettingsPanel.tsx
│   └── VolumeChart.tsx
├── hooks/              # Custom React hooks
│   ├── useMarketData.ts
│   └── useWebSocket.ts
├── services/           # API and external services
│   ├── alpaca.ts
│   ├── alpacaWebSocket.ts
│   ├── apiIntegrated.ts
│   └── unusualWhales.ts
├── store/              # State management
│   └── useAppStore.ts
├── types/              # TypeScript definitions
│   └── index.ts
├── utils/              # Utility functions
│   └── indicators.ts
├── App.enhanced.tsx    # Main application
├── enhanced.css        # Additional styles
├── index.css          # Base styles
└── main.tsx           # Entry point
```

## 🔐 API Credentials

### Alpaca Markets
1. Sign up at [Alpaca Markets](https://alpaca.markets/)
2. Create paper trading account
3. Generate API keys from dashboard
4. Add to `.env` file

### Unusual Whales
1. Subscribe at [Unusual Whales](https://unusualwhales.com/)
2. Get API token from account settings
3. Add to `.env` file
4. (Optional - app works without it)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel
```bash
vercel
```

### Deploy to Netlify
```bash
netlify deploy --prod
```

## 🛠️ Development

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## 📊 Features in Detail

### Market Data Integration
- Real-time streaming via WebSocket
- Historical data with configurable timeframes
- Symbol search and autocomplete
- Multiple data sources with fallbacks

### Trading Execution
- Direct order placement to Alpaca
- Support for all major order types
- Real-time order status updates
- Position and P&L tracking

### Technical Analysis
- Complete indicator calculation library
- Dynamic indicator overlays
- Multi-panel chart layouts
- Custom visualization components

### Options Analytics
- Real-time options flow
- Unusual activity detection
- Premium volume analysis
- Sentiment tracking

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Alpaca Markets** for trading API
- **Unusual Whales** for options data
- **Recharts** for chart components
- **React Team** for React 19

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact: [your-email]

## 🔄 Updates

### Latest (v2.0.0)
- ✅ Integrated Alpaca API for real trading
- ✅ Added Unusual Whales options flow
- ✅ Real-time WebSocket connections
- ✅ Enhanced portfolio management
- ✅ Live order execution

### Previous (v1.0.0)
- ✅ All 12 core features
- ✅ Technical indicators
- ✅ User authentication
- ✅ Theme customization

---

**Built with ❤️ for traders by traders**
