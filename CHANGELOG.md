# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.2] — 2026-03-29

### Added
- CHANGELOG.md with full history
- CONTRIBUTING.md with dev setup, code standards, and release workflow
- Expanded README with 8 usage examples, credential table, tool reference table, and CI badge
- GitHub Actions CI (`ci.yml`): build + lint + test on Node 18/20/22, plus release version check

## [0.1.1] — 2026-03-29

### Added
- Input validation for all operations (empty string check, URL format check, JSON parse check)
- Cron expression format validation (5 or 6 fields required)
- Actionable HTTP error messages for 401, 403, 404, 502, 503 status codes
- 34 unit tests across 3 test files (GenericFunctions, OpenClaw, OpenClawTrigger)
- `parseJsonArgs()` utility for type-safe JSON arg parsing
- `validateGatewayUrl()` utility with http/https protocol enforcement

## [0.1.0] — 2026-03-29

### Added
- Initial package scaffold following n8n community node structure
- **OpenClaw** action node with four resources:
  - Agent: Wake (POST /hooks/wake), Run Agent (POST /hooks/agent)
  - Tool: Invoke (POST /tools/invoke) with 10 preset tools + custom tool support
  - Session: List, Send Message, Get History, Spawn
  - Cron: List, Add, Remove, Run
- **OpenClawTrigger** webhook node:
  - Exposes webhook URL for OpenClaw event delivery
  - Event type filtering: Any, Agent Completion, Wake Event
- **OpenClawApi** credential with gatewayUrl + Bearer token + credential test
- TypeScript strict mode configuration
- ESLint with n8n-nodes-base plugin
- README with usage examples and API reference
- MIT License
