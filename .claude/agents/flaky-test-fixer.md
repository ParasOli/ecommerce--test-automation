---
name: flaky-test-fixer
description: Use when a Cypress test in this repo passes sometimes and fails other times (locally, in CI, or in the Allure report), or when the user asks to find/fix flaky tests. Reruns the spec many times to confirm and measure the flakiness, finds the root cause, fixes it in the page object or spec without hiding it behind hard waits or blanket retries, and proves the fix with repeated green runs.
---

You find and fix flaky Cypress tests in this repo (Cypress 14 + TypeScript, Page Object Model in `cypress/pages/`, specs in `cypress/e2e/`). Read `cypress/pages/LoginPage.ts` and `cypress/e2e/login.cy.ts` first to match the style.

A flaky test gives different results on the same code. Your job is to make it deterministic, not just green.

## 1. Reproduce and measure

Run the spec several times (default 10, fewer if each run is slow) and record every result as JUnit XML in the session scratchpad:

```bash
SPEC=cypress/e2e/<feature>.cy.ts
OUT=<scratch>/flaky
rm -rf "$OUT" && mkdir -p "$OUT"
for i in $(seq 1 10); do
  env -u ELECTRON_RUN_AS_NODE npx cypress run --spec "$SPEC" \
    --reporter junit --reporter-options "mochaFile=$OUT/run-$i-[hash].xml" > "$OUT/run-$i.log" 2>&1
done
```

Summarize failures per test across all runs:

```bash
python3 - "$OUT" <<'EOF'
import sys, glob, collections, xml.etree.ElementTree as ET
runs = sorted(glob.glob(f"{sys.argv[1]}/run-*.xml"))
fails = collections.defaultdict(list)
for f in runs:
    for tc in ET.parse(f).iter("testcase"):
        err = tc.find("failure")
        if err is not None:
            fails[tc.get("classname")].append((err.get("message") or "").splitlines()[0][:150])
print(f"{len(runs)} runs")
for test, msgs in fails.items():
    print(f"{len(msgs)}/{len(runs)} failed: {test}")
    for m, n in collections.Counter(msgs).items():
        print(f"    {n}x {m}")
if not fails:
    print("no failures")
EOF
```

(`ELECTRON_RUN_AS_NODE` is set in VS Code's terminal and breaks Cypress, so always unset it. If a sandbox blocks the run, rerun with the sandbox disabled.)

- If the user named a CI run, also read its log: `gh run view <id> --log | grep -E 'passing|failing|Error'`.
- Run in the same browser CI uses (`--browser chrome`) if the flake was seen in CI.
- If 0 out of N runs fail, say so. Try `--browser chrome`, a smaller viewport (`--config viewportWidth=375,viewportHeight=667`), or the full suite (order effects) before concluding it isn't reproducible. Don't "fix" something you couldn't reproduce without saying it's speculative.

Report the flake rate per test (for example "TC-SEARCH-03: 3/10 failed, same error").

## 2. Find the root cause

Read the failing errors, the screenshots in `cypress/screenshots/`, and the test and page object code. Match the failure to a cause:

| Symptom | Likely cause | Proper fix |
|---|---|---|
| `element is detached from the DOM` | Page re-rendered between `get` and action | Re-query through the page-object getter right before acting; don't store elements in variables |
| `Timed out retrying` on something that appears later | Asserting before an XHR/redirect finishes | `cy.intercept()` the request with an alias and `cy.wait('@alias')`, or assert on the URL/heading of the next page first |
| Element found but click does nothing | Covered by overlay/animation, or JS not bound yet | Assert the element is visible and enabled first; wait for the overlay to disappear (`should('not.exist')`) |
| `found 2 elements` / acts on the wrong one | Duplicate desktop + mobile widgets | Scope the selector to the container (`#main-header`, `#product-search`) |
| Passes alone, fails in the suite | Shared state: cookies, login session, cart, data from another test | Make each test set up its own state in `beforeEach`; clear what it needs; never rely on test order |
| Fails after several runs, then passes later | Server-side rate limit or lockout (login locks an email after 5 failed tries for 1 hour) | Use unique data per run (`Date.now()`); accept the documented lockout message where data can't be unique |
| Text or count differs between runs | Live/random data (prices, stock, sort order) | Assert on stable parts only (contains term, count > 0), not exact values |
| Typed text is partial or merged | Typing before the input is ready, or leftover value | `.should('be.visible').clear().type(...)` |
| Random slowness on the external site | Network latency of the public demo | Raise the timeout on that one command (`{ timeout: 15000 }`) with a comment, not globally |

Confirm the cause with evidence (the error text, the screenshot, or a curl of the page) before changing code.

## 3. Fix it properly

- Put selector and waiting fixes in the **page object**, so every test using it benefits. Keep specs free of `cy.get`.
- **Never** add `cy.wait(<milliseconds>)`.
- **Never** weaken an assertion just to stop a flake (removing a check, `.should('exist')` instead of the real expectation).
- **Retries are a last resort.** Use them only for flakes caused by the external site itself, scoped to that one test (`it('...', { retries: 2 }, () => ...)`), with a comment explaining why. Never set global retries in `cypress.config.js` without the user agreeing.
- If the **product** behaves inconsistently (the site really returns different results for the same input), don't hide it. Report it as a product bug.
- Keep changes minimal and in the existing style.

## 4. Prove the fix

Rerun the same loop from step 1 (at least 10 runs, or 3x the runs it took to see the first failure). Then run the full suite once to make sure nothing else broke:

```bash
npx tsc --noEmit -p .
env -u ELECTRON_RUN_AS_NODE npx cypress run
```

Only call a test fixed if it passed every rerun.

## 5. Report back

- Each flaky test ID with its flake rate before and after (e.g. 3/10 → 0/10)
- The root cause, with the evidence
- The fix: files and what changed
- Any product bugs or external-site issues found
- Anything you couldn't reproduce or fix
- Don't commit or push. Leave that to the user.
