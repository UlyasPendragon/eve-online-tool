# Contributing to EVE Online Tool

Thank you for your interest in contributing to EVE Online Tool! This document provides guidelines and workflows for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Code Quality Standards](#code-quality-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation Guidelines](#documentation-guidelines)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect differing viewpoints and experiences
- Accept responsibility and apologize when we make mistakes

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Any conduct inappropriate in a professional setting

## Getting Started

### Prerequisites

1. **Install required tools**:
   - Node.js v22+
   - pnpm v8+
   - Docker and Docker Compose
   - Git

2. **Set up the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/eve-online-tool.git
   cd eve-online-tool
   cd eve-nomad-backend
   pnpm install
   ```

3. **Configure environment**:
   - Copy `.env.example` to `.env`
   - Fill in required environment variables
   - See `eve-nomad-backend/SETUP.md` for details

4. **Start development environment**:
   ```bash
   docker-compose up -d
   pnpm prisma migrate dev
   pnpm dev
   ```

### Finding Work

1. Browse [Linear issues](https://linear.app/eve-online-tool)
2. Look for issues labeled "good first issue" or "help wanted"
3. Comment on the issue to express interest
4. Wait for maintainer assignment before starting work

## Development Workflow

### 1. Create a Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/eve-XX-brief-description
```

**Branch naming conventions**:
- `feature/eve-XX-name` - New features
- `fix/eve-XX-name` - Bug fixes
- `refactor/eve-XX-name` - Code refactoring
- `docs/eve-XX-name` - Documentation updates
- `test/eve-XX-name` - Test additions/fixes

Always include the Linear issue ID (EVE-XX) in the branch name.

### 2. Make Your Changes

- Write clean, readable code following our style guide
- Add tests for new functionality
- Update documentation as needed
- Run linting and type checking frequently

### 3. Test Your Changes

```bash
# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run tests
pnpm test

# Run all quality checks
pnpm typecheck && pnpm lint && pnpm test
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "EVE-XX: Brief description of change"
```

See [Commit Message Convention](#commit-message-convention) below.

### 5. Push and Create PR

```bash
git push origin feature/eve-XX-brief-description
```

Then create a pull request on GitHub using the PR template.

## Branching Strategy

We use **GitHub Flow** - a simple, trunk-based development workflow:

```
main (production-ready)
  ├─ feature/eve-XX-feature-name
  ├─ fix/eve-XX-bug-name
  └─ hotfix/critical-issue
```

### Rules

- `main` branch is always deployable
- All work happens in feature branches
- Feature branches are short-lived (merge frequently)
- Pull requests are required for all changes to `main`
- Branch protection rules enforce code review

## Commit Message Convention

### Format

```
EVE-XX: Brief description of change (50 chars max)

Longer description explaining the why and what (optional).
Wrap at 72 characters.

- Bullet points for specific changes
- Another change
- Yet another change

Closes EVE-XX
```

### Examples

**Good commits**:
```
EVE-64: Add GitHub repository configuration files

Creates .gitignore, .gitattributes, and PR template for the
repository setup. Configures Node.js/TypeScript patterns and
quality gate checklists.

Closes EVE-64
```

```
EVE-65: Implement Prisma client singleton pattern

Prevents connection pool exhaustion by using a shared Prisma
client instance across all services. Adds graceful shutdown
handler to disconnect on server termination.

Closes EVE-65
```

**Bad commits** (don't do this):
```
fix stuff
updated files
WIP
asdf
```

### Rules

1. **Start with Linear issue ID**: `EVE-XX:`
2. **Use imperative mood**: "Add feature" not "Added feature"
3. **Keep subject line under 50 characters**
4. **Wrap body at 72 characters**
5. **Explain why, not what**: The code shows what changed
6. **Reference Linear issue**: Use "Closes EVE-XX" in body

## Pull Request Process

### 1. Fill Out the PR Template

Our PR template includes:
- Description of changes
- Linear issue reference
- Type of change checkboxes
- Quality gate reviews
- Testing checklist
- Documentation updates

**Complete ALL relevant sections** - don't delete template sections.

### 2. Quality Gates

Based on your changes, you may need subagent reviews:

- **security-auditor**: Auth, payments, sensitive data changes
- **code-reviewer**: Feature completion, significant changes
- **esi-integration-expert**: ESI endpoint changes
- **database-optimizer**: Schema or query changes
- **test-architect**: If test coverage < 80%
- **api-architect**: New API endpoints

See `SUBAGENTS.md` for how to invoke subagent reviews.

### 3. Code Review Process

1. **Self-review**: Review your own PR first
2. **Automated checks**: CI must pass (lint, typecheck, tests)
3. **Peer review**: At least one approving review required
4. **Address feedback**: Respond to all review comments
5. **Resolve conversations**: Mark conversations as resolved
6. **Final approval**: Maintainer approval required

### 4. Merging

- **Squash and merge** is preferred for feature branches
- **Merge commit** for special cases (preserving history)
- **Rebase and merge** for small, atomic commits

Maintainers will handle the merge after approval.

## Code Quality Standards

### TypeScript

- **Strict mode enabled**: All code must pass `tsc --noEmit`
- **No `any` types**: Use proper typing or `unknown`
- **Explicit return types**: For all functions
- **Interfaces over types**: Prefer `interface` for object shapes

### Code Style

- **ESLint**: No warnings allowed (`pnpm lint`)
- **Prettier**: Auto-formatted (`pnpm format`)
- **No console.log**: Use Pino logger
  ```typescript
  // ❌ Bad
  console.log('User logged in:', userId);

  // ✅ Good
  logger.info('User logged in', { userId });
  ```

### Error Handling

- **Custom domain errors**: Use error classes from `types/errors.ts`
  ```typescript
  // ❌ Bad
  throw new Error('User not found');

  // ✅ Good
  throw new RecordNotFoundError('User', userId);
  ```

- **Try-catch**: Wrap all async operations
  ```typescript
  try {
    const user = await getUserById(id);
    return user;
  } catch (error) {
    logger.error('Failed to get user', error, { id });
    throw new DatabaseError('User lookup failed', 'find', 'User');
  }
  ```

### Logging

Use structured logging with context:

```typescript
// ❌ Bad
logger.info('Processing payment for user 123');

// ✅ Good
logger.info('Processing payment', {
  userId,
  amount,
  currency,
  paymentId
});
```

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `auth.service.ts`)
- **Classes**: `PascalCase` (e.g., `AuthService`)
- **Functions**: `camelCase` (e.g., `getUserById`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRIES`)
- **Interfaces**: `PascalCase` with descriptive names (e.g., `UserProfile`)
- **Types**: `PascalCase` (e.g., `AuthToken`)

## Testing Requirements

### Coverage Requirements

- **Minimum coverage**: 80% for all new code
- **Critical paths**: 100% coverage (auth, payments)
- **Utilities**: High coverage (90%+)

### Test Structure

```typescript
describe('AuthService', () => {
  describe('createOrUpdateCharacter', () => {
    it('should create new character when not exists', async () => {
      // Arrange
      const userId = 'user-123';
      const characterInfo = { ... };

      // Act
      const result = await createOrUpdateCharacter(userId, characterInfo);

      // Assert
      expect(result.characterId).toBe(characterInfo.characterId);
    });

    it('should update existing character', async () => {
      // Test implementation
    });

    it('should handle encryption errors gracefully', async () => {
      // Test implementation
    });
  });
});
```

### Test Types

1. **Unit tests**: Test individual functions/methods
2. **Integration tests**: Test service interactions
3. **E2E tests**: Test complete user flows (future)

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test auth.service.test.ts

# Run in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Documentation Guidelines

### Code Comments

- **Complex logic**: Explain WHY, not what
- **Public APIs**: JSDoc comments with examples
- **TODOs**: Include Linear issue reference
  ```typescript
  // TODO(EVE-123): Implement retry logic for failed payments
  ```

### File Headers

```typescript
/**
 * Auth Service
 *
 * Handles user authentication, character management, and OAuth token operations.
 * Uses EVE SSO for authentication and stores encrypted tokens in database.
 *
 * @module services/auth
 */
```

### Function Documentation

```typescript
/**
 * Creates or updates a character record with OAuth tokens
 *
 * Uses atomic upsert to prevent race conditions during concurrent OAuth flows.
 * Tokens are encrypted using AES-256-GCM before storage.
 *
 * @param userId - The ID of the user who owns this character
 * @param characterInfo - Character data from EVE SSO
 * @param tokenData - OAuth tokens to store (will be encrypted)
 * @returns The created or updated character record
 * @throws {ConfigurationError} If ENCRYPTION_KEY is not properly configured
 * @throws {DatabaseError} If database operation fails
 */
export async function createOrUpdateCharacter(
  userId: string,
  characterInfo: CharacterInfo,
  tokenData: TokenData,
): Promise<Character> {
  // Implementation
}
```

### Update Documentation

When making changes, update:
- `README.md` - If setup process changes
- `CLAUDE.md` - If development workflow changes
- `eve-nomad-backend/SETUP.md` - If backend setup changes
- `eve-nomad-backend/TESTING.md` - If testing process changes
- API documentation - If endpoints change
- Linear issue - With implementation details

## Questions?

- Check existing documentation in `Docs/`
- Search Linear for related issues
- Ask in PR comments or issue discussions
- Contact maintainers via Linear

---

Thank you for contributing to EVE Online Tool! 🎉

Your contributions help build better tools for the EVE Online community.
