---
name: course-follow-official
description: Use when implementing course-driven code changes (e.g. Full Stack Open, Vue Mastery, any tutorial series) — fetches the authoritative course page and rewrites target files as a literal 1:1 transcription of the official code, only adding part/section markers and Chinese learning comments. Prevents "improvement drift" where Claude substitutes its own patterns (component extraction, lazy initializers, alias variables, key-name casing) for what the course teaches.
metadata:
  applies_to: fullstackopen, vue, react, course-tutorials
  scope: repo-local
---

# course-follow-official

## What this skill enforces

When the user says "follow the official course / tutorial strictly" (e.g. Full Stack Open, Vue.js, React 官方教程), you must rewrite the code as a **literal 1:1 transcription** of the course's final-state code. Do **not** substitute patterns you think are cleaner or more idiomatic.

## Why this rule exists

In one session, the user asked for a 1:1 transcription of Full Stack Open part5 a ("Login in frontend"). I rewrote it four times, each time improving on what the user perceived as the course:

| My "improvement" | What the course actually said |
|---|---|
| Extracted `<LoginForm />` as a separate component | The course keeps `loginForm()` as an inline App helper |
| Replaced `useEffect` with `useState(() => localStorage...)` IIFE | Course explicitly uses `useEffect` to read localStorage |
| Used `loggedNoteAppUser` (my casing) | Course uses `loggedNoteappUser` (lowercase `a`) |
| Imported loginService inside the LoginForm component | Course imports it directly in App.jsx |
| Aliased `const setNoteToken = noteService.setToken` to dodge ESLint | Course uses `noteService.setToken(...)` directly |

Each fix was a "better pattern" in isolation — none of them matched the course. The user had to ask three times before the code matched the official tutorial. This skill prevents that.

## When to invoke

Invoke this skill **before** writing any course-tutorial code if the user says any of:

- "严格按官方文档/官方链接改代码"
- "按官网 1:1 复刻"
- "严格参考官方网页"
- "按照教程改写" (when paired with a URL)
- Or names a course page (e.g. "part5 a / Login in frontend")

## The 5-step procedure

### Step 1 — Identify the canonical source

Get the exact course URL the user is pointing at. Confirm it parses (Chinese / encoded URLs sometimes 404 — try the English `/en/` variant and look up the slug if needed).

### Step 2 — Fetch the full final-state code

Use `WebFetch` with a prompt that asks for the **complete final code block** (full imports, state, effects, helpers, JSX — no abbreviation). The first fetch often summarizes instead of giving verbatim code; if so, ask again with explicit "1:1, line by line, no abbreviation".

### Step 3 — Diff against current repo

Before writing, compare the fetched code against the current file(s). Surface every difference to the user in a table:

| 维度 | 课程原文 | 当前文件 | 是否一致 |

This catches "course says X, your repo has Y" before you write. Do not skip this even if you think the file matches.

### Step 4 — Write 1:1, plus only two kinds of additions

When writing the file, **only add** these two things — nothing else:

1. **Section markers** — e.g. `// part5 a — setToken` placed immediately above the code that implements that section. These let the learner map code → tutorial step.
2. **Chinese learning comments** — explanations of *what the course line does* in Chinese, because the user is learning and the course itself is in English. **For new concepts (hooks, APIs, syntax patterns), comments must be deep enough that a learner who reads only the code (not the README) can understand the concept.** See `Step 4.5` for the required depth.

**Forbidden additions** (these are "improvement drift"):

- ❌ Extracting inline helpers into new components when the course didn't
- ❌ Replacing `useEffect` with `useState` lazy initializers
- ❌ Renaming localStorage keys, variables, or functions to "better" names
- ❌ Adding aliases to silence linter warnings (fix the warning properly or disable per-line with a comment that says "course did X")
- ❌ Changing JSX element order, attribute order, or wrapper `<div>`s
- ❌ Reordering state declarations or hooks
- ❌ Adding any "safety" code (extra try/catch, null checks) not in the course

### Step 4.5 — Comment depth for new concepts (关键概念注释纪律)

