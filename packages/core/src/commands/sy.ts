import { Command } from "commander";
import { consola } from "consola";
import { colors } from "consola/utils";
import { confirm } from "../utils/confirm";
import { createDryRun } from "../utils/dryRun";
import { ExitCode } from "../utils/exitCode";
import {
  gitGetCurrentBranch,
  gitGetStatus,
  gitHasRemote,
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
    .option("--dry-run", "Print planned commands and exit", false)
    .action(async (options) => {
      const baseBranch = options.base;
      const dryRun = createDryRun(Boolean(options.dryRun));
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
        const willStash = Boolean(status);
        const hasOrigin = await gitHasRemote("origin");

        if (dryRun) {
          confirm("Action confirm", [
            {
              title: { icon: "branch", color: "cyan", text: "branch" },
              value: { text: colors.bold(currentBranch) },
            },
            {
              title: { icon: "rightArrow", color: "cyan", text: "onto" },
              value: { text: colors.bold(baseBranch) },
            },
            {
              title: {
                icon: "plus",
                color: willStash ? "yellow" : "dim",
                text: "stash",
              },
              value: { text: willStash ? "yes" : "no" },
              disabled: !willStash,
            },
            {
              title: {
                icon: "reload",
                color: hasOrigin ? "yellow" : "dim",
                text: "pull",
              },
              value: {
                color: "dim",
                text: hasOrigin ? `origin/${baseBranch}` : "skip (no origin)",
              },
              disabled: !hasOrigin,
            },
            {
              title: { icon: "reload", color: "yellow", text: "rebase" },
              value: { text: baseBranch },
            },
            {
              title: {
                icon: "minus",
                color: willStash ? "yellow" : "dim",
                text: "stash pop",
              },
              value: { text: willStash ? "yes" : "no" },
              disabled: !willStash,
            },
          ]);

          if (willStash) await gitStash(dryRun);
          await gitSwitch(baseBranch, [], dryRun);
          if (hasOrigin) await gitPull("origin", baseBranch, dryRun);
          await gitSwitch(currentBranch, [], dryRun);
          await gitRebase(baseBranch, dryRun);
          if (willStash) await gitStashPop(dryRun);

          dryRun.printAndExit();
          return;
        }

        if (willStash) {
          consola.info("Stashing local changes...");
          await gitStash();
          stashed = true;
        }

        consola.info(`Switching to ${baseBranch}...`);
        await gitSwitch(baseBranch);
        if (hasOrigin) {
          consola.info(`Pulling latest changes from origin/${baseBranch}...`);
          try {
            await gitPull("origin", baseBranch);
          } catch {
            consola.warn(`Failed to pull from origin/${baseBranch}.`);
          }
        } else {
          consola.info(`No 'origin' remote found. Skipping pull.`);
        }

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
        process.exit(ExitCode.Error);
      }
    });
};
