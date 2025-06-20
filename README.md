# CAPITALend AI Trading Bot

A professional-grade AI-powered trading system with multi-asset support, advanced pattern recognition, real-time execution, and comprehensive monitoring.

![Trading Dashboard](https://img.shields.io/badge/Dashboard-Modern%20Blue%20Theme-blue)
![AI Models](https://img.shields.io/badge/AI-LSTM%20%7C%20XGBoost%20%7C%20CNN-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

## 🚀 Features

### 🤖 AI-Powered Trading
- **Multi-Model Ensemble**: LSTM, XGBoost, and CNN models for signal generation
- **Real-time Analysis**: Live market data processing with sub-second latency
- **Confidence Scoring**: AI signals with accuracy percentages
- **Auto-Retraining**: Scheduled model updates for market adaptation

### 📈 Trading Capabilities
- **Multi-Asset Support**: Forex, Crypto, Stocks, and Commodities
- **Risk Management**: Advanced position sizing and exposure controls
- **Demo/Live Modes**: Safe testing environment with production deployment
- **Multiple Brokers**: Capital.com, Binance, MetaTrader integration

### 💻 Modern Interface
- **Real-time Dashboard**: Live portfolio tracking and performance metrics
- **Interactive Charts**: TradingView-style charts with technical indicators
- **Mobile Responsive**: Works seamlessly across all devices
- **Dark Theme**: Professional blue-light optimized interface

## 🏗️ Architecture

```
CAPITALend AI Trading Bot
├── Client (React + TypeScript)
│   ├── Modern Dashboard UI
│   ├── Real-time Charts
│   └── WebSocket Integration
├── Server (Node.js + Express)
│   ├── Trading Engine
│   ├── AI Model Services
│   ├── Risk Management
│   └── Broker APIs
└── Configuration
    ├── Environment Management
    ├── API Key Security
    └── Risk Settings
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Git
- Trading account (Demo recommended for testing)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/capitalend-ai-trading-bot.git
cd capitalend-ai-trading-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. **Start the application**
```bash
npm run dev
```

5. **Access the dashboard**
Open http://localhost:5000 in your browser

## ⚙️ Configuration

### Environment Switching

The bot supports two environments:

#### Demo Mode (Default)
- Safe testing environment
- No real money at risk
- Demo broker accounts
- Reduced risk limits

#### Live Mode
- Real trading with actual funds
- Live broker connections
- Production risk settings
- ⚠️ **Use with extreme caution**

### API Keys Required

#### Trading Brokers
```bash
# Capital.com
CAPITAL_API_KEY_DEMO=your_demo_key
CAPITAL_API_SECRET_DEMO=your_demo_secret
CAPITAL_ACCOUNT_ID_DEMO=your_demo_account

# Binance
BINANCE_API_KEY_DEMO=your_testnet_key
BINANCE_API_SECRET_DEMO=your_testnet_secret

# MetaTrader (Optional)
MT5_SERVER_DEMO=demo_server
MT5_LOGIN_DEMO=your_login
MT5_PASSWORD_DEMO=your_password
```

#### Data Sources
```bash
# Economic Data
FRED_API_KEY=your_fred_key
FMP_API_KEY=your_financial_modeling_prep_key
NEWS_API_KEY=your_news_api_key
```

#### Notifications
```bash
# Telegram
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id

# Discord (Optional)
DISCORD_WEBHOOK_URL=your_webhook_url
```

## 🌐 Google Cloud Deployment

### Prerequisites
- Google Cloud account
- gcloud CLI installed
- Project with billing enabled

### Deployment Steps

1. **Prepare for production**
```bash
# Build the application
npm run build

# Set environment to live (if ready)
export TRADING_ENVIRONMENT=live
```

2. **Create Google Cloud project**
```bash
gcloud projects create capitalend-trading-bot
gcloud config set project capitalend-trading-bot
```

3. **Enable required APIs**
```bash
gcloud services enable compute.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable run.googleapis.com
```

4. **Deploy to Cloud Run**
```bash
gcloud run deploy capitalend-bot \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

5. **Set up Cloud SQL (for production)**
```bash
gcloud sql instances create trading-bot-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1
```

## 📊 Trading Strategies

### AI Signal Generation
- **LSTM Networks**: Time series pattern recognition
- **XGBoost**: Feature-based classification
- **CNN Models**: Chart pattern detection
- **Ensemble Voting**: Combined signal confidence

### Risk Management
- Maximum 2% risk per trade
- Portfolio exposure limits
- Daily loss protection
- Correlation analysis
- Automatic stop-loss management

### Supported Assets
- **Forex**: EUR/USD, GBP/USD, USD/JPY, etc.
- **Crypto**: BTC/USD, ETH/USD, major altcoins
- **Stocks**: AAPL, GOOGL, TSLA, etc.
- **Commodities**: Gold, Silver, Oil

## 🔧 Development

### Project Structure
```
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared types and schemas
├── config.json      # Environment configuration
└── .env.example     # Environment template
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Code linting
```

### Adding New Features
1. Update shared schemas in `shared/schema.ts`
2. Implement backend logic in `server/`
3. Create frontend components in `client/src/components/`
4. Update configuration in `config.json`

## 🛡️ Security

### API Key Management
- Environment variables for sensitive data
- Separate demo/live configurations
- Encrypted storage options
- Rotation capabilities

### Trading Safety
- Demo mode by default
- Risk limit enforcement
- Emergency stop mechanisms
- Activity logging and alerts

## 📈 Monitoring

### Real-time Metrics
- Portfolio performance
- Trade execution status
- AI model accuracy
- System health monitoring

### Alerts & Notifications
- Trade execution confirmations
- Risk threshold warnings
- System error notifications
- Performance reports

## 🆘 Support

### Getting Help
1. Check the configuration guide
2. Review error logs
3. Test with demo mode first
4. Contact support for broker API issues

### Common Issues
- **Connection errors**: Verify API keys and network
- **Trade rejections**: Check account balance and risk limits
- **Model errors**: Ensure sufficient historical data

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

**IMPORTANT**: This software is for educational and research purposes. Trading involves substantial risk of loss. Past performance does not guarantee future results. Only trade with funds you can afford to lose. The developers are not responsible for any financial losses.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Made with 💙 by the CAPITALend Team**