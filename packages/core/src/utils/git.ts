import { execa } from "execa";

import type { DryRun } from "./dryRun";

const runGit = async (args: string[], dryRun?: DryRun) => {
  if (dryRun?.enabled) {
    dryRun.record("git", args);
    return;
  }
  return await execa("git", args);
};

export const gitFetch = async (
  remote: string,
  branch?: string,
  options: string[] = [],
  dryRun?: DryRun,
) => {
  const args = ["fetch", ...options, remote];
  if (branch) args.push(branch);
  return await runGit(args, dryRun);
};

export const gitGetTopLevel = async () => {
  try {
    const { stdout } = await execa("git", ["rev-parse", "--show-toplevel"]);
    return stdout.trim();
  } catch {
    return process.cwd();
  }
};

export const gitCreateBranch = async (
  newBranch: string,
  baseBranch?: string,
  options: string[] = [],
  dryRun?: DryRun,
) => {
  const args = ["switch", "-c", newBranch, ...options];
  if (baseBranch) args.push(baseBranch);
  return await runGit(args, dryRun);
};

export const gitGetCurrentBranch = async () => {
  const { stdout } = await execa("git", ["branch", "--show-current"]);
  return stdout.trim();
};

export const gitGetStatus = async () => {
  const { stdout } = await execa("git", ["status", "--porcelain"]);
  return stdout.trim();
};

export const gitSwitch = async (
  branch: string,
  options: string[] = [],
  dryRun?: DryRun,
) => {
  return await runGit(["switch", ...options, branch], dryRun);
};

export const gitStash = async (dryRun?: DryRun) => {
  return await runGit(["stash"], dryRun);
};

export const gitStashPop = async (dryRun?: DryRun) => {
  return await runGit(["stash", "pop"], dryRun);
};

export const gitPull = async (
  remote: string,
  branch: string,
  dryRun?: DryRun,
) => {
  return await runGit(["pull", remote, branch], dryRun);
};

export const gitRebase = async (baseBranch: string, dryRun?: DryRun) => {
  return await runGit(["rebase", baseBranch], dryRun);
};

export const gitHasRemote = async (remote: string) => {
  try {
    const { stdout } = await execa("git", ["remote"]);
    return stdout.split("\n").includes(remote);
  } catch {
    return false;
  }
};

export const gitHasBranch = async (branch: string) => {
  try {
    await execa("git", ["rev-parse", "--verify", branch]);
    return true;
  } catch {
    return false;
  }
};

export const gitGetMergedBranches = async (baseBranch: string) => {
  const { stdout } = await execa("git", ["branch", "--merged", baseBranch]);
  return stdout;
};

export const gitDeleteBranch = async (
  branch: string,
  force = false,
  dryRun?: DryRun,
) => {
  return await runGit(["branch", force ? "-D" : "-d", branch], dryRun);
};

export const gitAdd = async (pathspec: string = ".", dryRun?: DryRun) => {
  return await runGit(["add", pathspec], dryRun);
};

export const gitCommit = async (message: string, dryRun?: DryRun) => {
  return await runGit(["commit", "-m", message], dryRun);
};

export const gitPush = async (
  remote: string,
  branch: string,
  setUpstream = false,
  dryRun?: DryRun,
) => {
  const args = ["push"];
  if (setUpstream) args.push("-u");
  args.push(remote, branch);
  return await runGit(args, dryRun);
};
