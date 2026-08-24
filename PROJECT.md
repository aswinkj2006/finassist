# FinAssist — Project Specification

**Team:** The Expendables
**Members:** Aswin K J (713524AM009), Chakratharie V (713524AM015), Dinesh A (713524AM024), Gokul Saravana (713524AM031)
**Guide:** Ms. A. Catherine Esther Karunya
**Department:** Artificial Intelligence & Machine Learning, SNS College of Technology, Coimbatore
**Type:** Semester mini-project

---

## 1. Problem Statement

First-time salaried employees and final-year students in India manage their own
money for the first time with no structured way to track spending or reach
savings goals. Early decisions — like understanding tax regimes or basic
investment concepts — get made through guesswork or advice from equally unsure
friends. Unrecorded spending and vague goals compound into poor financial
habits early in a career, precisely when good habits matter most and are
cheapest to build.

## 2. Who Faces This

- Final-year students about to enter their first job
- Employees in their first 1-2 years of salaried income
- Anyone managing independent income for the first time, with no financial
  literacy training or access to a paid advisor

## 3. Existing Solutions & Why They Fall Short

| Category | Examples | Limitation |
|---|---|---|
| Expense Trackers | Walnut, Money Manager | Log transactions, no guidance or goal linkage |
| Bank Apps | Balance/transaction views | Show what happened, not what to do next |
| Financial Advisors | Human, personalized advice | Accurate but too expensive for entry-level income |
| Search / Friends | Google, YouTube, peers | Free but unstructured, biased, disconnected from real numbers |

**Gap:** No existing tool connects logging, goal-tracking, and contextual
guidance grounded in a user's own real data — each existing option solves only
one piece.

## 4. Proposed Solution

FinAssist is a mobile-first PWA that connects logging, goal-tracking, and soft
contextual guidance in one tool — grounded in the user's real financial data
instead of generic advice. It borrows its conversational-onboarding and
dual-mode-logging pattern from Google Health Coach's approach to fitness
(onboarding conversation → ongoing goal tracking → log via chat or manually →
dashboard tying daily numbers back to the goal), applied to personal finance
instead of fitness.

**Core loop:** user sets up via conversation → logs income/expenses (manually
or via chat) → dashboard shows two computed scores and goal progress → soft
guidance explains concepts relevant to the user's own numbers, never
prescribes specific actions.

## 5. Design Thinking Summary

- **Empathize:** First-time earners feel less in control despite independent
  income — saving stays abstract without visible progress.
- **Define:** Users need a way to connect real financial data to concrete
  goals and understandable guidance.
- **Ideate:** Unify logging, goal-tracking, and contextual soft guidance in
  one tool, grounded in real numbers.
- **Prototype:** PWA with manual logging, goal tracker, conversational
  onboarding/logging agent, score dashboard.
- **Test:** Validate with classmates and first-job peers on goal clarity,
  logging usability, and trust in guidance tone.

## 6. Feature List, in Priority Order

1. **Manual logging + goal tracking + score dashboard** — the non-negotiable
   core. This alone must be a fully working, demoable app.
2. **Conversational onboarding** — chat-based setup collecting personal
   details, income sources, and goals into the DB.
3. **Conversational logging** — log a transaction by describing it in chat
   instead of filling a form.
4. **Pain-point / coaching chat** — soft, educational guidance on saving
   habits, tax regimes, and investment concepts. Build last; softest to
   define, easiest to let scope-creep into prescriptive advice.

If time runs short, cut from the bottom of this list, not the top.

## 7. Data Model

- `users`: id, name, monthly_net_income, onboarding_complete (bool)
- `income_sources`: id, user_id, label, amount, frequency
- `goals`: id, user_id, title, target_amount, target_date, saved_so_far
- `transactions`: id, user_id, amount, category (needs | wants |
  savings_investing), subcategory (free text), note, date, source (manual | chat)

**Open decision (resolve before building logging):** who assigns a
transaction's category — the user picks it manually, or the logging agent
infers it from the description? Pick one, write it here.

## 8. Score Formulas — exact, do not deviate without team sign-off

**Net Income** = Gross salary − mandatory deductions (TDS, EPF, professional tax)

