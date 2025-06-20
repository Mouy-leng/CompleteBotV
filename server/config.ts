import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface BrokerConfig {
  api_key: string;
  api_secret?: string;
  account_id?: string;
  environment?: string;
  server?: string;
  login?: string;
  password?: string;
  testnet?: boolean;
  enabled: boolean;
}

interface RiskSettings {
  max_risk_per_trade: number;
  max_total_risk: number;
  max_drawdown: number;
  max_position_size: number;
  max_daily_loss: number;
}

interface NotificationConfig {
  bot_token?: string;
  chat_id?: string;
  webhook_url?: string;
  enabled: boolean;
}

interface EnvironmentConfig {
  trading_mode: string;
  database_url: string;
  log_level: string;
  max_trades_per_minute: number;
  risk_settings: RiskSettings;
  brokers: {
    capital_com: BrokerConfig;
    binance: BrokerConfig;
    metatrader: BrokerConfig;
  };
  data_sources: {
    fred_api_key: string;
    fmp_api_key: string;
    news_api_key: string;
  };
  notifications: {
    telegram: NotificationConfig;
    discord: NotificationConfig;
    slack: NotificationConfig;
  };
}

interface AppConfig {
  environment: string;
  project: {
    name: string;
    version: string;
    description: string;
  };
  environments: {
    demo: EnvironmentConfig;
    live: EnvironmentConfig;
  };
  ai_models: {
    [key: string]: {
      enabled: boolean;
      confidence_threshold: number;
      retrain_interval_hours: number;
      model_path: string;
    };
  };
  trading_symbols: {
    forex: string[];
    crypto: string[];
    stocks: string[];
    commodities: string[];
  };
  websocket: {
    enabled: boolean;
    port: number;
    heartbeat_interval: number;
    reconnect_attempts: number;
    reconnect_interval: number;
  };
  security: {
    api_rate_limit: number;
    session_timeout: number;
    encryption_key: string;
    cors_origins: string[];
  };
}

class ConfigManager {
  private config!: AppConfig;
  private currentEnvironment: string;

  constructor() {
    this.loadConfig();
    this.currentEnvironment = process.env.TRADING_ENVIRONMENT || this.config.environment;
  }

  private loadConfig(): void {
    try {
      const configPath = path.join(process.cwd(), 'config.json');
      const configFile = fs.readFileSync(configPath, 'utf8');
      const rawConfig = JSON.parse(configFile);
      
      // Replace environment variables in the config
      this.config = this.replaceEnvVariables(rawConfig);
    } catch (error) {
      console.error('Failed to load config.json:', error);
      throw new Error('Configuration file not found or invalid');
    }
  }

  private replaceEnvVariables(obj: any): any {
    if (typeof obj === 'string') {
      // Replace ${VAR_NAME} with actual environment variable
      return obj.replace(/\$\{([^}]+)\}/g, (match, varName) => {
        return process.env[varName] || match;
      });
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.replaceEnvVariables(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.replaceEnvVariables(value);
      }
      return result;
    }
    
    return obj;
  }

  public getCurrentConfig(): EnvironmentConfig {
    const envConfig = this.config.environments[this.currentEnvironment as keyof typeof this.config.environments];
    if (!envConfig) {
      throw new Error(`Environment '${this.currentEnvironment}' not found in config`);
    }
    return envConfig;
  }

  public getProjectInfo() {
    return this.config.project;
  }

  public getTradingSymbols() {
    return this.config.trading_symbols;
  }

  public getAIModels() {
    return this.config.ai_models;
  }

  public getWebSocketConfig() {
    return this.config.websocket;
  }

  public getSecurityConfig() {
    return this.config.security;
  }

  public getRiskSettings(): RiskSettings {
    return this.getCurrentConfig().risk_settings;
  }

  public getBrokerConfig(broker: 'capital_com' | 'binance' | 'metatrader'): BrokerConfig {
    return this.getCurrentConfig().brokers[broker];
  }

  public getNotificationConfig() {
    return this.getCurrentConfig().notifications;
  }

  public getDataSourceConfig() {
    return this.getCurrentConfig().data_sources;
  }

  public isDemoMode(): boolean {
    return this.currentEnvironment === 'demo';
  }

  public isLiveMode(): boolean {
    return this.currentEnvironment === 'live';
  }

  public switchEnvironment(environment: 'demo' | 'live'): void {
    if (!this.config.environments[environment]) {
      throw new Error(`Environment '${environment}' not found`);
    }
    
    this.currentEnvironment = environment;
    console.log(`Switched to ${environment} environment`);
    
    // Log warning for live mode
    if (environment === 'live') {
      console.warn('⚠️  LIVE TRADING MODE ACTIVATED - REAL MONEY AT RISK ⚠️');
    }
  }

  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const currentConfig = this.getCurrentConfig();

    // Validate broker configurations
    Object.entries(currentConfig.brokers).forEach(([brokerName, brokerConfig]) => {
      if (brokerConfig.enabled) {
        if (!brokerConfig.api_key || brokerConfig.api_key.startsWith('${')) {
          errors.push(`${brokerName} API key not configured`);
        }
        
        if (brokerName !== 'metatrader' && (!brokerConfig.api_secret || brokerConfig.api_secret.startsWith('${'))) {
          errors.push(`${brokerName} API secret not configured`);
        }
      }
    });

    // Validate notification services
    if (currentConfig.notifications.telegram.enabled) {
      if (!currentConfig.notifications.telegram.bot_token || currentConfig.notifications.telegram.bot_token.startsWith('${')) {
        errors.push('Telegram bot token not configured');
      }
    }

    // Validate risk settings
    const risk = currentConfig.risk_settings;
    if (risk.max_risk_per_trade > 10) {
      errors.push('Max risk per trade exceeds 10% - this is dangerous');
    }
    
    if (risk.max_total_risk > 50) {
      errors.push('Max total risk exceeds 50% - this is extremely dangerous');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public getEnvironmentStatus() {
    const currentConfig = this.getCurrentConfig();
    const validation = this.validateConfig();
    
    return {
      current_environment: this.currentEnvironment,
      trading_mode: currentConfig.trading_mode,
      database_url: currentConfig.database_url.replace(/\/\/.*@/, '//***:***@'), // Hide credentials
      enabled_brokers: Object.entries(currentConfig.brokers)
        .filter(([_, config]) => config.enabled)
        .map(([name, _]) => name),
      enabled_notifications: Object.entries(currentConfig.notifications)
        .filter(([_, config]) => config.enabled)
        .map(([name, _]) => name),
      risk_settings: currentConfig.risk_settings,
      validation_status: validation.isValid ? 'VALID' : 'INVALID',
      validation_errors: validation.errors
    };
  }
}

// Create singleton instance
export const configManager = new ConfigManager();

// Export types for use in other modules
export type { EnvironmentConfig, BrokerConfig, RiskSettings, NotificationConfig };