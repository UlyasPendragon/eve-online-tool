# Development Workflow - EVE Online Tool

This document outlines the development workflow, quality gates, and best practices for the EVE Online Tool project.

---

## Table of Contents

- [Pre-Commit Checklist](#pre-commit-checklist)
- [Quality Gates by Task Type](#quality-gates-by-task-type)
- [Claude Code Subagent Usage](#claude-code-subagent-usage)
- [Pull Request Process](#pull-request-process)
- [Code Review Standards](#code-review-standards)
- [Testing Requirements](#testing-requirements)

---

## Pre-Commit Checklist

Before committing changes to `main`, use this checklist to ensure quality and security:

### 1. Security-Critical Changes? 🔒

**Ask yourself:**
- Does this involve authentication or OAuth tokens?
- Does this handle payments or Stripe integration?
- Does this process sensitive user data?
- Does this modify database queries with user input?

**If YES:**
```
✅ MANDATORY: Use the security-auditor to review [files/directory]
```

**Example:**
```
Use the security-auditor to review src/auth/token-refresh.service.ts
```

**Issues requiring security-auditor:**
- EVE-10 (OAuth Authentication)
- EVE-19 (Subscription Billing)
- EVE-20 (Payment Processing)
- Any auth, payment, or sensitive data changes

---

### 2. ESI Integration? 🚀

**Ask yourself:**
- Am I implementing a new ESI endpoint?
- Am I debugging ESI rate limiting issues (420, 429)?
- Am I optimizing ESI data fetching patterns?
- Am I implementing ESI caching strategies?

**If YES:**
```
✅ RECOMMENDED: Use the esi-integration-expert to [implement/review/debug] [endpoint]
```

**Example:**
```
Use the esi-integration-expert to implement the character skills endpoint
```

**Issues requiring esi-integration-expert:**
- EVE-12 (ESI Client Library Expansion)
- Any new ESI endpoint implementation
- ESI rate limit or caching issues

---

### 3. Database Changes? 🗄️

**Ask yourself:**
- Am I creating or modifying a Prisma schema?
- Am I investigating slow database queries?
- Am I experiencing N+1 query problems?
- Do I need to design index strategy?

**If YES:**
```
✅ RECOMMENDED: Use the database-optimizer to review [schema/queries]
```

**Example:**
```
Use the database-optimizer to review prisma/schema.prisma focusing on Character and Skill models
```

**Issues requiring database-optimizer:**
- EVE-11 (Database Schema Refinement)
- Performance optimization tasks
- Schema design for new features

---

### 4. Feature Complete? ✨

**Ask yourself:**
- Is this feature ready for pull request?
- Have I made changes to 3+ files?
- Is this a significant code addition (>200 lines)?
- Am I about to merge to main?

**If YES:**
```
✅ RECOMMENDED: Use the code-reviewer to review [feature/directory]
```

**Example:**
```
Use the code-reviewer to review the wallet service implementation
```

**When to use:**
- Before creating pull requests
- After completing complex features
- Before merging to main
- For any significant refactoring

---

### 5. Test Coverage Needed? 🧪

**Ask yourself:**
- Is my test coverage below 80%?
- Do I need to create a comprehensive test suite?
- Am I unsure how to test this complex feature?
- Do I need integration test design?

**If YES:**
```
✅ AS NEEDED: Use the test-architect to create tests for [service/feature]
```

**Example:**
```
Use the test-architect to create tests for the character service
```

**When to use:**
- After implementing features (coverage < 80%)
- Complex integration test scenarios
- When setting up new test infrastructure

---

### 6. New API Design? 🌐

**Ask yourself:**
- Am I designing new REST API endpoints?
- Do I need to create OpenAPI specifications?
- Am I establishing API versioning strategy?
- Do I need to review API consistency?

**If YES:**
```
✅ AS NEEDED: Use the api-architect to design [API surface]
```

**Example:**
```
Use the api-architect to design the wallet transaction API
```

**When to use:**
- Designing new API endpoints
- OpenAPI spec generation
- API versioning planning
- Endpoint consistency reviews

---

## Quality Gates by Task Type

### Security-Critical Tasks (MANDATORY)

**Always use security-auditor for:**
- OAuth token handling
- Payment processing (Stripe)
- User authentication/authorization
- Database queries with user input
- Encryption/decryption operations
- Secret management

**Token cost:** 15,000-25,000 tokens
**ROI:** ⭐⭐⭐⭐⭐ (prevents critical vulnerabilities)

---

### ESI Integration Tasks (RECOMMENDED)

**Use esi-integration-expert for:**
- New ESI endpoint implementation
- ESI rate limit handling (420, 429 errors)
- ESI caching strategy design
- OAuth scope management
- Batch ESI request optimization

**Token cost:** 12,000-18,000 tokens
**ROI:** ⭐⭐⭐⭐⭐ (prevents API bans, ensures compliance)

---

### Database Tasks (RECOMMENDED)

**Use database-optimizer for:**
- Prisma schema design
- N+1 query prevention
- Index strategy planning
- Query performance issues
- Migration design

**Token cost:** 8,000-15,000 tokens
**ROI:** ⭐⭐⭐⭐ (performance compounds at scale)

---

### Code Quality Tasks (RECOMMENDED)

**Use code-reviewer for:**
- Pre-merge code reviews
- Feature completion reviews
- Refactoring validation
- Best practices compliance

**Token cost:** 10,000-20,000 tokens
**ROI:** ⭐⭐⭐⭐ (prevents tech debt, catches bugs)

---

### Testing Tasks (AS NEEDED)

**Use test-architect for:**
- Test suite generation
- Test coverage improvement
- Integration test design
- Test strategy planning

**Token cost:** 10,000-15,000 tokens
**ROI:** ⭐⭐⭐⭐ (regression prevention, refactoring confidence)

---

### API Design Tasks (AS NEEDED)

**Use api-architect for:**
- REST endpoint design
- OpenAPI specification
- API versioning strategy
- Endpoint consistency

**Token cost:** 10,000-18,000 tokens
**ROI:** ⭐⭐⭐ (API consistency, documentation)

---

## Claude Code Subagent Usage

### How to Invoke Subagents

**Pattern:**
```
Use the [subagent-name] to [specific task] in [scope]
```

**Examples:**
```
Use the security-auditor to review src/auth/esi.ts
Use the code-reviewer to review the wallet service
Use the esi-integration-expert to implement the skills endpoint
Use the database-optimizer to review the character schema
Use the test-architect to create tests for character.service.ts
Use the api-architect to design the wallet transaction API
```

### Best Practices

1. **Be specific**: Provide clear scope (files, directories, features)
2. **One at a time**: Don't chain multiple subagents in one request
3. **Read reports carefully**: Implement critical issues immediately
4. **Track costs**: Monitor token usage (~$1.50-2.00/month budget)

### Documentation

- **Comprehensive Guide**: `SUBAGENTS.md`
- **Integration Guide**: `Docs/subagent-integration-guide.md`
- **Agent Configurations**: `.claude/agents/`

---

## Pull Request Process

### Before Creating PR

1. **Run pre-commit checklist** (above)
2. **Invoke relevant subagents** based on task type
3. **Address critical/high-priority issues** from subagent reports
4. **Create Linear tasks** for suggestions/improvements
5. **Ensure tests pass** and coverage ≥ 80%

### PR Template

```markdown
## Description
[Brief description of changes]

## Linear Issue
Closes EVE-XX

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Quality Gates
- [ ] Security-auditor review (if auth/payment/sensitive data)
- [ ] Code-reviewer review (if feature complete)
- [ ] ESI-integration-expert review (if ESI changes)
- [ ] Database-optimizer review (if schema/query changes)
- [ ] Test-architect review (if coverage < 80%)
- [ ] API-architect review (if new API surface)

## Subagent Reports
[Link to or paste subagent review reports]

## Testing
- [ ] All tests pass
- [ ] Coverage ≥ 80%
- [ ] Manual testing complete

## Checklist
- [ ] Code follows project style guide
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] Linear issue updated
```

---

## Code Review Standards

### What to Look For

#### Security
- No hardcoded secrets or API keys
- Proper input validation
- SQL injection prevention (Prisma)
- XSS prevention
- CSRF protection on state-changing operations

#### Performance
- No N+1 queries
- Proper use of Prisma `include`/`select`
- Caching where appropriate
- Parallel async operations with `Promise.all()`
- Efficient pagination (cursor-based preferred)

#### Code Quality
- TypeScript strict mode compliance
- Proper error handling (try/catch)
- Consistent naming conventions
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)

#### EVE-Specific
- ESI rate limiting respected
- Token refresh logic correct
- Cache headers honored
- OAuth scopes properly requested

---

## Testing Requirements

### Coverage Targets

- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

### Critical Paths (100% coverage required)

- Authentication and authorization
- Payment processing
- Token encryption/decryption
- Database migrations
- OAuth flows

### Test Pyramid

```
    /\
   /E2E\      <- 5% (Few, slow, expensive)
  /------\
 /  INT   \   <- 25% (Some, moderate speed)
/----------\
/   UNIT    \ <- 70% (Many, fast, cheap)
```

### Running Tests

```bash
cd eve-nomad-backend
pnpm test              # Run all tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # Coverage report
```

---

## Development Commands

### Backend Development

```bash
cd eve-nomad-backend

# Start services
docker-compose up -d          # PostgreSQL + Redis
pnpm dev                       # Start dev server (hot reload)

# Database
pnpm prisma migrate dev       # Run migrations
pnpm prisma studio            # Open database UI
pnpm prisma generate          # Regenerate Prisma client

# Code quality
pnpm lint                      # Run ESLint
pnpm format                    # Format with Prettier
pnpm typecheck                 # Check TypeScript types

# Testing
pnpm test                      # Run tests
pnpm test:coverage             # Coverage report
```

---

## Common Workflows

### Workflow 1: Implementing New Feature

```
1. Create Linear issue
2. Checkout new branch
3. Implement feature with main Claude conversation
4. Use relevant subagents (code-reviewer, etc.)
5. Address critical/high-priority issues
6. Write tests (or use test-architect)
7. Create PR with subagent reports
8. Merge to main
9. Update Linear issue
```

### Workflow 2: Adding New ESI Endpoint

```
1. Create Linear issue
2. Use esi-integration-expert to design implementation
3. Implement ESI client method
4. Add rate limiting and caching
5. Use code-reviewer to review
6. Use test-architect to create tests
7. Create PR with subagent reports
8. Merge to main
```

### Workflow 3: Security-Critical Change

```
1. Create Linear issue
2. Implement change with main conversation
3. Use security-auditor to review (MANDATORY)
4. Address ALL critical/high issues
5. Use code-reviewer for additional review
6. Create comprehensive tests
7. Create PR with security-auditor report
8. Merge to main (only after security approval)
```

### Workflow 4: Database Schema Change

```
1. Create Linear issue
2. Use database-optimizer to design schema
3. Create Prisma migration
4. Update queries to use new schema
5. Use code-reviewer to review queries
6. Test with sample data
7. Create PR with subagent reports
8. Merge to main
```

---

## Token Budget Management

### Monthly Budget

**Target:** ~370,000 tokens/month (~$1.50-2.00/month)

**Breakdown:**
- 2x code-reviewer/week: 120,000 tokens/month
- 1x security-auditor/week: 80,000 tokens/month
- 1x esi-integration-expert/week: 60,000 tokens/month
- 1x test-architect/2 weeks: 30,000 tokens/month
- 0.5x database-optimizer/2 weeks: 30,000 tokens/month
- 0.5x api-architect/2 weeks: 30,000 tokens/month

### Cost Optimization

1. **Scope reduction**: Review specific files, not entire directories
2. **Pre-filtering**: Use Grep to find relevant files first
3. **Batching**: Review related files in single invocation
4. **Main conversation first**: Use for routine tasks
5. **Read reports thoroughly**: Avoid re-invocations for clarification

---

## Related Documentation

- **Project Guidelines**: `CLAUDE.md`
- **Subagents Guide**: `SUBAGENTS.md`
- **Integration Guide**: `Docs/subagent-integration-guide.md`
- **Backend Setup**: `eve-nomad-backend/SETUP.md`
- **Testing Guide**: `eve-nomad-backend/TESTING.md`
- **ESI Resources**: `eve-nomad-backend/ESI_RESOURCES.md`

---

## Questions?

If you're unsure which subagent to use or whether to use one at all:

1. Check the [Pre-Commit Checklist](#pre-commit-checklist) above
2. Consider token cost vs. value (see `Docs/subagent-integration-guide.md`)
3. When in doubt, ask main Claude conversation first
4. Use subagents for specialized, high-value tasks only

**Remember**: Subagents are specialists, not generalists. Use them strategically for maximum ROI.
