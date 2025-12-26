import { Command } from "commander";
import { consola } from "consola";
import { execa } from "execa";
import { gitAdd, gitCommit, gitGetCurrentBranch, gitPush } from "../utils/git";

export const prCommand = (program: Command) => {
  program
    .command("pr")
    .description("Add, commit, push and create a pull request")
    .argument("[message]", "Commit message")
    .action(async (message) => {
      try {
        const currentBranch = await gitGetCurrentBranch();

        consola.info("Adding all changes...");
        await gitAdd(".");

        const commitMessage = message || `Update from ${currentBranch}`;
        consola.info(`Committing with message: "${commitMessage}"...`);
        await gitCommit(commitMessage);

        consola.info(`Pushing to origin ${currentBranch}...`);
        await gitPush("origin", currentBranch, true);

        consola.info("Creating pull request using GitHub CLI...");
        await execa("gh", ["pr", "create", "--fill"], { stdio: "inherit" });

        consola.success("Pull request created successfully!");
      } catch (error) {
        consola.error(
          `Failed to create PR: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });
};
