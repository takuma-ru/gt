import { Command } from "commander";
import { consola } from "consola";
import { colors } from "consola/utils";
import { execa } from "execa";
import { confirm } from "../utils/confirm";
import { createDryRun } from "../utils/dryRun";
import { ExitCode } from "../utils/exitCode";
import {
  gitAdd,
  gitCommit,
  gitGetCurrentBranch,
  gitGetStatus,
  gitPush,
} from "../utils/git";

export const prCommand = (program: Command) => {
  program
    .command("pr")
    .description("Add, commit, push and create a pull request")
    .argument("[message]", "Commit message")
    .option("--dry-run", "Print planned commands and exit", false)
    .action(async (message, options) => {
      const dryRun = createDryRun(Boolean(options.dryRun));
      try {
        const status = await gitGetStatus();
        if (!status) {
          consola.info("No local changes to commit.");
          process.exitCode = ExitCode.Noop;
          return;
        }

        const currentBranch = await gitGetCurrentBranch();

        const commitMessage = message || `Update from ${currentBranch}`;

        if (dryRun) {
          confirm("Action confirm", [
            {
              title: { icon: "branch", color: "cyan", text: "branch" },
              value: { text: colors.bold(currentBranch) },
            },
            {
              title: { icon: "plus", color: "yellow", text: "commit" },
              value: { text: commitMessage },
            },
            {
              title: { icon: "up", color: "green", text: "push" },
              value: { text: `origin/${currentBranch}` },
            },
            {
              title: { icon: "rightArrow", color: "cyan", text: "pr" },
              value: { text: "gh pr create --fill" },
            },
          ]);

          await gitAdd(".", dryRun);
          await gitCommit(commitMessage, dryRun);
          await gitPush("origin", currentBranch, true, dryRun);
          dryRun.record("gh", ["pr", "create", "--fill"]);

          dryRun.printAndExit();
          return;
        }

        consola.info("Adding all changes...");
        await gitAdd(".");

        consola.info(`Committing with message: "${commitMessage}"...`);
        await gitCommit(commitMessage);

        consola.info(`Pushing to origin ${currentBranch}...`);
        await gitPush("origin", currentBranch, true);

        consola.info("Creating pull request using GitHub CLI...");
        try {
          await execa("gh", ["pr", "create", "--fill"], { stdio: "inherit" });
        } catch (error: any) {
          if (error && (error.code === "ENOENT" || error.errno === "ENOENT")) {
            consola.error(
              "GitHub CLI 'gh' not found. Install it or run with --dry-run.",
            );
            process.exit(ExitCode.PrerequisiteMissing);
          }
          throw error;
        }

        consola.success("Pull request created successfully!");
      } catch (error) {
        consola.error(
          `Failed to create PR: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(ExitCode.Error);
      }
    });
};
