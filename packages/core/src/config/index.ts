export interface NbConfig {
  prefixes?: Record<string, string>;
}

export interface GtConfig {
  nb?: NbConfig;
}

export interface ReturnedGtConfig extends GtConfig {
  nb: NbConfig & {
    prefixes: Record<string, string>;
  };
}

export type ConfigValue = GtConfig | Promise<GtConfig>;
export type ConfigFn = () => ConfigValue;
export type ConfigExport = ConfigValue | ConfigFn;

export const defineConfig = (config: ConfigExport): ConfigExport => config;
