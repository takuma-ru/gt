# git-turbo (`gt`)

A supercharged CLI for Git, designed to streamline your workflow and boost productivity. With `gt`, you can execute common Git commands faster and more efficiently, making version control a breeze. Whether you're a seasoned developer or just getting started with Git, `gt` offers a user-friendly interface and powerful features to enhance your coding experience. Say goodbye to complex Git commands and hello to `gt` – your new best friend in version control!

## Quick Start

```bash
npm install -g git-turbo
```

```bash
# create new feature branch from base branch
gt nb main feature-branch -f
# -> creates feature/feature-branch from main
```

```bash
gt -h
# -> displays help information
```

## Commands

### `gt nb <base-branch> <new-branch> [options]`

Create a new branch from a base branch with a prefix.

**Options:**

- `-b, --bug` : Bug fix branch (prefix: `bug/`)
- `-f, --feature` : Feature branch (prefix: `feature/`)
- `-r, --refactor` : Refactor branch (prefix: `refactor/`)
- `-c, --chore` : Chore branch (prefix: `chore/`)

**Example:**

```bash
gt nb main my-feature -f
# -> creates feature/my-feature from main
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
