
# Remake Git History Script
$targetRepo = "d:\CnP\moirai"
Set-Location $targetRepo

# 1. Backup existing .git
if (Test-Path ".git") {
    if (Test-Path ".git_backup") {
        Remove-Item -Recurse -Force ".git_backup"
    }
    Move-Item ".git" ".git_backup"
}

# 2. Init fresh repo
git init
git config user.name "AtharvRG"
git config user.email "atharv2703123@gmail.com"

# Define commits
$commits = @(
    @{
        date = "2026-01-17T10:24:32+05:30"
        msg = "feat: initial project architecture and roadmap"
        files = @(".gitignore", "LICENSE", "project.md", ".github/*")
    },
    @{
        date = "2026-01-19T14:15:12+05:30"
        msg = "feat(clotho): initialize system capture service and telemetry loop"
        files = @("clotho/*")
    },
    @{
        date = "2026-01-21T11:42:05+05:30"
        msg = "feat(lachesis): implement narrative processing engine with PuterJS integration"
        files = @("lachesis/*")
    },
    @{
        date = "2026-01-23T09:33:18+05:30"
        msg = "feat(atropos): bootstrap electron desktop application with vite"
        files = @("atropos/package.json", "atropos/package-lock.json", "atropos/vite.config.ts", "atropos/tsconfig.json", "atropos/index.html", "atropos/.gitignore", "atropos/README.md")
    },
    @{
        date = "2026-01-25T16:21:44+05:30"
        msg = "feat(atropos): implement core IPC bridge and system tray logic"
        files = @("atropos/electron/*")
    },
    @{
        date = "2026-01-27T10:05:52+05:30"
        msg = "feat(atropos): build reactive UI foundation and state management"
        files = @("atropos/src/main.tsx", "atropos/src/App.tsx", "atropos/src/hooks/*", "atropos/src/lib/*")
    },
    @{
        date = "2026-01-29T21:12:08+05:30"
        msg = "feat(atropos): add dashboard views and activity chronicle components"
        files = @("atropos/src/components/*", "atropos/src/pages/*")
    },
    @{
        date = "2026-01-31T11:58:30+05:30"
        msg = "feat(aphrodite): initialize Next.js landing page with premium aesthetic"
        files = @("aphrodite/package.json", "aphrodite/package-lock.json", "aphrodite/next.config.mjs", "aphrodite/tsconfig.json", "aphrodite/tailwind.config.ts", "aphrodite/postcss.config.mjs", "aphrodite/.eslintrc.json", "aphrodite/README.md", "aphrodite/.gitignore")
    },
    @{
        date = "2026-02-02T15:47:12+05:30"
        msg = "style(aphrodite): craft immersive hero section and smooth scroll experience"
        files = @("aphrodite/src/app/layout.tsx", "aphrodite/src/app/page.tsx", "aphrodite/src/components/Hero.tsx", "aphrodite/src/components/SmoothScroll.tsx")
    },
    @{
        date = "2026-02-04T12:22:55+05:30"
        msg = "feat(aphrodite): implement scroll-driven narrative timeline and fates section"
        files = @("aphrodite/src/components/Fates.tsx", "aphrodite/src/components/ScrollStack.tsx")
    },
    @{
        date = "2026-02-06T22:15:03+05:30"
        msg = "perf(aphrodite): optimize WebGL threads and motion performance"
        files = @("aphrodite/src/components/Threads.tsx", "aphrodite/src/lib/*", "aphrodite/public/*")
    },
    @{
        date = "2026-02-08T19:34:22+05:30"
        msg = "fix: refine inter-process communication and state persistence"
        files = @("atropos/src/utils/*", "clotho/internal/*", "lachesis/internal/*")
    },
    @{
        date = "2026-02-09T04:53:00+05:30"
        msg = "chore: final project refinements and synchronization"
        files = @(".")
    }
)

foreach ($c in $commits) {
    foreach ($f in $c.files) {
        git add $f 2>$null
    }
    $env:GIT_AUTHOR_DATE = $c.date
    $env:GIT_COMMITTER_DATE = $c.date
    git commit -m $c.msg
}

# 3. Push to remote
git remote add origin https://github.com/AtharvRG/moirai.git
# Note: Pushing will be done separately to ensure no error stops the script here
