# gt-nb.gif.tape
# Demo: gt nb (create new branch) without touching the current repo.

Require git
Require node
Require ttyd
Require ffmpeg
Require pnpm

Output .tape/gt-nb.gif

Set Width 1200
Set Height 600
Set FontSize 28
Set TypingSpeed 0.03

Hide
Type "set -e"
Enter
Type "DEMO=/tmp/gt-vhs-nb-demo"
Enter
Type "rm -rf $DEMO && mkdir -p $DEMO"
Enter
Type "cd $DEMO"
Enter
Type "git init -b main"
Enter
Type "git config user.email demo@example.com"
Enter
Type "git config user.name VHS-Demo"
Enter
Type "echo demo > README.md"
Enter
Type "git add -A && git commit -m init"
Enter
Type "GT_DIST=/home/kcatt/dev/other/gt/packages/core/dist/index.mjs"
Enter
Type "export GT_DIST"
Enter
Type "cd /home/kcatt/dev/other/gt && pnpm --filter git-turbo build"
Enter
Type "cd $DEMO"
Enter
Type "mkdir -p $DEMO/bin"
Enter
Type "cat > $DEMO/bin/gt"
Enter
Type "#!/usr/bin/env sh"
Enter
Type "exec node $GT_DIST $@"
Enter
Ctrl+D
Type "chmod +x $DEMO/bin/gt"
Enter
Type "export PATH=$DEMO/bin:$PATH"
Enter
Type "clear"
Enter
Show

Type "gt nb main my-feature -p f"
Sleep 900ms
Enter

Wait+Screen /Proceed\?/
Enter

Sleep 800ms

Sleep 2.5s
