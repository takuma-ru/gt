import { colors } from "consola/utils";
import { nestedBox } from "./nestedBox";

export interface DryRun {
  enabled: boolean;
  commands: string[];
  record: (bin: string, args: string[]) => void;
  printAndExit: () => void;
}

const quote = (value: string) => {
  // Keep it shell-friendly and readable.
  if (/^[A-Za-z0-9_./:@=-]+$/.test(value)) return value;
  return `'${value.replaceAll("'", "'\\''")}'`;
};

export const createDryRun = (enabled: boolean): DryRun | undefined => {
  if (!enabled) return undefined;

  const commands: string[] = [];

  const record = (bin: string, args: string[]) => {
    commands.push([bin, ...args].map(quote).join(" "));
  };

  const printAndExit = () => {
    const lines = commands.map(
      (cmd, index) => `STEP${index + 1}: ${colors.dim("$")} ${cmd}`,
    );
    nestedBox({
      title: "(dry-run) Planned commands",
      lines,
    });
  };

  return {
    enabled,
    commands,
    record,
    printAndExit,
  };
};
