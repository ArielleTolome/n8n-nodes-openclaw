# n8n-nodes-clawai

[![npm version](https://badge.fury.io/js/n8n-nodes-clawai.svg)](https://www.npmjs.com/package/n8n-nodes-clawai)
[![CI](https://github.com/ArielleTolome/n8n-nodes-clawai/actions/workflows/ci.yml/badge.svg)](https://github.com/ArielleTolome/n8n-nodes-clawai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Community n8n nodes for [OpenClaw](https://github.com/openclaw/openclaw) — a multi-agent AI gateway. Connect your n8n workflows to any OpenClaw instance to send messages, run agents, invoke tools, manage cron jobs, and receive real-time events.

## Contents

- [Installation](#installation)
- [Nodes](#nodes)
  - [OpenClaw (Action Node)](#openclaw-action-node)
  - [OpenClaw Trigger](#openclaw-trigger-webhook-node)
- [Credentials](#credentials)
- [Usage Examples](#usage-examples)
- [OpenClaw API Reference](#openclaw-api-reference)
- [Development](#development)

---

## Installation

### Via n8n Community Nodes (recommended)

1. In n8n, go to **Settings → Community Nodes**
2. Click **Install a community node**
3. Enter `n8n-nodes-clawai`
4. Click **Install**

### Manual (npm)

```bash
npm install n8n-nodes-clawai
```

> **Publishing:** Run `npm publish` manually after authenticating with npm. The package is available on [npmjs.com](https://www.npmjs.com/package/n8n-nodes-clawai).

---

## Nodes

### OpenClaw (Action Node)

Interact with your OpenClaw gateway. Supports six resources:

| Resource | Operations |
|----------|-----------|
| **Agent** | Wake, Run Agent |
| **Chat Completion** | Complete (OpenAI-compatible) |
| **Cron** | List, Add, Update, Remove, Run |
| **Memory** | Search, Store |
| **Session** | List, Send Message, Get History, Spawn |
| **Tool** | Invoke (10 preset tools + custom) |

> The node is marked `usableAsTool: true` — it can be used directly as a tool inside an n8n AI Agent node.

### OpenClaw Trigger (Webhook Node)

Receives events from OpenClaw. Exposes a webhook URL you paste into your OpenClaw gateway config.

| Event Type | Description |
|-----------|-------------|
| Any Event | All POST payloads |
| Agent Completion | When an agent finishes a task |
| Wake Event | When a wake/system event fires |

**Security features:**
- Optional webhook token verification (checks `Authorization: Bearer <token>`)
- Optional raw header passthrough for custom validation

---

## Credentials

Create an **OpenClaw API** credential:

| Field | Description | Default |
|-------|-------------|---------|
| Gateway URL | URL of your OpenClaw gateway | `http://localhost:18789` |
| Token | Bearer token for authentication | — |

The token comes from your OpenClaw config (`hooks.token` or your gateway auth config).

---

## Usage Examples

### 1. Wake the main agent with a message

**Workflow:** HTTP Request → OpenClaw

**Node settings:**
- Resource: `Agent`
- Operation: `Wake`
- Message: `{{ $json.body.text }}`
- Session Key: `main`

This is useful for triggering the main OpenClaw session from an external event (e.g. a form submission, Slack message, etc.).

---

### 2. Run an isolated agent turn

**Node settings:**
- Resource: `Agent`
- Operation: `Run Agent`
- Prompt: `Summarize the following and return JSON: {{ $json.content }}`
- System Prompt: `You are a JSON extraction expert. Return only valid JSON.`
- Model: `anthropic/claude-sonnet-4-5` _(leave empty for gateway default)_

The agent runs in isolation — it doesn't affect main session history.

---

### 3. Send a message to a Discord channel via OpenClaw

**Node settings:**
- Resource: `Tool`
- Operation: `Invoke`
- Tool: `message`
- Action: `send`
- Arguments:
  ```json
  {
    "target": "my-channel",
    "message": "Alert: {{ $json.alert_text }}"
  }
  ```

---

### 4. Add a daily cron job

**Node settings:**
- Resource: `Cron`
- Operation: `Add`
- Cron Name: `daily-report`
- Schedule: `0 9 * * *`
- Task: `Generate and send a daily summary report to #reports`
- Session Key: `main`

---

### 5. Spawn a sub-agent and get its session key

**Node settings:**
- Resource: `Session`
- Operation: `Spawn`
- Task: `Research the top 3 AI news stories this week and return as JSON array`
- Label: `news-researcher`

The response contains the spawned session's key, which you can use to poll for completion.

---

### 6. Get session history

**Node settings:**
- Resource: `Session`
- Operation: `Get History`
- Session Key: `main`
- Limit: `50`

Returns the last N messages from the specified session.

---

### 7. Receive an agent completion event (trigger)

1. Add an **OpenClaw Trigger** node
2. Set Event Type: `Agent Completion`
3. Activate the workflow — copy the displayed webhook URL
4. In your OpenClaw gateway config:
   ```yaml
   hooks:
     enabled: true
     token: your-secret-token
     delivery:
       to: https://your-n8n-instance/webhook/openclaw
   ```

When an agent finishes, the payload is delivered to n8n and your downstream nodes run.

**Trigger output data:**
```json
{
  "type": "agentCompletion",
  "sessionKey": "subagent:...",
  "result": "...",
  "completedAt": "2026-03-29T12:00:00.000Z",
  "_receivedAt": "2026-03-29T12:00:01.234Z"
}
```

---

### 8. Search the web via OpenClaw

**Node settings:**
- Resource: `Tool`
- Operation: `Invoke`
- Tool: `web_search`
- Action: `json`
- Arguments:
  ```json
  { "query": "{{ $json.search_term }}" }
  ```

---

## OpenClaw API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/hooks/wake` | POST | Wake main session with system event |
| `/hooks/agent` | POST | Run an isolated agent turn |
| `/tools/invoke` | POST | Invoke any registered OpenClaw tool |
| `/v1/chat/completions` | POST | OpenAI-compatible completions |

### `/tools/invoke` body schema

```json
{
  "tool": "string",
  "action": "string",
  "args": {},
  "sessionKey": "main",
  "dryRun": false
}
```

### Available tools (preset list)

| Tool | Common actions |
|------|---------------|
| `message` | `send` |
| `cron` | `list`, `add`, `update`, `remove`, `run` |
| `sessions_list` | `json` |
| `sessions_send` | `json` |
| `sessions_history` | `json` |
| `sessions_spawn` | `json` |
| `memory_store` | `json` |
| `memory_search` | `json` |
| `web_search` | `json` |
| `web_fetch` | `json` |

Use the `Custom` option in the Tool dropdown for any other registered tool.

---

## Development

```bash
git clone https://github.com/ArielleTolome/n8n-nodes-clawai.git
cd n8n-nodes-openclaw
npm install
npm run build    # compile TypeScript
npm run lint     # ESLint check
npm test         # run 34 unit tests
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development guide.

---

## License

MIT — see [LICENSE](LICENSE)