When the course introduces a **new concept** (a hook, an API, a syntax pattern the learner hasn't seen), the comment beside it must include ALL of the following:

1. **What the concept is** — define it in plain Chinese terms
2. **Why this code uses it** — "不用会怎样 / 用会怎样" 对比
3. **What the dependency array / arguments mean** — semantics, not just naming
4. **How to verify** — console.log pattern or browser observation the learner can do
5. **Anchor to README** — point to the verbatim paragraph in the README so the learner can cross-reference

Format hint: use a `⭐ 核心概念:` prefix on the most important concept so the learner can spot it at a glance.

**Why** (use case): in part7 a.2 useMemo, the user reported they couldn't understand the new concept from the code alone — comments that merely said "这里是 useMemo" were useless. The README had the verbatim text but the user (and other learners) read code first, README second.

**Anti-patterns** (do NOT do these in comments):

- ❌ Just naming the concept ("// useMemo 缓存") without explaining it
- ❌ Copying the English official docs verbatim — translate to Chinese in your own words
- ❌ Comments that only say WHAT the code does without explaining WHY
- ❌ Long English Stack Overflow quotes — Chinese learning comments must be in Chinese

Example (good vs bad):

```javascript
// ❌ BAD: 只说"使用 useMemo"
const filtered = useMemo(() => ITEMS.filter(...), [filter])

// ✅ GOOD: 解释"为什么" + "怎么验证" + 关联 README
// ⭐ 核心概念: useMemo 缓存计算结果
// 不用 useMemo: 每次 re-render 都重跑 ITEMS.filter(10000 × 100000 次循环)
// 用 useMemo:    只在 [filter] 变化时重跑,否则返回缓存
// 验证: 打开 console,切 dark mode 时**看不到** 'filtering...' 日志
// 关联: README.md 段 4-6
const filtered = useMemo(() => {
  console.log('filtering...')
  return ITEMS.filter(item => {
    expensiveCalculation()
    return item.includes(filter)
  })
}, [filter])
```

### Step 5 — Tooling friction: handle it explicitly, don't paper over it

If the course code triggers a modern linter / type-checker / framework warning (e.g. React 19 `react-hooks/set-state-in-effect` warning on the course's `useEffect → setUser` pattern), you have **three** options, in this preference order:

1. **Best:** Leave the warning, add a short Chinese comment explaining "课程原文如此" (the course does this). The warning is a tool/course version mismatch, not a bug.
2. **Acceptable:** Add a **single line-level** `// eslint-disable-next-line <rule>` with a comment explaining why. Never disable a rule project-wide to accommodate one course pattern.
3. **Worst:** Refactor the course code to avoid the warning. **Do not do this.** It breaks the 1:1 promise.

For this repo's ESLint 9 + React 19 setup, option 2 is usually needed for the part5 a `useEffect → setUser` pattern. Use it sparingly and only where the course pattern is unambiguous.

## Verification

After writing, run the project's lint + build. The course code should compile and lint **clean**. If it doesn't, the issue is either:

- You drifted from the course (re-read Step 4) — most common
- A tooling version mismatch (use Step 5 option 2) — second most common
- The course code itself is wrong (rare; ask the user)

## Anti-patterns checklist (run before reporting done)

Before saying "1:1 done", self-check:

- [ ] Every localStorage key matches the course spelling and casing
- [ ] Every state variable name matches
- [ ] Every function/handler name matches
- [ ] JSX element order matches
- [ ] No new components extracted that the course didn't extract
- [ ] No helpers replaced with idiomatic alternatives
- [ ] No aliases / wrapper variables added to dodge lints
- [ ] Section markers and Chinese comments are the **only** additions
- [ ] Every new concept (hook / API / syntax) has a `⭐ 核心概念:` Chinese comment that explains WHY, not just WHAT
- [ ] For hook usage, the comment includes a "不用 X / 用 X" comparison so the learner sees the effect
- [ ] Comments include a verification method (console.log / browser observation) the learner can run to confirm the concept works

If any item fails, revert and re-apply Step 4's discipline.

## Related memory

- See `[[course-follow-official-incident]]` for the original failure mode this skill was written to prevent.