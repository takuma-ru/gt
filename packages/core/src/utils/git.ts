import { execa } from "execa";

export const gitFetch = async (
  remote: string,
  branch?: string,
  options: string[] = [],
) => {
  const args = ["fetch", ...options, remote];
  if (branch) args.push(branch);
  return await execa("git", args);
};

export const gitSwitch = async (branch: string, options: string[] = []) => {
  return await execa("git", ["switch", ...options, branch]);
};

export const gitCreateBranch = async (
  newBranch: string,
  baseBranch?: string,
) => {
  const args = ["switch", "-c", newBranch];
  if (baseBranch) args.push(baseBranch);
  return await execa("git", args);
};

export const gitGetCurrentBranch = async () => {
  const { stdout } = await execa("git", ["branch", "--show-current"]);
  return stdout.trim();
};

export const gitGetStatus = async () => {
  const { stdout } = await execa("git", ["status", "--porcelain"]);
  return stdout.trim();
};

export const gitStash = async () => {
  return await execa("git", ["stash"]);
};

export const gitStashPop = async () => {
  return await execa("git", ["stash", "pop"]);
};

export const gitPull = async (remote: string, branch: string) => {
  return await execa("git", ["pull", remote, branch]);
};

export const gitRebase = async (baseBranch: string) => {
  return await execa("git", ["rebase", baseBranch]);
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

export const gitDeleteBranch = async (branch: string, force = false) => {
  return await execa("git", ["branch", force ? "-D" : "-d", branch]);
};

export const gitAdd = async (pathspec: string = ".") => {
  return await execa("git", ["add", pathspec]);
};

export const gitCommit = async (message: string) => {
  return await execa("git", ["commit", "-m", message]);
};

export const gitPush = async (
  remote: string,
  branch: string,
  setUpstream = false,
) => {
  const args = ["push"];
  if (setUpstream) args.push("-u");
  args.push(remote, branch);
  return await execa("git", args);
};
