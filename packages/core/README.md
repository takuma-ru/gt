# git-turbo (`gt`)

`gt` is a lightweight CLI that streamlines common Git workflows: create prefixed branches, sync with your base branch, clean up merged locals, and open PRs via GitHub CLI.

It focuses on the repetitive steps you do every day and turns them into short, consistent commands.

![gt-nb](https://github.com/user-attachments/assets/8fdce240-b438-4815-a342-4e0b573306bc)

## What you can do with `gt`

- `gt nb`: Create a new branch from a base branch with a consistent prefix
- `gt sy`: Sync your current branch with a base branch (stash -> rebase -> restore)
- `gt cl`: Clean up merged local branches
- `gt pr`: Add/commit/push and create a pull request via GitHub CLI (`gh`)

## Quick Start

```bash
npm install -g git-turbo
```

**Requirements**

- Git installed and available as `git`
- Node.js installed (for `npm install -g`)
- Optional: GitHub CLI `gh` (required for `gt pr`)

```bash
# create new feature branch from base branch
gt nb main feature-branch -p f
# -> creates feature/feature-branch from main (and fetches from origin if available)
```

### Config (optional)

You can configure prefix aliases by adding a `gt.config.ts` file to the repository root.

```ts
// gt.config.ts
import { defineConfig } from "git-turbo/config";

export default defineConfig({
  nb: {
    prefixes: {
      f: "feature/",
      b: "fix/",
      r: "refactor/",
      c: "chore/",
      h: "hotfix/",
      s: "spike/",
    },
  },
});
```

```bash
gt -h
# -> displays help information
```

## Commands

### `gt nb <base-branch> <new-branch> [options]`

Create a new branch from a base branch with a prefix.

**Options:**

- `-p, --prefix <prefix>` : Prefix to prepend (e.g. `feature/`). Aliases: `f`/`b`/`r`/`c`/`h`/`s`
- `--remote <remote>` : Remote name to fetch from (default: `origin` if it exists)
- `-t, --track` : Set upstream when creating from a remote ref
- `-F, --force` : Delete existing branch if it exists
- `-y, --yes` : Skip confirmation

**Example:**

```bash
gt nb main my-feature -p f
# -> creates feature/my-feature from main
```

```bash
# Explicit prefix
gt nb main my-feature -p feature/
```

```bash
# Use a remote base (also works without --remote if you pass origin/main)
gt nb origin/main my-feature -p f --track
```

### `gt sy [options]`

Sync current branch with main branch (stash, pull main, rebase, stash pop).

**Options:**

- `-b, --base <base-branch>` : Base branch to sync with (default: `main`)

**Example:**

```bash
gt sy
# -> sync with main
```

```bash
gt sy -b develop
# -> sync with develop
```

### `gt cl [options]`

Cleanup merged local branches.

**Options:**

- `-b, --base <base-branch>` : Base branch to check against (default: `main`)
- `-y, --yes` : Skip confirmation

**Example:**

```bash
gt cl
# -> delete local branches already merged into main
```

```bash
gt cl -b develop -y
# -> clean up using develop as base (without confirmation)
```

### `gt pr [message]`

Add, commit, push and create a pull request using GitHub CLI (`gh`).

**Example:**

```bash
gt pr
# -> commits with a default message and creates a PR via `gh pr create --fill`
```

```bash
gt pr "chore: update deps"
# -> commits with the provided message and creates a PR
```

## Tips

### Set up Aliases for even faster access

If you find yourself using certain commands frequently, you can set up aliases in your shell configuration (e.g., `.zshrc` or `.bashrc`):

```bash
# Example: Use 'nb' instead of 'gt nb'
alias nb='gt nb'

# Example: Use 'sy' instead of 'gt sy'
alias sy='gt sy'
```
