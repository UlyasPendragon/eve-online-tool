# Claude Code Subagents - EVE Online Tool

This document describes the specialized subagents available in this project and how to use them effectively.

## Table of Contents

- [Overview](#overview)
- [Token Economics](#token-economics)
- [Available Subagents](#available-subagents)
- [When to Use Subagents](#when-to-use-subagents)
- [Invocation Examples](#invocation-examples)
- [Best Practices](#best-practices)
- [Cost-Benefit Analysis](#cost-benefit-analysis)

---

## Overview

This project uses **6 strategic subagents** designed for high-value, specialized tasks. All subagents are **manually invoked only** to maintain control over token costs.

### Why Subagents?

- **Expertise**: Deep domain knowledge (ESI API, Prisma, security)
- **Context Isolation**: Fresh context prevents pollution
- **Quality Gates**: Security audits, code reviews before merge
- **Specialization**: Each agent excels at one specific task

### Design Philosophy

- **Quality over Quantity**: 6 high-ROI agents vs. 12 generic ones
- **Manual Invocation**: Explicit control = predictable costs
- **Read-Only by Default**: Minimal tool access for safety
- **EVE-Specific**: Tailored for EVE Online development

---

## Token Economics

### Cost Multiplier

Each subagent invocation uses **3-4x more tokens** than a standard conversation due to:
- Separate context window initialization
- Detailed system prompts with examples
- Tool result processing in isolated context

### Total Project Token Budget

- **6 subagents** × **3-4x multiplier** = **18-24x baseline**
- **Strategic use only**: High-value tasks that prevent future issues

### When Token Cost is Worth It

✅ **Good ROI**:
- Security audits prevent vulnerabilities (cost >> fix cost)
- Code reviews prevent tech debt compounding
- ESI integration prevents API bans (downtime cost >> token cost)

❌ **Poor ROI**:
- Routine code generation (main conversation handles this)
- Simple refactoring (doesn't require specialized context)
- Documentation writing (not specialized enough)

---

## Available Subagents

### Phase 1: Security & Quality Gates

#### 1. security-auditor (OPUS)
**File**: `.claude/agents/security-auditor.md`
**Model**: Opus (strict, high-quality)
**Tools**: Read, Grep
**Use When**: Before committing auth, payment, or sensitive data changes

**Expertise**:
- OAuth 2.0 security (EVE SSO)
- Payment processing (Stripe)
- OWASP Top 10 vulnerabilities
- Token encryption validation
- SQL injection prevention
- Sensitive data exposure

**Example Output**:
```markdown
## Security Audit Report
**Severity Summary:** 1 Critical, 2 High, 0 Medium, 1 Low

### CRITICAL Issues
[CRITICAL-001] Hardcoded Stripe Secret Key
- File: src/config/stripe.ts:15
- Risk: Complete payment system compromise
- Fix: Move to environment variable
```

**Estimated Token Cost**: 15,000-25,000 tokens per audit
**Frequency**: Low (auth/payment changes only)
**ROI**: Extremely high (prevents security incidents)

---

#### 2. code-reviewer (SONNET)
**File**: `.claude/agents/code-reviewer.md`
**Model**: Sonnet (balanced)
**Tools**: Read, Grep
**Use When**: After completing features, before major PRs

**Expertise**:
- TypeScript best practices
- Fastify patterns
- Prisma query optimization
- Performance issues (N+1 queries, caching)
- Error handling
- Code smells

**Example Output**:
```markdown
## Code Review Report
**Overall Assessment:** ⭐⭐⭐⭐ (4/5 stars)

### 🔴 Critical Issues
[CRITICAL-001] N+1 Query in Character Loading
- Impact: Severe performance degradation
- Fix: Use Prisma `include` instead of loop
```

**Estimated Token Cost**: 10,000-20,000 tokens per review
**Frequency**: Medium (per feature completion)
**ROI**: High (prevents tech debt, catches bugs early)

---

### Phase 2: Domain Expertise

#### 3. esi-integration-expert (SONNET)
**File**: `.claude/agents/esi-integration-expert.md`
**Model**: Sonnet
**Tools**: Read, Grep, WebFetch
**Use When**: Implementing new ESI endpoints, debugging ESI issues

**Expertise**:
- ESI rate limiting (HTTP 420, 429)
- ESI caching (Cache-Control, ETags)
- OAuth scopes for each endpoint
- Pagination patterns
- Error handling (502, 503)
- Batch request optimization

**Example Output**:
```markdown
## ESI Integration Analysis
**Endpoint:** /characters/{character_id}/wallet/journal/
**Required Scope:** esi-wallet.read_character_wallet.v1

### Issues Identified
[ISSUE-001] Missing Rate Limit Handling
- Problem: No 420 error handling
- Risk: IP ban from ESI after 60 errors
```

**Estimated Token Cost**: 12,000-18,000 tokens per endpoint
**Frequency**: Medium (new endpoints, ESI issues)
**ROI**: Very high (prevents API bans, ensures compliance)

---

#### 4. test-architect (SONNET)
**File**: `.claude/agents/test-architect.md`
**Model**: Sonnet
**Tools**: Read, Write, Bash, Grep
**Use When**: After implementing features, improving coverage

**Expertise**:
- Test strategy (70% unit, 25% integration, 5% E2E)
- Jest/Supertest patterns
- Test isolation
- Coverage analysis
- Mock/stub design

**Example Output**:
```markdown
## Test Plan for Wallet Service

### Coverage Strategy
- Unit Tests: 15 tests (business logic)
- Integration Tests: 5 tests (API endpoints + DB)
- Target Coverage: >80% statements

### Test Files to Create
1. wallet.service.test.ts - Core business logic
2. wallet.controller.test.ts - HTTP integration
```

**Estimated Token Cost**: 10,000-15,000 tokens per service
**Frequency**: Medium (per feature)
**ROI**: High (regression prevention, refactoring confidence)

---

### Phase 3: Optimization Specialists

#### 5. database-optimizer (SONNET)
**File**: `.claude/agents/database-optimizer.md`
**Model**: Sonnet
**Tools**: Read, Grep
**Use When**: Designing schemas, investigating slow queries

**Expertise**:
- Prisma schema design
- N+1 query prevention
- Strategic indexing
- Batch operations
- Query performance optimization
- Connection pooling

**Example Output**:
```markdown
## Database Optimization Analysis

### Performance Issues Found
[PERF-001] N+1 Query in Character Loading
- Current: O(n) database calls
- Optimized: O(1) database call
- Fix: Use `include: { skills: true }`

[PERF-002] Missing Index on Expiry Field
- Schema: CachedData
- Field: expiresAt
- Impact: Full table scan on cache cleanup
```

**Estimated Token Cost**: 8,000-15,000 tokens per schema/query review
**Frequency**: Low (schema design, performance issues)
**ROI**: High (performance compounds at scale)

---

#### 6. api-architect (SONNET)
**File**: `.claude/agents/api-architect.md`
**Model**: Sonnet
**Tools**: Read, Write, Grep
**Use When**: Designing new API surfaces, reviewing endpoint consistency

**Expertise**:
- RESTful API design
- OpenAPI 3.0 specification
- Fastify route patterns
- Request/response validation
- API versioning
- Consistent error handling

**Example Output**:
```markdown
## API Design Review

### Endpoint Analysis
[POST /characters]
- Purpose: Create character association
- Request Validation: ✅ Schema defined
- Status Codes: ✅ Semantic (201, 400, 401, 409)
- Documentation: ✅ OpenAPI spec complete

### Issues Found
[API-001] Inconsistent Response Format
- Fix: Standardize to `{ data: {...}, meta: {...} }`
```

**Estimated Token Cost**: 10,000-18,000 tokens per API surface
**Frequency**: Low (new API surfaces only)
**ROI**: Medium-High (API consistency, documentation)

---

## When to Use Subagents

### Security-Critical Changes
✅ **Use security-auditor**:
- OAuth token handling changes
- Payment processing (Stripe integration)
- Database query modifications (SQL injection risk)
- Authentication/authorization logic
- Secret management

❌ **Don't use for**:
- UI components
- Client-side validation
- Non-sensitive CRUD operations

---

### Feature Completion
✅ **Use code-reviewer**:
- Before creating pull requests
- After implementing complex features
- When merging to main branch
- Refactoring existing code

❌ **Don't use for**:
- Work-in-progress code
- Experimental prototypes
- Simple bug fixes

---

### ESI Integration
✅ **Use esi-integration-expert**:
- Implementing new ESI endpoints
- Debugging ESI 420/429 errors
- Optimizing ESI data fetching patterns
- Caching strategy design

❌ **Don't use for**:
- Non-ESI external APIs
- Simple HTTP requests
- Database queries

---

### Test Coverage
✅ **Use test-architect**:
- After implementing features
- When coverage drops below 80%
- Setting up new test infrastructure
- Complex integration test design

❌ **Don't use for**:
- Writing individual simple tests
- Fixing single failing tests
- Test data generation

---

### Database Performance
✅ **Use database-optimizer**:
- Designing new Prisma schemas
- Investigating slow queries
- Performance bottleneck analysis
- Index strategy planning

❌ **Don't use for**:
- Simple CRUD queries
- One-off data migrations
- Database backups

---

### API Design
✅ **Use api-architect**:
- Designing new API endpoints
- OpenAPI spec generation
- API versioning strategy
- Endpoint consistency review

❌ **Don't use for**:
- Single endpoint tweaks
- Internal helper functions
- Non-public APIs

---

## Invocation Examples

### Example 1: Security Audit Before Merge

```
Use the security-auditor to review my OAuth token handling changes in src/auth/
```

**Expected behavior**:
1. Reads all files in `src/auth/`
2. Checks for hardcoded secrets, token exposure, OAuth best practices
3. Returns detailed report with severity levels
4. Provides specific fixes for issues found

---

### Example 2: Code Review After Feature

```
Use the code-reviewer to review my wallet service implementation
```

**Expected behavior**:
1. Reads wallet service files
2. Checks TypeScript patterns, performance, error handling
3. Identifies N+1 queries, code smells, best practices
4. Returns review with strengths, issues, and action items

---

### Example 3: ESI Endpoint Implementation

```
Use the esi-integration-expert to help implement the character skills endpoint
```

**Expected behavior**:
1. Fetches ESI documentation for skills endpoint
2. Reviews existing ESI client patterns
3. Provides complete implementation with rate limiting, caching, error handling
4. Documents OAuth scopes required

---

### Example 4: Test Suite Generation

```
Use the test-architect to create tests for the character service
```

**Expected behavior**:
1. Reads character service implementation
2. Analyzes dependencies and complexity
3. Designs test plan with coverage strategy
4. Generates comprehensive test suite
5. Runs tests to verify they pass

---

### Example 5: Database Optimization

```
Use the database-optimizer to review my character schema and queries
```

**Expected behavior**:
1. Reads Prisma schema
2. Searches for character-related queries
3. Identifies N+1 queries, missing indexes, inefficient patterns
4. Generates optimization report with estimated performance gains

---

### Example 6: API Design

```
Use the api-architect to design the wallet transaction API
```

**Expected behavior**:
1. Reads existing wallet code
2. Designs RESTful endpoint structure
3. Creates Fastify schemas for validation
4. Generates OpenAPI specification
5. Provides implementation example

---

## Best Practices

### 1. Explicit Invocation
Always explicitly invoke subagents by name:

✅ **Good**: `Use the security-auditor to review this auth code`
❌ **Bad**: `Can you check if this is secure?` (ambiguous)

### 2. Scope the Task
Provide clear, bounded scope:

✅ **Good**: `Use the code-reviewer to review src/services/wallet.service.ts`
❌ **Bad**: `Review everything` (too broad)

### 3. One Subagent at a Time
Don't chain multiple subagents in one request:

✅ **Good**: First use security-auditor, review report, then use code-reviewer
❌ **Bad**: `Use security-auditor and code-reviewer and database-optimizer`

### 4. Read Reports Carefully
Subagent reports contain actionable fixes:

- Implement critical issues immediately
- Track high-priority issues as Linear tasks
- Consider suggestions for future refactors

### 5. Track Costs
Monitor token usage:

- Check conversation token counter
- Estimate cost before invocation (see Cost-Benefit Analysis below)
- Use sparingly on large codebases

---

## Cost-Benefit Analysis

### High-ROI Scenarios

| Scenario | Subagent | Token Cost | Time Saved | Bug Prevention | ROI |
|----------|----------|------------|------------|----------------|-----|
| OAuth security review | security-auditor | 20k | 2-3 hours | Critical vulns | ⭐⭐⭐⭐⭐ |
| ESI endpoint implementation | esi-integration-expert | 15k | 1-2 hours | API bans | ⭐⭐⭐⭐⭐ |
| Pre-merge code review | code-reviewer | 15k | 1 hour | Tech debt | ⭐⭐⭐⭐ |
| Schema design | database-optimizer | 12k | 1 hour | Performance | ⭐⭐⭐⭐ |
| Test suite creation | test-architect | 12k | 2 hours | Regressions | ⭐⭐⭐⭐ |
| API design | api-architect | 15k | 1 hour | Inconsistency | ⭐⭐⭐ |

### Low-ROI Scenarios (Avoid)

| Scenario | Why Avoid | Alternative |
|----------|-----------|-------------|
| Simple CRUD review | Not specialized enough | Main conversation |
| Documentation writing | Not technical analysis | Main conversation |
| Routine refactoring | Doesn't justify token cost | Main conversation |
| Experimental code | Too early for quality gates | Main conversation |

---

## Workflow Integration

### Pre-Commit Checklist

Before committing changes to `main`:

1. **Security-critical changes?** → security-auditor
2. **New feature complete?** → code-reviewer
3. **ESI integration added?** → esi-integration-expert
4. **Database schema modified?** → database-optimizer
5. **Tests needed?** → test-architect
6. **New API endpoints?** → api-architect

### Pull Request Process

```
1. Implement feature
2. Run relevant subagent review
3. Address critical/high-priority issues
4. Create Linear tasks for suggestions
5. Create pull request with review report linked
6. Merge to main
```

---

## Troubleshooting

### Subagent Not Found

**Error**: `Subagent 'security-auditor' not found`

**Fix**: Ensure `.claude/agents/security-auditor.md` exists in the repository root.

---

### Token Budget Exceeded

**Error**: Context window limit reached during subagent execution

**Causes**:
- Codebase too large for single analysis
- Too many files in scope

**Fixes**:
- Narrow scope: Review specific files/directories
- Break into smaller tasks
- Use Grep to find specific patterns before full review

---

### Subagent Provides Generic Advice

**Issue**: Subagent response lacks EVE-specific or detailed guidance

**Causes**:
- Unclear invocation prompt
- Scope too broad

**Fixes**:
- Be specific: "Review OAuth token encryption in src/auth/esi.ts"
- Provide context: "This handles EVE SSO OAuth 2.0 flow"
- Reference specific concerns: "Check for 420 error handling"

---

## Future Expansion

As the project evolves, consider adding subagents for:

- **performance-profiler**: Runtime performance analysis
- **deployment-specialist**: Docker, CI/CD optimization
- **monitoring-architect**: Logging, metrics, alerting design

**Decision criteria**: Only add if ROI > 4⭐ and usage frequency justifies token cost.

---

## Related Documentation

- **Linear Project**: EVE-63 (Subagents Implementation)
- **Agent Configurations**: `.claude/agents/`
- **CLAUDE.md**: Project overview and guidelines

---

## Questions?

If you're unsure which subagent to use:

1. Check "When to Use Subagents" section above
2. Consider token cost vs. value
3. When in doubt, ask main Claude conversation first
4. Use subagents for specialized, high-value tasks only

**Remember**: Subagents are specialists, not generalists. Use them strategically.
