---
description: FinAssist project context and build rules — use when working on this project
mode: subagent
tools:
  read: true
  write: true
  edit: true
  bash: true
  glob: true
  grep: true
  task: true
---

# FinAssist Project Context

This agent has full project context from AGENTS.md and PROJECT.md. Use it for any work on the FinAssist project.

## Project Files Reference
- **AGENTS.md** — Project context, stack, data model, scores, build order, commands
- **PROJECT.md** — Detailed project specification, feature list, architecture, scope boundaries
- **boundary-reviewer.md** — Boundary reviewer agent for conversational agent boundary checks

## Key Rules (from AGENTS.md)
- **Stack**: FastAPI (Python) + React+Vite PWA + SQLite + LLM with function-calling
- **Auth**: None for MVP (single local user profile)
- **Core Data Model**: users, income_sources, goals, transactions
- **Scores**: Spending Score (Needs 50%/Wants 30%/Savings 20%) + Savings Score (10/20-30/50% bands)
- **Hard Boundaries**: Agent never recommends specific funds/stocks, gives personalized allocation %, definitive tax advice, moral judgments on spending, or implies live bank data access
- **Build Order**: DB schema → Manual CRUD → Scores → Dashboard → Onboarding chat → Chat logging → Coaching chat (last)

## Open Decisions (resolve before building)
- [ ] Transaction category: user picks or agent infers?
- [ ] Savings Score = Savings Score = Savings category score (same number, two views) or separate calc?
- [ ] Dev/test/lint commands for AGENTS.md
- [ ] Naming/commit conventions for AGENTS.md

Use the `boundary-reviewer` agent when reviewing any conversational agent code/prompts.