# n8n-nodes-openclaw

[![npm version](https://badge.fury.io/js/n8n-nodes-openclaw.svg)](https://www.npmjs.com/package/n8n-nodes-openclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Community n8n nodes for [OpenClaw](https://github.com/openclaw/openclaw) — a multi-agent AI gateway. Connect your n8n workflows to any OpenClaw instance to send messages, run agents, invoke tools, manage cron jobs, and receive real-time events.

## Nodes

### OpenClaw (Action Node)

Interact with your OpenClaw gateway. Supports four resources:

| Resource | Operations |
|----------|-----------|
| **Agent** | Wake (send system event to main session), Run Agent (isolated agent turn) |
| **Tool** | Invoke (call any OpenClaw tool via `/tools/invoke`) |
| **Session** | List, Send Message, Get History, Spawn |
| **Cron** | List, Add, Remove, Run |

### OpenClaw Trigger (Webhook Node)

Receives events from OpenClaw. Exposes a webhook URL you configure in your OpenClaw gateway config.

Event types:
- **Any Event** — all POST payloads
- **Agent Completion** — when an agent finishes a task  
- **Wake Event** — when a wake/system event fires

## Installation

### In n8n (Community Nodes)

1. Go to **Settings → Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-openclaw`
4. Click **Install**

### Manual (npm)

```bash
npm install n8n-nodes-openclaw
```

> **Note:** `npm publish` must be run manually by the package maintainer. The package is listed on [npm](https://www.npmjs.com/package/n8n-nodes-openclaw).

## Configuration

### Credentials

Create an **OpenClaw API** credential with:

- **Gateway URL** — URL of your OpenClaw gateway (default: `http://localhost:18789`)
- **Token** — Bearer token from your OpenClaw config (`hooks.token` or `auth.token`)

### Trigger Node Setup

1. Add an **OpenClaw Trigger** node to your workflow
2. Copy the displayed **Webhook URL**
3. In your OpenClaw config, add:
   ```yaml
   hooks:
     enabled: true
     token: your-secret-token
     delivery:
       to: https://your-n8n-instance/webhook/openclaw
   ```
4. Activate the workflow

## Usage Examples

### Wake the main agent

1. Add **OpenClaw** node
2. Resource: **Agent**, Operation: **Wake**
3. Enter your message
4. Connect upstream trigger

### Invoke a tool

Resource: **Tool** → Operation: **Invoke**
- Tool: `message`
- Action: `send`
- Arguments:
  ```json
  {
    "target": "my-channel",
    "message": "Hello from n8n!"
  }
  ```

### Add a cron job

Resource: **Cron** → Operation: **Add**
- Name: `daily-report`
- Schedule: `0 9 * * *`
- Task: `Generate and send daily report to #reports`

### Spawn a sub-agent

Resource: **Session** → Operation: **Spawn**
- Task: `Research the latest AI news and summarize in 3 bullets`
- Label: `news-researcher`

## OpenClaw API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/hooks/wake` | POST | Wake main session with event |
| `/hooks/agent` | POST | Run isolated agent turn |
| `/tools/invoke` | POST | Invoke any registered tool |
| `/v1/chat/completions` | POST | OpenAI-compatible completions |

### `/tools/invoke` body

```json
{
  "tool": "tool_name",
  "action": "action_name",
  "args": {},
  "sessionKey": "main",
  "dryRun": false
}
```

## Development

```bash
git clone https://github.com/ArielleTolome/n8n-nodes-openclaw.git
cd n8n-nodes-openclaw
npm install
npm run build
npm run lint
npm test
```

## License

MIT — see [LICENSE](LICENSE)
