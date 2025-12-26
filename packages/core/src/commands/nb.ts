import { Command } from "commander";
import { consola } from "consola";
import { gitCreateBranch, gitFetch, gitHasRemote } from "../utils/git";

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
        let startPoint = baseBranch;

        if (hasOrigin) {
          consola.info(`Fetching ${baseBranch} from origin...`);
          try {
            await gitFetch("origin", baseBranch);
            startPoint = `origin/${baseBranch}`;
          } catch {
            consola.warn(
              `Failed to fetch ${baseBranch} from origin. Using local ${baseBranch} instead.`,
            );
          }
        } else {
          consola.info(`No 'origin' remote found. Using local ${baseBranch}.`);
        }

        consola.info(`Creating branch ${fullBranchName} from ${startPoint}...`);
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
