# Ralph Wiggum Plugin - Iterative Development Workflow

**Plugin Installed**: ✅ `~/.claude/plugins/ralph-wiggum/`
**Status**: Ready to use
**Purpose**: Automate iterative development with self-correction loops

---

## What is Ralph Wiggum?

Ralph Wiggum is a Claude Code plugin that creates an **iterative development loop** where Claude autonomously refines work across multiple iterations. Instead of manually running commands in a bash loop, Ralph intercepts session exit attempts and feeds the same prompt back to Claude, allowing it to:

1. See its previous work in files and git history
2. Learn from mistakes and improve
3. Continue until completion criteria are met
4. Self-correct without human intervention

**Key Insight**: "Ralph is a Bash loop" - but implemented as a Stop hook that persists within a single Claude session.

---

## How It Works

### 1. You Start a Ralph Loop
```bash
/ralph-loop "Implement user profile feature with tests" \
  --max-iterations 5 \
  --completion-promise "All tests passing and feature complete"
```

### 2. Claude Works on the Task
- Writes code
- Runs tests
- Commits changes
- Attempts to exit when done

### 3. Stop Hook Intercepts Exit
- **If completion promise met**: Loop ends, session exits
- **If not complete**: Same prompt fed back to Claude
- **If max iterations reached**: Loop stops with warning

### 4. Next Iteration Begins
- Claude sees its previous work in files
- Reviews git history to understand what was done
- Identifies issues (failing tests, TypeScript errors, etc.)
- Fixes problems and tries again

### 5. Repeat Until Complete
- Loop continues until:
  - Completion promise is fulfilled
  - Max iterations reached
  - User cancels with `/cancel-ralph`

---

## Integration with Our Agile Workflow

### Our Current Rules
✅ Work in 150-250 line chunks
✅ QA test after each sprint
✅ Document acceptance criteria
✅ Use TodoWrite to track progress
✅ No speculation - verify everything works

### How Ralph Enhances This

**Before Ralph**:
1. Claude implements feature (250 lines)
2. Claude creates QA agent manually
3. QA agent finds bugs
4. User asks Claude to fix bugs
5. Repeat steps 2-4 until working

**With Ralph**:
1. Start ralph-loop with completion promise "All tests passing, TypeScript clean, QA approved"
2. Ralph automatically runs iterations:
   - Iteration 1: Implement feature
   - Iteration 2: See TypeScript error, fix it
   - Iteration 3: See test failure, fix logic
   - Iteration 4: Run QA, find bug, fix it
   - Iteration 5: All checks pass → output completion promise → loop ends
3. Done! Feature is complete and verified

---

## Command Reference

### Start a Ralph Loop
```bash
/ralph-loop "<task description>" \
  --max-iterations <number> \
  --completion-promise "<specific statement>"
```

**Example**:
```bash
/ralph-loop "Add sign-out button to profile screen with confirmation dialog" \
  --max-iterations 3 \
  --completion-promise "Feature implemented, TypeScript clean, manually tested"
```

### Cancel Active Loop
```bash
/cancel-ralph
```

### Check Loop Status
```bash
cat .claude/ralph-loop.local.md
```

---

## Best Practices for Our Project

### 1. Define Clear Completion Criteria

**❌ Vague**:
```bash
--completion-promise "Feature is done"
```

**✅ Specific**:
```bash
--completion-promise "Feature complete: TypeScript 0 errors, all unit tests passing, QA agent approved, committed to git"
```

### 2. Set Reasonable Max Iterations

**Small Tasks** (< 100 lines):
```bash
--max-iterations 2
```

**Medium Tasks** (100-250 lines):
```bash
--max-iterations 3
```

**Large Tasks** (250-500 lines):
```bash
--max-iterations 5
```

**Complex Refactors**:
```bash
--max-iterations 10
```

### 3. Use TDD (Test-Driven Development)

Ralph works BEST when you have automated checks:

```bash
/ralph-loop "Implement getUserReviews query in Convex with tests" \
  --max-iterations 3 \
  --completion-promise "Tests written, implementation complete, npm test passes"
```

