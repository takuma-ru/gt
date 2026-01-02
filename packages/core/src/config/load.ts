import { loadConfig } from "c12";
import { consola } from "consola";
import { gitGetTopLevel } from "../utils/git";
import { isPlainObject } from "../utils/isPlainObject";
import { mergeDeep } from "../utils/mergeDeep";
import type { ConfigExport, GtConfig, ReturnedGtConfig } from "./index";

export const DEFAULT_PREFIX_ALIASES: Record<string, string> = {
  f: "feature/",
  b: "fix/",
  r: "refactor/",
  c: "chore/",
  h: "hotfix/",
  s: "spike/",
};

const DEFAULT_CONFIG: ReturnedGtConfig = {
  nb: {
    prefixes: DEFAULT_PREFIX_ALIASES,
  },
};

const normalizeUserConfig = (value: unknown): GtConfig => {
  if (!isPlainObject(value)) return {};

  const result: GtConfig = {};
  const nb = value.nb;
  if (!isPlainObject(nb)) return result;

  const prefixesValue = nb.prefixes;
  if (!isPlainObject(prefixesValue)) {
    result.nb = {};
    return result;
  }

  const prefixes: Record<string, string> = {};
  for (const [key, v] of Object.entries(prefixesValue)) {
    if (typeof v === "string") prefixes[key] = v;
  }

  result.nb = { prefixes };
  return result;
};

export const loadGtConfig = async () => {
  const cwd = await gitGetTopLevel();

  try {
    const { config: loadedConfig, configFile } = await loadConfig<ConfigExport>(
      {
        cwd,
        name: "gt",
        configFile: "gt.config",
        rcFile: false,
        globalRc: false,
        packageJson: false,
        dotenv: false,
        envName: false,
      },
    );

    const resolved = !loadedConfig
      ? undefined
      : typeof loadedConfig === "function"
        ? await loadedConfig()
        : await loadedConfig;

    const userConfig = normalizeUserConfig(resolved);
    const mergedConfig = mergeDeep(DEFAULT_CONFIG, userConfig);

    return {
      config: mergedConfig,
      configFile,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    consola.error(`Failed to load gt config: ${message}`);
    throw error;
  }
};
