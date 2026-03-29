import {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
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
        displayName: 'Webhook URL Instructions',
        name: 'webhookNotice',
        type: 'notice',
        default:
          'Copy the webhook URL above and add it to your OpenClaw config under hooks.delivery.to. Set hooks.enabled = true and hooks.token in your OpenClaw config.',
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        // Webhooks in OpenClaw are configured manually by the user
        return false;
      },
      async create(this: IHookFunctions): Promise<boolean> {
        // OpenClaw webhooks are configured in the gateway config file, not via API
        // The user must copy the webhook URL and add it to their OpenClaw config
        return true;
      },
      async delete(this: IHookFunctions): Promise<boolean> {
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const eventType = this.getNodeParameter('eventType') as string;
    const bodyData = this.getBodyData() as Record<string, unknown>;

    // Filter by event type if not "any"
    if (eventType !== 'any') {
      const incomingType = (bodyData.type as string) || (bodyData.event as string) || '';

      if (eventType === 'agentCompletion' && !incomingType.includes('agent')) {
        return {
          workflowData: [[]],
        };
      }
      if (eventType === 'wake' && !incomingType.includes('wake')) {
        return {
          workflowData: [[]],
        };
      }
    }

    return {
      workflowData: [
        [
          {
            json: {
              ...bodyData,
              _receivedAt: new Date().toISOString(),
              _webhookPath: this.getNodeWebhookUrl('default'),
            },
          },
        ],
      ],
    };
  }
}
