---
trigger: always_on
---

# Billio - Commit Convention Rules

## Commit Message Format

All commit messages should follow this format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries
- **ci**: Changes to CI configuration files and scripts

## Scope

The scope should specify the place of the commit change, such as:
- auth
- invoices
- customers
- settings
- exchange-rates
- ui
- db
- roles

## Subject

- Use imperative, present tense (e.g., "change" not "changed" or "changes")
- Don't capitalize the first letter
- No period (.) at the end
- Keep it under 72 characters

## Body

- Use imperative, present tense
- Include motivation for the change and contrast with previous behavior
- Wrap text at 72 characters

## Footer

- Reference issues and pull requests that the commit addresses
- Format: Closes #123, Fixes #456
- Include breaking changes with "BREAKING CHANGE:" prefix

## Examples

```
feat(invoices): add currency exchange rate input field

Add conditional input field for exchange rate that appears only for non-EUR currencies.
The field includes automatic fetching from backend API with proper loading indicators.

Closes #324
```

```
fix(auth): resolve infinite recursion in role checking functions

Modified the is_admin and get_user_role functions to avoid circular dependencies
when checking user permissions, fixing performance issues in the admin dashboard.

Fixes #421
```

```
docs(readme): update role-based access control documentation

Update the README with comprehensive explanation of the new role system
including ADMIN and USER permissions for each database table.
```
