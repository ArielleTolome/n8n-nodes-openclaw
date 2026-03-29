# Contributing to n8n-nodes-openclaw

Thanks for your interest in contributing! This document covers how to set up your dev environment, the coding standards we follow, and how to submit changes.

## Prerequisites

- Node.js 18+
- npm 9+
- An OpenClaw gateway to test against (see [openclaw/openclaw](https://github.com/openclaw/openclaw))
- Git

## Setup

```bash
# Clone the repo
git clone https://github.com/ArielleTolome/n8n-nodes-openclaw.git
cd n8n-nodes-openclaw

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint
```

## Development workflow

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feat/your-feature-name`
3. **Make changes** — add tests for new functionality
4. **Build**: `npm run build` — must pass with no errors
5. **Test**: `npm test` — all tests must pass
6. **Lint**: `npm run lint` — no errors (warnings OK)
7. **Commit** with a descriptive message (see below)
8. **Push** and open a Pull Request

## Commit message format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add memory_search tool preset
fix: handle 504 gateway timeout gracefully
docs: add webhook setup example
test: add unit tests for cron validation
refactor: extract session helpers to separate file
chore: bump dependencies
```

## Code style

- TypeScript strict mode (`"strict": true`, `"noImplicitAny": true`)
- No `any` types — use proper types or `unknown` + type guards
- Prefer `IDataObject` over `Record<string, unknown>` for n8n compatibility
- Use `NodeOperationError` for user-facing validation errors
- Use `NodeApiError` for wrapping HTTP/network failures
- 100 char line width, 2-space indent, single quotes (enforced by Prettier)

## Adding new operations

1. Add the operation option to the resource's `operation` property in `OpenClaw.node.ts`
2. Add any needed parameters with `displayOptions` scoped to the new resource+operation
3. Add the execution logic in the `execute()` method
4. Add input validation using helpers from `GenericFunctions.ts`
5. Add unit tests in `__tests__/`
6. Update `CHANGELOG.md`

## Adding new tools to the Tool Invoke preset list

In `OpenClaw.node.ts`, find the `toolName` property options array and add:

```typescript
{ name: 'your_tool', value: 'your_tool' },
```

Keep the list sorted alphabetically.

## Testing against a real gateway

Set environment variables for integration testing:

```bash
export OPENCLAW_GATEWAY_URL=http://localhost:18789
export OPENCLAW_TOKEN=your-test-token
```

## Directory structure

```
n8n-nodes-openclaw/
├── __tests__/              # Unit tests (jest)
├── credentials/            # Credential definitions
│   └── OpenClawApi.credentials.ts
├── nodes/
│   ├── shared/
│   │   └── GenericFunctions.ts  # Shared utilities
│   ├── OpenClaw/
│   │   ├── OpenClaw.node.ts     # Action node
│   │   └── openclaw.svg         # Node icon
│   └── OpenClawTrigger/
│       ├── OpenClawTrigger.node.ts  # Trigger node
│       └── openclaw.svg
├── dist/                   # Compiled output (git-ignored)
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── package.json
└── tsconfig.json
```

## Releasing

Releases are automated via GitHub Actions CI on push to `main`. For manual release:

```bash
npm version patch   # or minor / major
npm run build
npm test
git add -A && git commit -m "chore: bump version"
git push
git tag -a vX.Y.Z -m "Release notes"
git push origin vX.Y.Z
gh release create vX.Y.Z --title "..." --notes "..."
npm publish   # requires npm auth
```

## Questions?

Open an issue or start a discussion on GitHub.
