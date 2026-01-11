import { colors } from "consola/utils";

export interface NestedBoxOptions {
  title: string;
  lines: string[];
  titlePrefix?: string;
}

export interface NestedBoxLogger {
  log: (message: string) => void;
}

export const renderNestedBox = (options: NestedBoxOptions): string[] => {
  const { title, lines, titlePrefix = "?" } = options;

  const out: string[] = [];
  out.push(`  ${colors.dim("┌─║ ")}${colors.bold(title)}${colors.dim("")}`);
  out.push(`${colors.cyan(titlePrefix)} ${colors.dim("│ ╓─")}`);

  if (lines.length === 0) {
    out.push(`${colors.dim("  └─║")} ${colors.dim("Nothing to do.")}`);
    out.push(colors.dim("    ╙─"));
    return out;
  }

  for (let i = 0; i < lines.length; i++) {
    const prefix = i === 0 ? "  └─║" : "    ║";
    out.push(`${colors.dim(prefix)} ${lines[i]}`);
  }

  out.push(colors.dim("    ╙─"));
  return out;
};

export const nestedBox = (
  options: NestedBoxOptions,
  logger: NestedBoxLogger = console,
): void => {
  const rendered = renderNestedBox(options);
  for (const line of rendered) {
    logger.log(line);
  }
};
