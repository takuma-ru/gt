# git-turbo (`gt`)

A supercharged CLI for Git, designed to streamline your workflow and boost productivity. With `gt`, you can execute common Git commands faster and more efficiently, making version control a breeze. Whether you're a seasoned developer or just getting started with Git, `gt` offers a user-friendly interface and powerful features to enhance your coding experience. Say goodbye to complex Git commands and hello to `gt` – your new best friend in version control!

## Quick Start

```bash
npm install -g git-turbo
```

```bash
# create new feature branch from base branch
gt nb main feature-branch -p f
# -> creates feature/feature-branch from main (and fetches from origin if available)
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

### `gt cl [options]`

Cleanup merged local branches.

**Options:**

- `-b, --base <base-branch>` : Base branch to check against (default: `main`)
- `-y, --yes` : Skip confirmation

### `gt pr [message]`

Add, commit, push and create a pull request using GitHub CLI (`gh`).

## Tips

### Set up Aliases for even faster access

If you find yourself using certain commands frequently, you can set up aliases in your shell configuration (e.g., `.zshrc` or `.bashrc`):

```bash
# Example: Use 'nb' instead of 'gt nb'
alias nb='gt nb'

# Example: Use 'sy' instead of 'gt sy'
alias sy='gt sy'
```
