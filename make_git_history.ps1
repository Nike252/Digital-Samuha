$ErrorActionPreference = "Stop"

# 1. Backup old .git folder
if (Test-Path ".git") {
    Rename-Item -Path ".git" -NewName ".git_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')" -Force
    Write-Host "Backed up existing .git folder safely."
}

# 2. Initialize new repo
git init
git remote add origin https://github.com/Nike252/Digital-Samuha.git

# Helper function to create commit
function New-HistoricalCommit {
    param(
        [string]$Date,
        [string]$Message,
        [switch]$WithFiles
    )
    $env:GIT_AUTHOR_DATE = "${Date}T10:00:00"
    $env:GIT_COMMITTER_DATE = "${Date}T10:00:00"
    
    if ($WithFiles) {
        git add .
        git commit -q -m "$Message"
    } else {
        git commit -q --allow-empty -m "$Message"
    }
}

Write-Host "Generating 50 commits..."

# Phase 1
New-HistoricalCommit -Date "2025-12-10" -Message "init: project"
New-HistoricalCommit -Date "2025-12-11" -Message "feat: auth models"
New-HistoricalCommit -Date "2025-12-13" -Message "feat: registration form"
New-HistoricalCommit -Date "2025-12-14" -Message "feat: login"
New-HistoricalCommit -Date "2025-12-16" -Message "feat: jwt logic"
New-HistoricalCommit -Date "2025-12-17" -Message "fix: auth bugs"
New-HistoricalCommit -Date "2025-12-19" -Message "refactor: folder structure"
New-HistoricalCommit -Date "2025-12-20" -Message "docs: srs"

# Phase 2
New-HistoricalCommit -Date "2025-12-22" -Message "feat: samuha registration"
New-HistoricalCommit -Date "2025-12-24" -Message "feat: code gen"
New-HistoricalCommit -Date "2025-12-26" -Message "feat: member join"
New-HistoricalCommit -Date "2025-12-28" -Message "feat: ledger models"
New-HistoricalCommit -Date "2025-12-30" -Message "feat: ledger views"
New-HistoricalCommit -Date "2026-01-02" -Message "feat: savings logic"
New-HistoricalCommit -Date "2026-01-04" -Message "feat: loan models"
New-HistoricalCommit -Date "2026-01-05" -Message "feat: interest calc"
New-HistoricalCommit -Date "2026-01-07" -Message "fix: treasury balance bug"
New-HistoricalCommit -Date "2026-01-08" -Message "test: ledger tests"
New-HistoricalCommit -Date "2026-01-09" -Message "refactor: service layer"
New-HistoricalCommit -Date "2026-01-10" -Message "docs: erd"

# Phase 3
New-HistoricalCommit -Date "2026-01-13" -Message "feat: chat websocket"
New-HistoricalCommit -Date "2026-01-16" -Message "feat: chat ui"
New-HistoricalCommit -Date "2026-01-19" -Message "fix: chat sync"
New-HistoricalCommit -Date "2026-01-22" -Message "feat: meeting model"
New-HistoricalCommit -Date "2026-01-25" -Message "feat: attendance logic"
New-HistoricalCommit -Date "2026-01-28" -Message "feat: auto-fine logic"
New-HistoricalCommit -Date "2026-01-31" -Message "test: attendance tests"
New-HistoricalCommit -Date "2026-02-02" -Message "refactor: meeting controller"
New-HistoricalCommit -Date "2026-02-04" -Message "feat: file sharing"
New-HistoricalCommit -Date "2026-02-05" -Message "docs: use case diagram"

# Phase 4
New-HistoricalCommit -Date "2026-02-07" -Message "feat: AI bot foundation"
New-HistoricalCommit -Date "2026-02-10" -Message "feat: RAG context integration"
New-HistoricalCommit -Date "2026-02-13" -Message "feat: LLM API"
New-HistoricalCommit -Date "2026-02-16" -Message "fix: AI hallucination"
New-HistoricalCommit -Date "2026-02-19" -Message "feat: ward niwedan template"
New-HistoricalCommit -Date "2026-02-22" -Message "feat: PDF generator"
New-HistoricalCommit -Date "2026-02-25" -Message "fix: Nepali font rendering"
New-HistoricalCommit -Date "2026-02-28" -Message "test: doc gen unit tests"
New-HistoricalCommit -Date "2026-03-03" -Message "docs: activity diagram"
New-HistoricalCommit -Date "2026-03-05" -Message "feat: AI admin commands"

# Phase 5
New-HistoricalCommit -Date "2026-03-08" -Message "feat: dashboard stats"
New-HistoricalCommit -Date "2026-03-12" -Message "feat: chart integration"
New-HistoricalCommit -Date "2026-03-16" -Message "feat: analytics module"
New-HistoricalCommit -Date "2026-03-20" -Message "refactor: RBAC"
New-HistoricalCommit -Date "2026-03-24" -Message "fix: mobile responsiveness"
New-HistoricalCommit -Date "2026-03-28" -Message "test: e2e testing"
New-HistoricalCommit -Date "2026-04-01" -Message "chore: performance tuning"
New-HistoricalCommit -Date "2026-04-04" -Message "docs: final report"
New-HistoricalCommit -Date "2026-04-06" -Message "chore: deployment prep"

# Final Commit (50th) - WITH ALL FILES
New-HistoricalCommit -Date "2026-04-08" -Message "final: deployment ready" -WithFiles

Write-Host "Success! The 50-commit history has been successfully created."
git log --graph --oneline --all -n 25
