import { Command } from "commander";
import { consola } from "consola";
import { colors } from "consola/utils";
import { confirm } from "../utils/confirm";
import { createDryRun } from "../utils/dryRun";
import { ExitCode } from "../utils/exitCode";
import { gitDeleteBranch, gitFetch, gitGetMergedBranches } from "../utils/git";

export const clCommand = (program: Command) => {
  program
    .command("cl")
    .description("Cleanup merged local branches")
    .option("-b, --base <base-branch>", "Base branch to check against", "main")
    .option("-y, --yes", "Skip confirmation", false)
    .option("--dry-run", "Print planned commands and exit", false)
    .action(async (options) => {
      const baseBranch = options.base;
      const dryRun = createDryRun(Boolean(options.dryRun));

      try {
        consola.info("Pruning remote branches...");
        await gitFetch("origin", undefined, ["--prune"], dryRun);

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
          if (dryRun) {
            dryRun.printAndExit();
          }
          process.exitCode = ExitCode.Noop;
          return;
        }

        consola.info(
          `Found ${branchesToDelete.length} merged branches: ${branchesToDelete.join(", ")}`,
        );

        if (dryRun) {
          confirm("Action confirm", [
            {
              title: { icon: "branch", color: "cyan", text: "base" },
              value: { text: colors.bold(baseBranch) },
            },
            {
              title: { icon: "minus", color: "red", text: "delete" },
              value: { text: `${branchesToDelete.length} branches` },
            },
          ]);

          for (const branch of branchesToDelete) {
            await gitDeleteBranch(branch, false, dryRun);
          }

          dryRun.printAndExit();
          return;
        }

        if (!options.yes) {
          consola.warn("Run with -y or --yes to confirm deletion.");
          process.exitCode = ExitCode.Noop;
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
        process.exit(ExitCode.Error);
      }
    });
};