**Spending Score** (three category scores, each a %):
```
category_score = (amount spent in category / net_income) * 100
```
- Needs target: 50% (rent/EMI, groceries, utilities, minimum debt, basic transport)
- Wants target: 30% (dining out, entertainment, hobbies, shopping, vacations)
- Savings & Investing target: 20% (emergency fund, retirement, investments, debt principal)

Evaluation: category over its target = flag it (Needs > 50% = "lifestyle
inflated", Wants > 30% = "lifestyle creep"). State the number and the target
in the UI — do not phrase this as a moral judgment.

**Savings Score:**
```
savings_score = (total_monthly_savings / net_income) * 100
```
Bands: <10% = needs attention · 20-30% = good (long-term stability
benchmark) · >=50% = excellent (early-retirement/FI pace)

**Open decision:** Savings Score and the "Savings & Investing" category score
from the spending breakdown compute the same underlying number
(savings ÷ net income × 100). Confirm whether these are shown as one number
presented two ways (against 50-30-20 target, and against the 10/20-30/50+
savings-rate bands), or kept as genuinely separate calculations.

Every transaction needs a category for these scores to compute — see the
open decision in Section 7.

## 9. Conversational Agent — Scope Boundaries (hard rules)

- Onboarding and goal-setting chat: extracts structured data into the DB.
  This is data collection, not advice.
- Coaching chat: may explain concepts (what an SIP is, what "lifestyle
  creep" means) using retrieval over a fixed, versioned knowledge source.
- The agent must **never**: recommend a specific fund/stock, state a
  personalized asset allocation %, give a definitive tax filing
  recommendation, or imply access to live bank data. Explain concepts and
  show the user's own numbers against general benchmarks — never tell them
  what to do with their money.
- No live bank/loan/credit API integration. All financial data is
  user-entered, manually or via chat, never pulled from a live account.

A dedicated review step (`.opencode/agent/boundary-reviewer.md`) checks new
chat-related code against these rules before merge.

## 10. Architecture / Stack

- **Backend:** FastAPI (Python)
- **Frontend:** React + Vite, packaged as an installable PWA (manifest.json +
  service worker) for a mobile-app-like experience
- **DB:** SQLite (development)
- **LLM:** any provider with function-calling/tool-use, used for onboarding
  extraction, transaction extraction, and coaching retrieval
- **Auth:** none required for MVP — single local user profile is acceptable
  unless the team explicitly adds multi-user login
- **Agentic build tool:** OpenCode, with project context in `AGENTS.md` and
  the boundary-reviewer subagent in `.opencode/agent/`

## 11. Build Order

1. DB schema + models + migrations
2. Manual logging CRUD + goal CRUD (backend), basic forms (frontend)
3. Score calculation endpoints, tested against the formulas above with fixed
   sample data
4. Dashboard UI (scores, category breakdown, goal progress)
5. Onboarding conversational agent (income, goals extraction)
6. Conversational logging agent (transaction extraction)
7. Pain-point/coaching chat (retrieval-based, last — highest risk of scope creep)

Do not parallelize out of this order within a single module. Frontend/backend
can be split across team members in parallel once the API contract for a
given phase is agreed and written down.

## 12. Explicitly Out of Scope

- Live bank/Account Aggregator integration
- Investment/tax advice beyond educational explanation (see Section 9)
- Multi-user auth/roles beyond a single profile per install
- Native mobile app — PWA only

## 13. References

- Y Combinator — Requests for Startups: AI for Personal Finance (Gustaf Alströmer)
- Income Tax Department, Government of India — official tax regime & slab publications
- Existing app research: Walnut, Money Manager
- Google Health Coach — conversational onboarding + dual-mode logging pattern
  (adapted from fitness to personal finance)

## 14. Open Decisions Still Pending (resolve before further build prompts)

- [x] Who assigns transaction category — user or agent? (Section 7) **ML Model decides, but user can change it.**
- [x] Is Savings Score a separate calc or the same number as the Savings &
      Investing category score, shown two ways? (Section 8) **Shown as separate.**
- [x] Dev/run/test/lint commands (add to `AGENTS.md`) **Resolved**
- [x] Naming/commit conventions (add to `AGENTS.md`) **Resolved**