Ralph will:
1. Write failing tests
2. Implement feature
3. See tests fail
4. Fix implementation
5. See tests pass → output promise → done!

### 4. Combine with Our QA Agents

```bash
/ralph-loop "Refactor distance calculation to utils function" \
  --max-iterations 5 \
  --completion-promise "Refactor complete, QA agent found 0 issues, all references updated"
```

Ralph will automatically create and run QA agents until they pass!

---

## Example Workflows

### Workflow 1: Bug Fix with Tests

**Scenario**: Fix race condition in voting system

```bash
/ralph-loop "Fix race condition in voteOnReview mutation - add test that reproduces bug, then fix it" \
  --max-iterations 4 \
  --completion-promise "Test reproduces race condition, fix implemented, test passes, no regressions"
```

**What Happens**:
- Iteration 1: Claude writes test, sees it fail (good!)
- Iteration 2: Claude implements fix, test passes but TypeScript error
- Iteration 3: Claude fixes TypeScript, all tests pass
- Iteration 4: Claude runs full test suite, confirms no regressions → outputs promise → done

### Workflow 2: Feature Implementation

**Scenario**: Add photo upload UI

```bash
/ralph-loop "Implement photo upload button on bathroom detail screen - use Expo ImagePicker, upload to Convex Storage, display in gallery" \
  --max-iterations 5 \
  --completion-promise "Photo upload works end-to-end: picker opens, upload succeeds, photo displays, TypeScript clean"
```

**What Happens**:
- Iteration 1: Implement UI and upload logic
- Iteration 2: Fix import errors and permissions
- Iteration 3: Handle upload errors properly
- Iteration 4: Test with mock photo, fix display issue
- Iteration 5: End-to-end test passes → outputs promise → done

### Workflow 3: Refactoring with QA

**Scenario**: Extract Haversine distance to shared util

```bash
/ralph-loop "Extract distance calculation to utils/distance.ts, add tests, update all references" \
  --max-iterations 3 \
  --completion-promise "Util extracted with tests, all references updated, QA agent confirms no breaking changes"
```

**What Happens**:
- Iteration 1: Create util, write tests, update references
- Iteration 2: QA agent finds missed reference in BathroomMap, Claude fixes
- Iteration 3: QA agent passes, all tests green → outputs promise → done

---

## When to Use Ralph vs Manual

### ✅ Use Ralph When:
- Task has clear, automated verification (tests, linters, type checking)
- Multiple iterations expected (complex logic, refactoring)
- Want hands-free development while you do other work
- Implementing well-defined features with acceptance criteria

### ❌ Don't Use Ralph When:
- Need human judgment (UX decisions, design choices)
- Task is too vague or open-ended
- Single-shot task (just read a file and answer question)
- Debugging requires user input (environment setup, credentials)

---

## Ralph State File

Ralph stores loop state in `.claude/ralph-loop.local.md`:

```markdown
---
iteration: 3
max_iterations: 5
completion_promise: "All tests passing and feature complete"
---

Implement user profile feature with tests
```

**DO NOT manually edit this file** - it will corrupt the loop state.

---

## Advanced: Custom Completion Promises

### Multiple Conditions

Use `<promise>` tag with exact text:

```bash
--completion-promise "READY: TypeScript clean, tests passing, QA approved"
```

Then Claude outputs:
```
<promise>READY: TypeScript clean, tests passing, QA approved</promise>
```

Only when **ALL** conditions are true.

### Measurable Metrics

```bash
--completion-promise "Code coverage above 80%, 0 TypeScript errors, 0 ESLint warnings"
```

Ralph will check coverage reports and only stop when target is met.

---

## Troubleshooting

### Loop Won't Stop

**Problem**: Ralph keeps running even though task seems done
**Solution**: Check completion promise is EXACT match (case-sensitive, punctuation matters)

```bash
# Check current promise
cat .claude/ralph-loop.local.md

# Cancel and restart with corrected promise
/cancel-ralph
/ralph-loop "..." --completion-promise "EXACT TEXT HERE"
```

