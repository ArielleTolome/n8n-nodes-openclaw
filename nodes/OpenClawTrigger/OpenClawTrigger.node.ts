import {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  IWebhookResponseData,
  NodeOperationError,
} from 'n8n-workflow';

export class OpenClawTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'OpenClaw Trigger',
    name: 'openClawTrigger',
    icon: 'file:openclaw.svg',
    group: ['trigger'],
    version: 1,
    description:
      'Receive events from OpenClaw (agent completions, wake events, and system notifications)',
    defaults: {
      name: 'OpenClaw Trigger',
    },
    inputs: [],
    outputs: ['main'],
    webhooks: [
      {
        name: 'default',
        httpMethod: 'POST',
        responseMode: 'onReceived',
        path: 'openclaw',
      },
    ],
    properties: [
      {
        displayName: 'Event Type',
        name: 'eventType',
        type: 'options',
        options: [
          {
            name: 'Any Event',
            value: 'any',
            description: 'Trigger on any POST event from OpenClaw',
          },
          {
            name: 'Agent Completion',
            value: 'agentCompletion',
            description: 'Trigger when an agent finishes a task',
          },
          {
            name: 'Wake Event',
            value: 'wake',
            description: 'Trigger when a wake/system event is sent',
          },
        ],
        default: 'any',
        description: 'The type of OpenClaw event to listen for',
      },
      {
        displayName: 'Verify Webhook Token',
        name: 'verifyToken',
        type: 'boolean',
        default: true,
        description:
          'Whether to verify the Authorization Bearer token in incoming webhook requests',
      },
      {
        displayName: 'Webhook Token',
        name: 'webhookToken',
        type: 'string',
        typeOptions: { password: true },
        default: '',
        displayOptions: {
          show: { verifyToken: [true] },
        },
        description:
          'The Bearer token that OpenClaw sends in the Authorization header. Must match your OpenClaw hooks.token config.',
      },
      {
        displayName: 'Include Raw Headers',
        name: 'includeHeaders',
        type: 'boolean',
        default: false,
        description: 'Whether to include the incoming HTTP headers in the output data',
      },
      {
        displayName: 'Webhook URL Instructions',
        name: 'webhookNotice',
        type: 'notice',
        default:
          'Copy the webhook URL above and add it to your OpenClaw config under hooks.delivery.to. Set hooks.enabled = true and hooks.token to match your Webhook Token above.',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        // Webhooks in OpenClaw are configured manually by the user in the gateway config
        return false;
      },
      async create(this: IHookFunctions): Promise<boolean> {
        // No API call needed — user configures hooks.delivery.to in openclaw config
        return true;
      },
      async delete(this: IHookFunctions): Promise<boolean> {
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const eventType = this.getNodeParameter('eventType') as string;
    const verifyToken = this.getNodeParameter('verifyToken', true) as boolean;
    const includeHeaders = this.getNodeParameter('includeHeaders', false) as boolean;
    const bodyData = this.getBodyData() as Record<string, unknown>;
    const headers = this.getHeaderData() as Record<string, string>;

    // ── Token verification ──────────────────────────────────────────────
    if (verifyToken) {
      const expectedToken = this.getNodeParameter('webhookToken', '') as string;
      if (expectedToken) {
        const authHeader = headers['authorization'] ?? headers['Authorization'] ?? '';
        const incomingToken = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (incomingToken !== expectedToken) {
          throw new NodeOperationError(
            this.getNode(),
            'Webhook token verification failed: Authorization header does not match expected token',
          );
        }
      }
    }

    // ── Event type filtering ─────────────────────────────────────────────
    if (eventType !== 'any') {
      const incomingType = (bodyData.type as string) || (bodyData.event as string) || '';

      if (eventType === 'agentCompletion' && !incomingType.includes('agent')) {
        return { workflowData: [[]] };
      }
      if (eventType === 'wake' && !incomingType.includes('wake')) {
        return { workflowData: [[]] };
      }
    }

    // ── Build output ─────────────────────────────────────────────────────
    const output: IDataObject = {
      ...(bodyData as IDataObject),
      _receivedAt: new Date().toISOString(),
      _webhookPath: this.getNodeWebhookUrl('default'),
    };

    if (includeHeaders) {
      output._headers = headers as IDataObject;
    }

    return {
      workflowData: [[{ json: output }]],
    };
  }
}
