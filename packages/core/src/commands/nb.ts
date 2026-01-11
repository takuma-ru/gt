import { Command } from "commander";
import { consola } from "consola";
import { colors } from "consola/utils";
import { loadGtConfig } from "../config/load";
import { confirm } from "../utils/confirm";
import { createDryRun } from "../utils/dryRun";
import { ExitCode } from "../utils/exitCode";
import {
  gitCreateBranch,
  gitDeleteBranch,
  gitFetch,
  gitGetCurrentBranch,
  gitHasBranch,
  gitHasRemote,
} from "../utils/git";

const normalizePrefix = (prefix: string, prefixes: Record<string, string>) => {
  const trimmed = prefix.trim();
  const mapped = prefixes[trimmed] ?? trimmed;
  if (!mapped) return "";
  if (mapped.endsWith("/")) return mapped;
  return `${mapped}/`;
};

export const nbCommand = (program: Command) => {
  program
    .command("nb")
    .description("Create a new branch from a base branch")
    .argument("<base-branch>", "Base branch to create from")
    .argument("<new-branch>", "Name of the new branch")
    .option(
      "-p, --prefix <prefix>",
      "Prefix to prepend to new branch name (e.g. feature/). Alias: f/b/r/c/h/s",
    )
    .option(
      "--remote <remote>",
      "Remote name to fetch from (default: origin if exists)",
    )
    .option("-t, --track", "Set upstream when creating from remote", false)
    .option("-F, --force", "Delete existing branch if it exists", false)
    .option("-y, --yes", "Skip confirmation", false)
    .option("--dry-run", "Print planned commands and exit", false)
    .action(async (baseBranch: string, newBranch: string, options: any) => {
      const { config } = await loadGtConfig();
      const prefixes = config.nb.prefixes;

      const dryRun = createDryRun(Boolean(options.dryRun));

      const prefix =
        typeof options.prefix === "string"
          ? normalizePrefix(options.prefix, prefixes)
          : "";
      const fullBranchName = `${prefix}${newBranch}`;

      try {
        // Resolve remote/base from inputs.
        let remoteName: string | undefined =
          typeof options.remote === "string" ? options.remote : undefined;
        let baseBranchName = baseBranch;
        let hasRemote = false;

        if (remoteName) {
          hasRemote = await gitHasRemote(remoteName);
        } else if (baseBranch.includes("/")) {
          const [maybeRemote, ...rest] = baseBranch.split("/");
          if (maybeRemote && rest.length > 0) {
            const maybeRemoteExists = await gitHasRemote(maybeRemote);
            if (maybeRemoteExists) {
              remoteName = maybeRemote;
              baseBranchName = rest.join("/");
              hasRemote = true;
            }
          }
        }

        // Default remote is origin (if it exists), so users don't have to pass --remote.
        if (!remoteName) {
          const originExists = await gitHasRemote("origin");
          if (originExists) {
            remoteName = "origin";
            hasRemote = true;
          }
        }

        const currentBranch = await gitGetCurrentBranch();
        let startPoint: string | undefined = baseBranchName;

        // Force handling (local branch exists)
        const existing = await gitHasBranch(fullBranchName);
        if (existing) {
          if (!options.force) {
            throw new Error(
              `Branch '${fullBranchName}' already exists. Use --force to recreate.`,
            );
          }

          if (currentBranch === fullBranchName) {
            consola.info(
              `Already on '${fullBranchName}'. Nothing to do (use another name to create a new branch).`,
            );
            process.exitCode = ExitCode.Noop;
            return;
          }
        }

        if (remoteName && hasRemote) {
          consola.info(`Fetching ${baseBranchName} from ${remoteName}...`);
          try {
            await gitFetch(remoteName, baseBranchName, [], dryRun);
            startPoint = `${remoteName}/${baseBranchName}`;
          } catch {
            consola.warn(
              `Failed to fetch ${baseBranchName} from ${remoteName}. Checking local...`,
            );
            const hasLocal = await gitHasBranch(baseBranchName);
            if (!hasLocal) {
              if (currentBranch === baseBranchName) {
                consola.info(
                  `Branch '${baseBranchName}' is the current branch but has no commits yet. Creating from current state.`,
                );
                startPoint = undefined;
              } else {
                throw new Error(
                  `Branch '${baseBranchName}' not found locally or on ${remoteName}.`,
                );
              }
            }
          }

          if (options.track && startPoint?.startsWith(`${remoteName}/`)) {
            // ok
          } else if (options.track) {
            consola.warn(
              "--track requested but base is not a remote ref; ignoring.",
            );
          }
        } else {
          if (remoteName && !hasRemote) {
            consola.warn(
              `Remote '${remoteName}' not found. Falling back to local '${baseBranchName}'.`,
            );
          } else {
            consola.info(
              `No remote specified. Checking local ${baseBranchName}...`,
            );
          }

          const hasLocal = await gitHasBranch(baseBranchName);
          if (!hasLocal) {
            if (currentBranch === baseBranchName) {
              consola.info(
                `Branch '${baseBranchName}' is the current branch but has no commits yet. Creating from current state.`,
              );
              startPoint = undefined;
            } else {
              throw new Error(`Local branch '${baseBranchName}' not found.`);
            }
          }

          if (options.track) {
            consola.warn("--track requested but remote is not used; ignoring.");
          }
        }

        const willDelete =
          existing && options.force && currentBranch !== fullBranchName;
        const willFetch = Boolean(remoteName && hasRemote);
        const willTrack = Boolean(
          options.track &&
          startPoint &&
          remoteName &&
          startPoint.startsWith(`${remoteName}/`),
        );

        const createOptions: string[] = [];
        if (willTrack) createOptions.push("--track");

        const fetchReason = remoteName
          ? `remote '${remoteName}' not found`
          : "no remote";

        confirm("Action confirm", [
          {
            title: { icon: "branch", color: "cyan", text: "branch" },
            value: { text: colors.bold(fullBranchName) },
          },
          {
            title: { icon: "rightArrow", color: "cyan", text: "from" },
            value: {
              text: startPoint ? String(startPoint) : "current state",
            },
          },
          {
            title: {
              icon: "reload",
              color: "yellow",
              text: "fetch",
            },
            value: {
              color: "dim",
              text: willFetch
                ? `${remoteName}/${baseBranchName}`
                : `skip (${fetchReason})`,
            },
            disabled: !willFetch,
          },
          {
            title: {
              icon: "minus",
              color: willDelete ? "red" : "dim",
              text: "delete",
            },
            value: {
              text: willDelete
                ? `${colors.dim(fullBranchName)} ${colors.red("(--force)")}`
                : "no",
            },
            disabled: !willDelete,
          },
          {
            title: {
              icon: "up",
              color: "green",
              text: "upstream",
            },
            value: {
              text: willTrack
                ? `${colors.green("set")} ${colors.dim("(--track)")}`
                : "no",
            },
            disabled: !willTrack,
          },
        ]);

        if (dryRun) {
          if (willDelete) {
            await gitDeleteBranch(fullBranchName, true, dryRun);
          }
          await gitCreateBranch(
            fullBranchName,
            startPoint,
            createOptions,
            dryRun,
          );
          dryRun.printAndExit();
          return;
        }

        if (!options.yes) {
          const ok = await consola.prompt("Proceed?", {
            type: "confirm",
            initialValue: true,
          });
          if (!ok) {
            consola.error("Cancelled.");
            process.exitCode = ExitCode.Noop;
            return;
          }
        }

        if (willDelete) {
          consola.info(`Deleting existing branch ${fullBranchName}...`);
          await gitDeleteBranch(fullBranchName, true);
        }

        await gitCreateBranch(fullBranchName, startPoint, createOptions);
        consola.success(
          `Successfully created and switched to branch: ${fullBranchName}`,
        );
      } catch (error) {
        consola.error(
          `Failed to create branch: ${error instanceof Error ? error.message : String(error)}`,
        );
        process.exit(ExitCode.Error);
      }
    });
};