### Max Iterations Hit

**Problem**: Loop stopped at max iterations without completing
**Diagnosis**: Check last Claude output to see what's failing
**Solution**:
1. Fix blocking issue manually (environment, permissions, etc.)
2. Increase max-iterations
3. Simplify completion promise
4. Break task into smaller subtasks

### State File Corrupted

**Problem**: Error message about corrupted state file
**Solution**: Delete state file and restart

```bash
rm .claude/ralph-loop.local.md
/ralph-loop "..." --max-iterations 3 --completion-promise "..."
```

---

## Integration with Our Git Workflow

### Commit Messages in Ralph Loops

Ralph will make commits during iterations. Configure commit message template:

```bash
/ralph-loop "Fix TypeScript errors in reputation system" \
  --max-iterations 3 \
  --completion-promise "0 TypeScript errors, all imports correct, committed with message"
```

Claude will commit each iteration:
```
[RALPH-1] Fix TypeScript errors - initial attempt
[RALPH-2] Fix TypeScript errors - corrected imports
[RALPH-3] Fix TypeScript errors - complete ✅
```

### Squashing Ralph Commits

After loop completes, squash iteration commits:

```bash
git rebase -i HEAD~3  # Squash last 3 Ralph commits
```

Or let Ralph do it in the completion promise:

```bash
--completion-promise "All fixes complete, commits squashed into single commit"
```

---

## Performance Considerations

### Iteration Speed
- Typical iteration: 30-60 seconds
- Includes: file reads, edits, test runs, git operations
- 5 iterations ≈ 5-10 minutes hands-free development

### Context Preservation
- Ralph loops preserve full context between iterations
- Each iteration sees all previous work
- Git history provides additional context
- File system state persists

### Token Usage
- Each iteration is a full Claude response
- 5 iterations with 2000 tokens each = 10,000 total tokens
- Monitor usage if running many loops

---

## Example: Our Agile Sprint with Ralph

**User Story**: As a user, I want to sign out of the app

**Acceptance Criteria**:
- Sign-out button in profile settings
- Confirmation dialog before sign-out
- Clears Clerk session
- Redirects to sign-in screen
- TypeScript clean
- No regressions

**With Ralph**:

```bash
/ralph-loop "Implement sign-out button on profile screen per acceptance criteria in USER_STORY.md" \
  --max-iterations 5 \
  --completion-promise "All acceptance criteria met: button added, confirmation works, session clears, redirects to sign-in, TypeScript clean, QA agent approved"
```

**Ralph's Work**:
1. Iteration 1: Adds button, implements sign-out
2. Iteration 2: Fixes missing confirmation dialog
3. Iteration 3: Fixes redirect issue (was going to onboarding instead of sign-in)
4. Iteration 4: Runs QA agent, finds missing error handling, adds it
5. Iteration 5: QA passes, all criteria met → outputs promise → DONE!

**Result**: Feature complete in ~10 minutes, fully tested, no manual intervention needed.

---

## Conclusion

Ralph Wiggum transforms our agile workflow from:
- Manual iteration: implement → test → fix → repeat
- To automated iteration: define criteria → Ralph loops until complete

**When to use Ralph**: Tasks with clear success criteria and automated verification
**When not to use Ralph**: Exploratory work, design decisions, vague requirements

**Best Practice**: Start with small tasks to learn Ralph's behavior, then scale up to complex features.

---

## Quick Reference

```bash
# Start loop
/ralph-loop "TASK" --max-iterations N --completion-promise "CRITERIA"

# Cancel loop
/cancel-ralph

# Check status
cat .claude/ralph-loop.local.md

# View help
/help ralph-wiggum
```

---

**Plugin Installation**: ✅ Complete
**Ready to Use**: ✅ Yes
**Documentation**: This file

Try Ralph on your next feature! Start small, set clear criteria, and watch it iterate to completion. 🔄

---

**Document Created**: January 4, 2026
**By**: Claude Sonnet 4.5
**For**: Gabriel Webb
**Project**: Should I Wait - Bathroom Finder App
