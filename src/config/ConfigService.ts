import * as fs from 'fs';
import * as path from 'path';

export interface AppConfig {
  apiKey: string;
  categories: string[];
  outputFile: string;
}

/**
 * Singleton ConfigService
 *
 * The Singleton pattern ensures that only one instance of the configuration
 * manager exists across the entire lifecycle of the application.
 *
 * Why Singleton here?
 * 1. Configuration is read once from disk (I/O optimization).
 * 2. Provides a single, globally accessible source of truth for all components
 *    (API client, orchestrator, builder) without "prop drilling".
 * 3. Guarantees consistency: settings cannot diverge between modules.
 */
export class ConfigService {
  private static instance: ConfigService | null = null;
  private config: AppConfig;

  /**
   * Private constructor prevents external instantiation with `new ConfigService()`.
   * Reads and parses config.json synchronously during initial instantiation.
   */
  private constructor(customConfigPath?: string) {
    const configPath = customConfigPath || path.resolve(process.cwd(), 'config.json');

    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found at: ${configPath}`);
    }

    try {
      const fileData = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(fileData);

      if (!parsed.apiKey && parsed.apiKey !== '') {
        throw new Error('Config missing "apiKey" field');
      }

      if (!Array.isArray(parsed.categories)) {
        throw new Error('Config "categories" must be an array of strings');
      }

      if (!parsed.outputFile) {
        throw new Error('Config missing "outputFile" field');
      }

      this.config = {
        apiKey: parsed.apiKey,
        categories: parsed.categories,
        outputFile: parsed.outputFile,
      };
    } catch (err: any) {
      throw new Error(`Failed to load or parse config.json: ${err.message}`);
    }
  }

  /**
   * Static access point to retrieve the single instance of ConfigService.
   * Creates the instance lazily on first access.
   */
  public static getInstance(customConfigPath?: string): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService(customConfigPath);
    }
    return ConfigService.instance;
  }

  /**
   * Helper method for unit testing environments where singleton state
   * needs to be reset between isolated tests.
   */
  public static resetInstance(): void {
    ConfigService.instance = null;
  }

  public getApiKey(): string {
    return this.config.apiKey;
  }

  public getCategories(): string[] {
    return [...this.config.categories];
  }

  public getOutputFile(): string {
    return this.config.outputFile;
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }
}
