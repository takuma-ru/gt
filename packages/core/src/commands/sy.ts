import { Command } from "commander";
import { consola } from "consola";
import {
  gitGetCurrentBranch,
  gitGetStatus,
  gitPull,
  gitRebase,
  gitStash,
  gitStashPop,
  gitSwitch,
} from "../utils/git";

export const syCommand = (program: Command) => {
  program
    .command("sy")
    .description(
      "Sync current branch with main branch (stash, pull main, rebase, stash pop)",
    )
    .option("-b, --base <base-branch>", "Base branch to sync with", "main")
    .action(async (options) => {
      const baseBranch = options.base;
      let currentBranch = "";
      let stashed = false;

      try {
        // Get current branch
        currentBranch = await gitGetCurrentBranch();

        if (!currentBranch) {
          throw new Error("Not on any branch");
        }

        // Check for changes
        const status = await gitGetStatus();
        if (status) {
          consola.info("Stashing local changes...");
          await gitStash();
          stashed = true;
        }

        consola.info(
          `Switching to ${baseBranch} and pulling latest changes...`,
        );
        await gitSwitch(baseBranch);
        await gitPull("origin", baseBranch);

        consola.info(
          `Switching back to ${currentBranch} and rebasing on ${baseBranch}...`,
        );
        await gitSwitch(currentBranch);
        await gitRebase(baseBranch);

        if (stashed) {
          consola.info("Popping stashed changes...");
          await gitStashPop();
        }

        consola.success(
          `Successfully synced ${currentBranch} with ${baseBranch}`,
        );
      } catch (error) {
        consola.error(
          `Failed to sync: ${error instanceof Error ? error.message : String(error)}`,
        );
        // Try to return to original branch if something failed
        if (currentBranch) {
          try {
            await gitSwitch(currentBranch);
          } catch {
            // Ignore error if we can't even switch back
          }
        }
        process.exit(1);
      }
    });
};
