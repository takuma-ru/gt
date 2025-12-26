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

### `nb <base-branch> <new-branch> [options]`

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
