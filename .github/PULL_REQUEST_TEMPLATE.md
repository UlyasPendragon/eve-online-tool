# Pull Request

## Description
<!-- Brief description of the changes in this PR -->

## Linear Issue
<!-- Reference the Linear issue this PR addresses -->
Closes EVE-XX

## Type of Change
<!-- Mark the relevant option with an 'x' -->
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Code quality improvement

## Quality Gates
<!-- These are based on SUBAGENTS.md and DEVELOPMENT_WORKFLOW.md -->
<!-- Only check the ones that apply to your changes -->

### Required Reviews (if applicable)
- [ ] **security-auditor** - Required for auth, payments, or sensitive data changes
- [ ] **code-reviewer** - Required for feature completion or significant changes
- [ ] **esi-integration-expert** - Required for new ESI endpoints or ESI-related changes
- [ ] **database-optimizer** - Required for schema changes or query optimization
- [ ] **test-architect** - Required if test coverage < 80%
- [ ] **api-architect** - Required for new API surface or endpoint design

### Code Quality Checks
- [ ] Code follows project style guide
- [ ] Self-review completed
- [ ] No `console.log` statements (use Pino logger)
- [ ] Custom domain errors used (not generic `Error`)
- [ ] Proper error handling with try-catch where needed
- [ ] TypeScript strict mode compliance
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied

## Testing
- [ ] All existing tests pass (`pnpm test`)
- [ ] New tests added for new functionality
- [ ] Test coverage ≥ 80%
- [ ] Manual testing completed
- [ ] Edge cases considered and tested

## Testing Details
<!-- Describe how you tested these changes -->

### Test Environment
- [ ] Local development
- [ ] Docker containers (PostgreSQL + Redis running)
- [ ] Database migrations tested

### Test Scenarios
<!-- List the scenarios you tested -->
1.
2.
3.

## Documentation
- [ ] Code comments added/updated for complex logic
- [ ] README.md updated (if needed)
- [ ] CLAUDE.md updated (if needed)
- [ ] Linear issue updated with implementation details
- [ ] API documentation updated (if API changes)

## Database Changes
<!-- If this PR includes database schema changes -->
- [ ] Migration created and tested
- [ ] Rollback migration tested
- [ ] Database schema documented
- [ ] No breaking changes to existing data
- [ ] Data migration plan documented (if needed)

## Breaking Changes
<!-- If this PR includes breaking changes, describe them here -->
<!-- Explain the migration path for existing users/deployments -->

## Screenshots / Videos
<!-- If applicable, add screenshots or videos demonstrating the changes -->

## Deployment Notes
<!-- Any special deployment considerations, environment variable changes, etc. -->

## Checklist
- [ ] Commit messages follow convention (`EVE-XX: Brief description`)
- [ ] Commits reference Linear issue ID
- [ ] Branch name follows convention (`feature/eve-XX-name` or `fix/eve-XX-name`)
- [ ] No merge conflicts with target branch
- [ ] Linear issue status updated
- [ ] All conversations resolved
- [ ] Ready for review

## Additional Context
<!-- Any additional context, considerations, or notes for reviewers -->

---

**Reviewer Guidelines:**
- Verify Linear issue is properly referenced
- Check that quality gates appropriate to the changes were completed
- Ensure tests adequately cover new functionality
- Validate that error handling is robust
- Confirm logging uses structured Pino logger (not console.log)
- Check for proper use of custom domain errors
