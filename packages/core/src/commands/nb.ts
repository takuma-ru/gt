import { Command } from "commander";
import { consola } from "consola";
import {
  gitCreateBranch,
  gitFetch,
  gitGetCurrentBranch,
  gitHasBranch,
  gitHasRemote,
} from "../utils/git";

export const nbCommand = (program: Command) => {
  program
    .command("nb")
    .description("Create a new branch from a base branch with a prefix")
    .argument("<base-branch>", "Base branch to create from")
    .argument("<new-branch>", "Name of the new branch")
    .option("-b, --bug", "Bug fix branch (prefix: bug/)")
    .option("-f, --feature", "Feature branch (prefix: feature/)")
    .option("-r, --refactor", "Refactor branch (prefix: refactor/)")
    .option("-c, --chore", "Chore branch (prefix: chore/)")
    .action(async (baseBranch, newBranch, options) => {
      let prefix = "feature/";
      if (options.bug) prefix = "bug/";
      if (options.feature) prefix = "feature/";
      if (options.refactor) prefix = "refactor/";
      if (options.chore) prefix = "chore/";

      const fullBranchName = `${prefix}${newBranch}`;

      try {
        const hasOrigin = await gitHasRemote("origin");
        const currentBranch = await gitGetCurrentBranch();
        let startPoint: string | undefined = baseBranch;

        if (hasOrigin) {
          consola.info(`Fetching ${baseBranch} from origin...`);
          try {
            await gitFetch("origin", baseBranch);
            startPoint = `origin/${baseBranch}`;
          } catch {
            consola.warn(
              `Failed to fetch ${baseBranch} from origin. Checking local...`,
            );
            const hasLocal = await gitHasBranch(baseBranch);
            if (!hasLocal) {
              if (currentBranch === baseBranch) {
                consola.info(
                  `Branch '${baseBranch}' is the current branch but has no commits yet. Creating from current state.`,
                );
                startPoint = undefined;
              } else {
                throw new Error(
                  `Branch '${baseBranch}' not found locally or on origin.`,
                );
              }
            }
          }
        } else {
          consola.info(
            `No 'origin' remote found. Checking local ${baseBranch}...`,
          );
          const hasLocal = await gitHasBranch(baseBranch);
          if (!hasLocal) {
            if (currentBranch === baseBranch) {
              consola.info(
                `Branch '${baseBranch}' is the current branch but has no commits yet. Creating from current state.`,
              );
              startPoint = undefined;
            } else {
              throw new Error(`Local branch '${baseBranch}' not found.`);
            }
          }
        }

        if (startPoint) {
          consola.info(
            `Creating branch ${fullBranchName} from ${startPoint}...`,
          );
        } else {
          consola.info(`Creating branch ${fullBranchName}...`);
        }

        await gitCreateBranch(fullBranchName, startPoint);
        consola.success(
          `Successfully created and switched to branch: ${fullBranchName}`,
        );
      } catch (error) {
        consola.error(
          `Failed to create branch: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });
};
