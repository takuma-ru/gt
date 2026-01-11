export const ExitCode = {
  Success: 0,
  Error: 1,
  Noop: 2,
  PrerequisiteMissing: 3,
} as const;

export type ExitCode = (typeof ExitCode)[keyof typeof ExitCode];
