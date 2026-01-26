# Contributing to Flux Finances

Thank you for your interest in contributing to Flux Finances! This document provides guidelines for contributors to ensure a smooth and productive collaboration.

## Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/pablomunoz/flux-finances.git
   cd flux-finances
   ```

2. **Install dependencies**:

   ```bash
   bun install
   ```

3. **Set up environment**:
   - Copy `.env.example` to `.env` and configure your database and other settings.
   - Run database migrations: `bun db:push`

## Development

- **Start development server**: `bun dev`

- **Build the project**: `bun build`

- **Lint code**: `bun lint`

- **Format code**: `bun format`

- **Type check**: `bun typecheck`

## Code Style

- **TypeScript**: Strict mode enabled. No unused locals or parameters allowed.
- **Linting**: Follow project standards using Biome.
- **Formatting**: Handled by Biome.
- **Naming**: camelCase for variables/functions, PascalCase for components, kebab-case for files.
- **Structure**: Keep code modular. Use path aliases like `@/*` for imports.
- **Security**: Never commit secrets or keys. Avoid logging sensitive data.

## Commits

- Use descriptive, imperative messages (e.g., "Add user authentication", "Fix chart rendering bug").
- Keep commits atomic and focused on one change.
- Reference issues/PRs in commit messages if applicable.

## Pull Requests

- Create PRs from a feature branch (not main).
- Provide a clear description of changes and motivation.
- Ensure all checks pass: lint, format, type check, tests.
- Follow conventional commit prefixes in PR titles if desired (e.g., "feat:", "fix:"), though not strictly required.
- Be open to feedback and iterate as needed.

## License

By contributing, you agree to license your contributions under the MIT License. See [LICENSE](LICENSE) for details.
