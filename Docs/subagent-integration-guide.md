# Subagent Integration Guide - EVE Online Tool

**Document Purpose**: Practical guide for integrating Claude Code subagents into the EVE Online Tool development workflow with detailed token cost analysis.

**Target Audience**: Developers working on the EVE Online Tool project

**Last Updated**: 2025-01-15

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Token Cost Calculator](#token-cost-calculator)
3. [Workflow Integration](#workflow-integration)
4. [Real-World Examples](#real-world-examples)
5. [Cost Optimization Strategies](#cost-optimization-strategies)
6. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites

- Claude Code CLI configured
- EVE Online Tool repository cloned
- `.claude/agents/` directory with 6 subagent configurations

### Verify Subagents Available

```bash
ls .claude/agents/
```

Expected output:
```
api-architect.md
code-reviewer.md
database-optimizer.md
esi-integration-expert.md
security-auditor.md
test-architect.md
```

### Basic Invocation Pattern

```
Use the [subagent-name] to [specific task] in [scope]
```

**Examples**:
- `Use the security-auditor to review src/auth/esi.ts`
- `Use the code-reviewer to review the wallet service`
- `Use the esi-integration-expert to implement the skills endpoint`

---

## Token Cost Calculator

### Understanding Token Consumption

**Base Conversation**: ~2,000-5,000 tokens per interaction (varies by task complexity)

**Subagent Invocation**: **3-4x multiplier**

**Why the multiplier?**
1. Context initialization (separate window)
2. Detailed system prompt with examples (1,500-3,000 tokens)
3. Tool results processing in isolated context
4. Final report generation

---

### Estimated Token Costs by Subagent

#### 1. security-auditor (Opus Model)
**Base Token Cost**: 15,000-25,000 tokens per audit

**Breakdown**:
- System prompt: ~3,000 tokens (security patterns, OWASP checklist)
- File reading: 5,000-15,000 tokens (depends on file count)
- Analysis: 5,000-7,000 tokens (vulnerability checking)
- Report generation: 2,000-3,000 tokens

**Variables affecting cost**:
- Number of files reviewed (500-1,000 tokens per file)
- Complexity of auth/payment logic
- Number of issues found (more issues = longer report)

**Example scenarios**:
```
Small scope (1-2 files):        ~15,000 tokens
Medium scope (5-8 files):       ~20,000 tokens
Large scope (entire auth/):     ~25,000 tokens
```

---

#### 2. code-reviewer (Sonnet Model)
**Base Token Cost**: 10,000-20,000 tokens per review

**Breakdown**:
- System prompt: ~2,500 tokens (code quality checklist)
- File reading: 4,000-12,000 tokens
- Analysis: 3,000-5,000 tokens
- Report generation: 1,500-2,500 tokens

**Example scenarios**:
```
Single service file:            ~10,000 tokens
Feature (3-5 files):            ~15,000 tokens
Large PR (10+ files):           ~20,000 tokens
```

---

#### 3. esi-integration-expert (Sonnet Model)
**Base Token Cost**: 12,000-18,000 tokens per endpoint

**Breakdown**:
- System prompt: ~2,800 tokens (ESI patterns, rate limits)
- ESI documentation fetch: 2,000-4,000 tokens (WebFetch tool)
- Code reading: 3,000-6,000 tokens
- Implementation example: 3,000-5,000 tokens
- Report generation: 1,500-2,500 tokens

**Example scenarios**:
```
Simple endpoint (wallet balance):       ~12,000 tokens
Complex endpoint (skills + queue):      ~15,000 tokens
Batch endpoint optimization:            ~18,000 tokens
```

---

#### 4. test-architect (Sonnet Model)
**Base Token Cost**: 10,000-15,000 tokens per test suite

**Breakdown**:
- System prompt: ~2,000 tokens (test patterns, AAA structure)
- Source code reading: 3,000-6,000 tokens
- Test file writing: 3,000-5,000 tokens
- Test execution: 1,000-2,000 tokens
- Report generation: 1,500-2,500 tokens

**Example scenarios**:
```
Unit tests for single service:         ~10,000 tokens
Integration tests for controller:      ~12,000 tokens
Full test suite (unit + integration):  ~15,000 tokens
```

---

#### 5. database-optimizer (Sonnet Model)
**Base Token Cost**: 8,000-15,000 tokens per schema/query review

**Breakdown**:
- System prompt: ~2,500 tokens (Prisma patterns, indexing)
- Schema reading: 2,000-4,000 tokens
- Query analysis (Grep): 2,000-5,000 tokens
- Optimization recommendations: 2,000-4,000 tokens
- Report generation: 1,500-2,500 tokens

**Example scenarios**:
```
Single model schema review:             ~8,000 tokens
Service query optimization:             ~12,000 tokens
Full schema redesign (5+ models):       ~15,000 tokens
```

---

#### 6. api-architect (Sonnet Model)
**Base Token Cost**: 10,000-18,000 tokens per API surface

**Breakdown**:
- System prompt: ~2,500 tokens (REST patterns, OpenAPI)
- Existing code reading: 3,000-6,000 tokens
- OpenAPI spec generation: 3,000-7,000 tokens
- Implementation examples: 2,000-4,000 tokens
- Report generation: 1,500-2,500 tokens

**Example scenarios**:
```
Single endpoint design:                 ~10,000 tokens
API resource (5-6 endpoints):           ~15,000 tokens
Full API versioning migration:          ~18,000 tokens
```

---

### Monthly Token Budget Estimate

**Assumptions**:
- 4 weeks of active development
- 2 features per week
- Strategic subagent usage only

**Conservative estimate**:
```
Weekly Usage:
- 2x code-reviewer (post-feature):             30,000 tokens
- 1x security-auditor (auth/payment changes):  20,000 tokens
- 1x esi-integration-expert (new endpoint):    15,000 tokens
- 1x test-architect (test suite):              12,000 tokens
- 0.5x database-optimizer (every 2 weeks):      7,500 tokens
- 0.5x api-architect (every 2 weeks):           7,500 tokens

Weekly Total:   ~92,000 tokens
Monthly Total:  ~368,000 tokens
```

**Cost at Claude API rates** (as of 2025-01):
- Sonnet: ~$3/million input tokens
- Opus: ~$15/million input tokens

```
Monthly cost estimate:
- Sonnet tokens: ~328,000 × $3/1M   = $0.98
- Opus tokens:   ~40,000 × $15/1M   = $0.60
Total:                                 $1.58/month
```

**Note**: Claude Code pricing may differ. Check current rates.

---

## Workflow Integration

### Development Workflow with Subagents

```
┌─────────────────────────────────────────────────────────────────┐
│  Feature Development Lifecycle                                   │
└─────────────────────────────────────────────────────────────────┘

1. DESIGN PHASE
   ├─ Create Linear issue
   ├─ (Optional) Use api-architect for new API surfaces
   └─ (Optional) Use database-optimizer for schema design

2. IMPLEMENTATION PHASE
   ├─ Write feature code with main Claude conversation
   ├─ Write unit tests with main conversation
   └─ Use esi-integration-expert ONLY for ESI endpoints

3. TESTING PHASE
   ├─ Use test-architect if coverage < 80%
   └─ Fix failing tests with main conversation

4. REVIEW PHASE (Pre-commit)
   ├─ Use code-reviewer for all features
   ├─ Use security-auditor for auth/payment/sensitive changes
   └─ Address critical/high-priority issues

5. DOCUMENTATION PHASE
   ├─ Update OpenAPI specs (main conversation)
   └─ Update Linear issue

6. MERGE
   ├─ Create pull request
   ├─ Link subagent reports
   └─ Merge to main
```

---

### Decision Tree: Which Subagent to Use?

```
Is this a security-critical change?
(auth, payment, tokens, sensitive data)
│
├─ YES → security-auditor (mandatory)
│
└─ NO
   │
   Is this a new ESI endpoint or ESI issue?
   │
   ├─ YES → esi-integration-expert
   │
   └─ NO
      │
      Is this a completed feature ready for review?
      │
      ├─ YES → code-reviewer
      │
      └─ NO
         │
         Do you need tests written?
         │
         ├─ YES → test-architect
         │
         └─ NO
            │
            Is this a database performance issue?
            │
            ├─ YES → database-optimizer
            │
            └─ NO
               │
               Is this a new API surface design?
               │
               ├─ YES → api-architect
               │
               └─ NO → Use main conversation
```

---

## Real-World Examples

### Example 1: Implementing OAuth Token Refresh

**Scenario**: Implementing automatic token refresh for EVE SSO

**Workflow**:
1. **Design** (main conversation): Plan the token refresh logic
2. **Implementation** (main conversation): Write the service
3. **Security Review** (security-auditor):
   ```
   Use the security-auditor to review src/auth/token-refresh.service.ts
   ```
   **Token cost**: ~15,000 tokens
   **Output**: Identifies missing token encryption, recommends AES-256-GCM

4. **Fix issues** (main conversation): Implement encryption
5. **Code review** (code-reviewer):
   ```
   Use the code-reviewer to review the token refresh service
   ```
   **Token cost**: ~12,000 tokens
   **Output**: Approves changes, suggests adding correlation IDs

6. **Tests** (test-architect):
   ```
   Use the test-architect to create tests for token-refresh.service.ts
   ```
   **Token cost**: ~10,000 tokens
   **Output**: Generates 8 unit tests + 2 integration tests

**Total token cost**: ~37,000 tokens
**Time saved**: 4-5 hours (security research + test writing)
**Bugs prevented**: Critical vulnerability (unencrypted tokens)

---

### Example 2: Adding Wallet Journal Endpoint

**Scenario**: Implementing ESI wallet journal fetching with pagination

**Workflow**:
1. **ESI Integration** (esi-integration-expert):
   ```
   Use the esi-integration-expert to implement the wallet journal endpoint
   ```
   **Token cost**: ~15,000 tokens
   **Output**:
   - Complete implementation with pagination
   - Rate limit handling (420, 429)
   - Caching strategy (Cache-Control headers)
   - OAuth scope documentation

2. **Implementation** (main conversation): Integrate generated code

3. **Code review** (code-reviewer):
   ```
   Use the code-reviewer to review src/services/wallet-journal.service.ts
   ```
   **Token cost**: ~10,000 tokens
   **Output**: Approves, suggests batch fetching optimization

4. **Tests** (main conversation): Write basic tests

**Total token cost**: ~25,000 tokens
**Time saved**: 2-3 hours (ESI documentation research + error handling)
**Issues prevented**: ESI API ban (missing rate limit handling)

---

### Example 3: Database Schema Redesign

**Scenario**: Optimizing character schema for better query performance

**Workflow**:
1. **Schema analysis** (database-optimizer):
   ```
   Use the database-optimizer to review prisma/schema.prisma focusing on Character and Skill models
   ```
   **Token cost**: ~12,000 tokens
   **Output**:
   - Identifies N+1 query in character loading
   - Recommends composite index on (userId, tokenExpiresAt)
   - Suggests cursor-based pagination for skills

2. **Implementation** (main conversation): Update schema + migrations

3. **Query optimization** (main conversation): Refactor service queries

4. **Code review** (code-reviewer):
   ```
   Use the code-reviewer to review src/services/character.service.ts
   ```
   **Token cost**: ~12,000 tokens
   **Output**: Confirms N+1 fixed, approves changes

**Total token cost**: ~24,000 tokens
**Time saved**: 2 hours (performance profiling + Prisma docs)
**Performance gain**: 5.3x faster character loading

---

### Example 4: Pre-PR Review (Large Feature)

**Scenario**: Completing "Character Dashboard" feature (8 files modified)

**Workflow**:
1. **Security check** (main conversation): Quick scan for sensitive data
2. **Code review** (code-reviewer):
   ```
   Use the code-reviewer to review the Character Dashboard feature in src/features/character-dashboard/
   ```
   **Token cost**: ~18,000 tokens
   **Output**:
   - 1 critical issue (missing error handling)
   - 3 high-priority issues (performance)
   - 5 suggestions (code organization)

3. **Fix critical/high issues** (main conversation)

4. **Re-review** (main conversation): Quick check, no need for full subagent

**Total token cost**: ~18,000 tokens
**Time saved**: 1 hour (manual code review)
**Quality improvement**: Caught 4 production-blocking issues

---

## Cost Optimization Strategies

### 1. Scope Reduction

**Instead of**:
```
Use the security-auditor to review the entire src/ directory
```
**Cost**: ~30,000-40,000 tokens (too broad)

**Better**:
```
Use the security-auditor to review src/auth/esi.ts and src/auth/token-refresh.service.ts
```
**Cost**: ~15,000 tokens (focused)

---

### 2. Pre-filter with Grep

**Instead of**: Invoking subagent blindly

**Better**: Use Grep first to find relevant files

```
Step 1: Find files with OAuth logic
(Use Grep tool to search for "OAuth", "refreshToken", etc.)

Step 2: Review only relevant files
Use the security-auditor to review [specific files found]
```

**Token savings**: 30-40% (fewer files to read)

---

### 3. Batch Related Tasks

**Instead of**: Multiple small invocations
```
Use the code-reviewer to review wallet.service.ts
Use the code-reviewer to review wallet.controller.ts
Use the code-reviewer to review wallet.types.ts
```
**Cost**: 3 × 10,000 = 30,000 tokens

**Better**: Single scoped invocation
```
Use the code-reviewer to review the wallet feature (service + controller + types)
```
**Cost**: ~15,000 tokens (files read in same context)

**Token savings**: 50%

---

### 4. Use Main Conversation for Routine Tasks

**Use subagents for**:
- Security-critical changes
- Complex domain logic (ESI, Prisma)
- Quality gates (pre-merge reviews)

**Use main conversation for**:
- Simple refactoring
- Documentation updates
- Single-file bug fixes
- Routine CRUD operations

**Token savings**: 75% (avoid unnecessary subagent overhead)

---

### 5. Read Reports Thoroughly

Subagent reports contain:
- Specific file/line references
- Code examples for fixes
- Actionable recommendations

**Anti-pattern**: Re-invoking subagent for clarification

**Better**: Read report carefully, ask main conversation for clarification

**Token savings**: 100% (avoid redundant invocations)

---

## Troubleshooting

### Issue: Subagent Response Too Generic

**Symptoms**:
- Report lacks EVE-specific guidance
- Recommendations are vague
- No code examples provided

**Causes**:
1. Scope too broad (reviewing too many files)
2. Unclear invocation prompt
3. Missing context in request

**Solutions**:
```
❌ Bad: Use the esi-integration-expert to help with ESI
✅ Good: Use the esi-integration-expert to implement the /characters/{character_id}/wallet/journal/ endpoint with pagination and rate limiting
```

---

### Issue: Token Budget Exceeded

**Symptoms**:
- Context window limit reached
- Subagent execution fails mid-analysis

**Causes**:
1. Codebase section too large (10+ files)
2. Files contain large data structures
3. Multiple subagents invoked in sequence

**Solutions**:
1. **Reduce scope**:
   ```
   Instead of: src/services/
   Use: src/services/wallet.service.ts
   ```

2. **Break into smaller tasks**:
   ```
   Task 1: Review auth logic
   Task 2: Review payment logic
   (Separate invocations)
   ```

3. **Use Grep to pre-filter**:
   Find specific patterns before full review

---

### Issue: Redundant Recommendations Across Subagents

**Symptoms**:
- code-reviewer and database-optimizer both flag same N+1 query
- Multiple subagents suggest same refactor

**Explanation**: This is expected! Subagents have different specializations but overlap on some issues.

**Best practice**:
- Fix issue once when first flagged
- Future subagent invocations will confirm fix is applied

---

### Issue: Subagent Not Available

**Error**: `Subagent 'security-auditor' not found`

**Causes**:
1. `.claude/agents/` directory missing
2. Subagent file typo in name
3. YAML frontmatter invalid

**Solutions**:
```bash
# Verify directory exists
ls .claude/agents/

# Check file name (exact match required)
ls .claude/agents/security-auditor.md

# Validate YAML frontmatter
head -5 .claude/agents/security-auditor.md
```

Expected:
```yaml
---
name: security-auditor
description: ...
tools: Read, Grep
model: opus
---
```

---

## Token Tracking Template

Use this template to track subagent usage and costs:

```markdown
## Subagent Usage Log - [Feature Name]

**Date**: 2025-01-15
**Feature**: Character Dashboard Implementation
**Linear Issue**: EVE-XX

### Invocations

1. **esi-integration-expert** (2025-01-15 10:30)
   - Task: Implement character location endpoint
   - Scope: New endpoint design
   - Token cost: ~15,000
   - Outcome: Complete implementation provided

2. **code-reviewer** (2025-01-15 14:00)
   - Task: Review character dashboard feature
   - Scope: 8 files in src/features/character-dashboard/
   - Token cost: ~18,000
   - Outcome: 4 issues found, all fixed

3. **test-architect** (2025-01-15 16:00)
   - Task: Create test suite
   - Scope: character-dashboard.service.ts
   - Token cost: ~12,000
   - Outcome: 12 tests generated, 100% passing

**Total tokens**: 45,000
**Time saved**: ~5 hours
**Issues prevented**: 1 critical (missing rate limit), 3 high (performance)
**ROI**: ⭐⭐⭐⭐⭐
```

---

## Summary

### Key Takeaways

1. **Strategic use**: Subagents are specialists, not generalists
2. **Token budgeting**: ~370k tokens/month for typical usage (~$1.50-2.00/month)
3. **High ROI scenarios**: Security audits, ESI integration, pre-merge reviews
4. **Low ROI scenarios**: Routine refactoring, documentation, simple fixes
5. **Cost optimization**: Scope reduction, pre-filtering, batching tasks

### When in Doubt

Ask yourself:
1. Is this a specialized task (security, ESI, database)?
2. Does the value justify 10,000-25,000 tokens?
3. Would this prevent issues costing more to fix later?

**If yes to all three**: Use subagent
**Otherwise**: Use main conversation

---

## Related Documentation

- **SUBAGENTS.md**: Detailed subagent descriptions and usage
- **CLAUDE.md**: Project guidelines
- **Linear EVE-63**: Subagents implementation tracking

---

**Questions?** Ask in main Claude conversation before invoking subagents unnecessarily.
