import { Command } from "commander";
import { consola } from "consola";
import { gitDeleteBranch, gitFetch, gitGetMergedBranches } from "../utils/git";

export const clCommand = (program: Command) => {
  program
    .command("cl")
    .description("Cleanup merged local branches")
    .option("-b, --base <base-branch>", "Base branch to check against", "main")
    .option("-y, --yes", "Skip confirmation", false)
    .action(async (options) => {
      const baseBranch = options.base;

      try {
        consola.info("Pruning remote branches...");
        await gitFetch("origin", undefined, ["--prune"]);

        consola.info(`Finding branches merged into ${baseBranch}...`);
        const mergedOutput = await gitGetMergedBranches(baseBranch);

        const branchesToDelete = mergedOutput
          .split("\n")
          .map((b) => b.trim())
          .filter(
            (b) =>
              b &&
              !b.startsWith("*") &&
              b !== "main" &&
              b !== "master" &&
              b !== "develop" &&
              b !== baseBranch,
          );

        if (branchesToDelete.length === 0) {
          consola.success("No merged branches to cleanup.");
          return;
        }

        consola.info(
          `Found ${branchesToDelete.length} merged branches: ${branchesToDelete.join(", ")}`,
        );

        if (!options.yes) {
          consola.warn("Run with -y or --yes to confirm deletion.");
          return;
        }

        for (const branch of branchesToDelete) {
          consola.info(`Deleting branch ${branch}...`);
          await gitDeleteBranch(branch);
        }

        consola.success("Cleanup complete.");
      } catch (error) {
        consola.error(
          `Failed to cleanup: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(1);
      }
    });
};
