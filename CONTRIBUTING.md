# Contributing to Flux Finances

Thank you for your interest in contributing to Flux Finances! This document provides guidelines for contributors to ensure a smooth and productive collaboration.

## Getting Started

1. **Clone the repository**:

   ```bash
   git clone https://github.com/pablomunoz/flux-finances.git
   cd flux-finances
   ```

2. **Install dependencies**:
   - We recommend using Bun for the best experience, but pnpm works too.

   ```bash
   bun install
   # or
   pnpm install
   ```

3. **Set up environment**:
   - Copy `.env.example` to `.env` and configure your database and other settings.
   - Run database migrations: `bunx drizzle-kit push`

## Development

- **Start development servers**:
  - Main app: `pnpm dev:app` or `bun dev`
  - Marketing site: `pnpm dev:marketing`

- **Build the project**: `pnpm build`

- **Run tests**: `pnpm test`

- **Lint code**: `pnpm lint`

- **Format code**: `pnpm format`

- **Type check**: `pnpm check`

Use Turbo for efficient monorepo operations.

## Code Style

- **TypeScript**: Strict mode enabled. No unused locals or parameters allowed.
- **Linting**: Follow TanStack ESLint config (import/order is disabled; use import-sorting plugin instead).
- **Formatting**: Use Prettier with plugins for sort-imports, Astro, and Tailwind CSS.
- **Naming**: camelCase for variables/functions, PascalCase for components, kebab-case for files.
- **Structure**: Keep code modular. Use path aliases like `@flux/ui/*` for imports.
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

By contributing, you agree to license your contributions under the O'Saasy License. See [LICENSE](LICENSE) for details.
