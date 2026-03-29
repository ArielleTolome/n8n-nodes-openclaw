import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  IDataObject,
  JsonObject,
  NodeApiError,
  NodeOperationError,
} from 'n8n-workflow';

import { openClawApiRequest } from '../shared/GenericFunctions';

export class OpenClaw implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'OpenClaw',
    name: 'openClaw',
    icon: 'file:openclaw.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
    description: 'Interact with an OpenClaw multi-agent gateway',
    defaults: {
      name: 'OpenClaw',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'openClawApi',
        required: true,
      },
    ],
    requestDefaults: {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: [
      // Resource selector
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          { name: 'Agent', value: 'agent' },
          { name: 'Cron', value: 'cron' },
          { name: 'Session', value: 'session' },
          { name: 'Tool', value: 'tool' },
        ],
        default: 'agent',
      },

      // ─────────────────────────────────────
      // AGENT operations
      // ─────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['agent'] } },
        options: [
          {
            name: 'Wake',
            value: 'wake',
            description: 'Wake the main session with a system event',
            action: 'Wake the main session',
          },
          {
            name: 'Run Agent',
            value: 'runAgent',
            description: 'Run an isolated agent turn',
            action: 'Run an isolated agent turn',
          },
        ],
        default: 'wake',
      },
      // Wake params
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        default: '',
        required: true,
        displayOptions: { show: { resource: ['agent'], operation: ['wake'] } },
        description: 'The message or event to send to the main session',
      },
      {
        displayName: 'Session Key',
        name: 'sessionKey',
        type: 'string',
        default: 'main',
        displayOptions: { show: { resource: ['agent'], operation: ['wake'] } },
        description: 'The session key to wake (default: main)',
      },
      // Run Agent params
      {
        displayName: 'Prompt',
        name: 'prompt',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        required: true,
        displayOptions: { show: { resource: ['agent'], operation: ['runAgent'] } },
        description: 'The prompt to send to the isolated agent',
      },
      {
        displayName: 'System Prompt',
        name: 'systemPrompt',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        displayOptions: { show: { resource: ['agent'], operation: ['runAgent'] } },
        description: 'Optional system prompt for the agent',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['agent'], operation: ['runAgent'] } },
        description:
          'Model override (e.g. anthropic/claude-sonnet-4-5). Leave empty to use gateway default.',
      },

      // ─────────────────────────────────────
      // TOOL operations
      // ─────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['tool'] } },
        options: [
          {
            name: 'Invoke',
            value: 'invoke',
            description: 'Invoke any OpenClaw tool via /tools/invoke',
            action: 'Invoke a tool',
          },
        ],
        default: 'invoke',
      },
      {
        displayName: 'Tool Name',
        name: 'toolName',
        type: 'options',
        options: [
          { name: 'cron', value: 'cron' },
          { name: 'memory_search', value: 'memory_search' },
          { name: 'memory_store', value: 'memory_store' },
          { name: 'message', value: 'message' },
          { name: 'sessions_history', value: 'sessions_history' },
          { name: 'sessions_list', value: 'sessions_list' },
          { name: 'sessions_send', value: 'sessions_send' },
          { name: 'sessions_spawn', value: 'sessions_spawn' },
          { name: 'web_fetch', value: 'web_fetch' },
          { name: 'web_search', value: 'web_search' },
          { name: 'Custom', value: '__custom__' },
        ],
        default: 'message',
        required: true,
        displayOptions: { show: { resource: ['tool'], operation: ['invoke'] } },
        description: 'The tool to invoke',
      },
      {
        displayName: 'Custom Tool Name',
        name: 'customToolName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: { resource: ['tool'], operation: ['invoke'], toolName: ['__custom__'] },
        },
        description: 'Enter a custom tool name',
      },
      {
        displayName: 'Action',
        name: 'toolAction',
        type: 'string',
        default: 'json',
        displayOptions: { show: { resource: ['tool'], operation: ['invoke'] } },
        description:
          'The action to perform with the tool (e.g. send, list, add, json). Varies by tool.',
      },
      {
        displayName: 'Arguments (JSON)',
        name: 'toolArgs',
        type: 'json',
        default: '{}',
        displayOptions: { show: { resource: ['tool'], operation: ['invoke'] } },
        description: 'Arguments to pass to the tool as a JSON object',
      },
      {
        displayName: 'Session Key',
        name: 'toolSessionKey',
        type: 'string',
        default: 'main',
        displayOptions: { show: { resource: ['tool'], operation: ['invoke'] } },
        description: 'The session context for the tool invocation',
      },
      {
        displayName: 'Dry Run',
        name: 'dryRun',
        type: 'boolean',
        default: false,
        displayOptions: { show: { resource: ['tool'], operation: ['invoke'] } },
        description: 'Whether to perform a dry run without executing the action',
      },

      // ─────────────────────────────────────
      // SESSION operations
      // ─────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['session'] } },
        options: [
          {
            name: 'Get History',
            value: 'getHistory',
            description: 'Get message history of a session',
            action: 'Get session history',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List all active sessions',
            action: 'List sessions',
          },
          {
            name: 'Send Message',
            value: 'sendMessage',
            description: 'Send a message to a session',
            action: 'Send message to session',
          },
          {
            name: 'Spawn',
            value: 'spawn',
            description: 'Spawn a new sub-agent session',
            action: 'Spawn a sub-agent',
          },
        ],
        default: 'list',
      },
      // Session: List (no extra params)
      // Session: Send Message
      {
        displayName: 'Session Key',
        name: 'targetSessionKey',
        type: 'string',
        default: 'main',
        required: true,
        displayOptions: {
          show: { resource: ['session'], operation: ['sendMessage', 'getHistory'] },
        },
        description: 'The key of the session to target',
      },
      {
        displayName: 'Message',
        name: 'sessionMessage',
        type: 'string',
        typeOptions: { rows: 3 },
        default: '',
        required: true,
        displayOptions: { show: { resource: ['session'], operation: ['sendMessage'] } },
        description: 'The message to send to the session',
      },
      // Session: Get History
      {
        displayName: 'Limit',
        name: 'historyLimit',
        type: 'number',
        default: 20,
        displayOptions: { show: { resource: ['session'], operation: ['getHistory'] } },
        description: 'Maximum number of history messages to return',
      },
      // Session: Spawn
      {
        displayName: 'Task',
        name: 'spawnTask',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        required: true,
        displayOptions: { show: { resource: ['session'], operation: ['spawn'] } },
        description: 'The task description for the spawned sub-agent',
      },
      {
        displayName: 'Label',
        name: 'spawnLabel',
        type: 'string',
        default: '',
        displayOptions: { show: { resource: ['session'], operation: ['spawn'] } },
        description: 'Optional label for the spawned session',
      },

      // ─────────────────────────────────────
      // CRON operations
      // ─────────────────────────────────────
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: { show: { resource: ['cron'] } },
        options: [
          {
            name: 'Add',
            value: 'add',
            description: 'Add a new cron job',
            action: 'Add a cron job',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List all cron jobs',
            action: 'List cron jobs',
          },
          {
            name: 'Remove',
            value: 'remove',
            description: 'Remove a cron job by name',
            action: 'Remove a cron job',
          },
          {
            name: 'Run',
            value: 'run',
            description: 'Manually run a cron job immediately',
            action: 'Run a cron job now',
          },
        ],
        default: 'list',
      },
      // Cron: Add
      {
        displayName: 'Cron Name',
        name: 'cronName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
          show: { resource: ['cron'], operation: ['add', 'remove', 'run'] },
        },
        description: 'The name/identifier for the cron job',
      },
      {
        displayName: 'Schedule',
        name: 'cronSchedule',
        type: 'string',
        default: '0 * * * *',
        required: true,
        displayOptions: { show: { resource: ['cron'], operation: ['add'] } },
        description: 'Cron expression (e.g. "0 * * * *" for every hour)',
      },
      {
        displayName: 'Task / Prompt',
        name: 'cronTask',
        type: 'string',
        typeOptions: { rows: 3 },
        default: '',
        required: true,
        displayOptions: { show: { resource: ['cron'], operation: ['add'] } },
        description: 'The task or prompt to run on schedule',
      },
      {
        displayName: 'Session Key',
        name: 'cronSessionKey',
        type: 'string',
        default: 'main',
        displayOptions: { show: { resource: ['cron'], operation: ['add'] } },
        description: 'Session to run the cron task against',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter('resource', i) as string;
      const operation = this.getNodeParameter('operation', i) as string;

      try {
        let responseData: unknown;

        if (resource === 'agent') {
          if (operation === 'wake') {
            const message = this.getNodeParameter('message', i) as string;
            const sessionKey = this.getNodeParameter('sessionKey', i, 'main') as string;
            responseData = await openClawApiRequest.call(this, 'POST', '/hooks/wake', {
              message,
              sessionKey,
            });
          } else if (operation === 'runAgent') {
            const prompt = this.getNodeParameter('prompt', i) as string;
            const systemPrompt = this.getNodeParameter('systemPrompt', i, '') as string;
            const model = this.getNodeParameter('model', i, '') as string;

            const body: IDataObject = { prompt };
            if (systemPrompt) body.systemPrompt = systemPrompt;
            if (model) body.model = model;

            responseData = await openClawApiRequest.call(this, 'POST', '/hooks/agent', body);
          } else {
            throw new NodeOperationError(this.getNode(), `Unknown agent operation: ${operation}`);
          }
        } else if (resource === 'tool') {
          if (operation === 'invoke') {
            const toolName = this.getNodeParameter('toolName', i) as string;
            const customToolName = this.getNodeParameter('customToolName', i, '') as string;
            const resolvedTool = toolName === '__custom__' ? customToolName : toolName;

            if (!resolvedTool) {
              throw new NodeOperationError(this.getNode(), 'Tool name is required');
            }

            const toolAction = this.getNodeParameter('toolAction', i, 'json') as string;
            const toolArgsRaw = this.getNodeParameter('toolArgs', i, '{}') as string | object;
            const toolSessionKey = this.getNodeParameter('toolSessionKey', i, 'main') as string;
            const dryRun = this.getNodeParameter('dryRun', i, false) as boolean;

            let args: IDataObject;
            if (typeof toolArgsRaw === 'string') {
              try {
                args = JSON.parse(toolArgsRaw) as IDataObject;
              } catch {
                throw new NodeOperationError(
                  this.getNode(),
                  'Arguments must be valid JSON',
                  { itemIndex: i },
                );
              }
            } else {
              args = toolArgsRaw as IDataObject;
            }

            responseData = await openClawApiRequest.call(this, 'POST', '/tools/invoke', {
              tool: resolvedTool,
              action: toolAction,
              args,
              sessionKey: toolSessionKey,
              dryRun,
            });
          } else {
            throw new NodeOperationError(this.getNode(), `Unknown tool operation: ${operation}`);
          }
        } else if (resource === 'session') {
          if (operation === 'list') {
            responseData = await openClawApiRequest.call(this, 'POST', '/tools/invoke', {
              tool: 'sessions_list',
              action: 'json',
              args: {},
              sessionKey: 'main',
              dryRun: false,
            });
          } else if (operation === 'sendMessage') {
            const targetKey = this.getNodeParameter('targetSessionKey', i) as string;
            const msg = this.getNodeParameter('sessionMessage', i) as string;
            responseData = await openClawApiRequest.call(this, 'POST', '/tools/invoke', {
              tool: 'sessions_send',
              action: 'json',
              args: { sessionKey: targetKey, message: msg },
              sessionKey: 'main',
              dryRun: false,
            });
          } else if (operation === 'getHistory') {
            const targetKey = this.getNodeParameter('targetSessionKey', i) as string;
            const limit = this.getNodeParameter('historyLimit', i, 20) as number;
            responseData = await openClawApiRequest.call(this, 'POST', '/tools/invoke', {
              tool: 'sessions_history',
              action: 'json',
              args: { sessionKey: targetKey, limit },
              sessionKey: 'main',
              dryRun: false,
            });
          } else if (operation === 'spawn') {
            const task = this.getNodeParameter('spawnTask', i) as string;
            const label = this.getNodeParameter('spawnLabel', i, '') as string;
            const spawnArgs: IDataObject = { task };
            if (label) spawnArgs.label = label;
            responseData = await openClawApiRequest.call(this, 'POST', '/tools/invoke', {
              tool: 'sessions_spawn',
              action: 'json',
              args: spawnArgs,
              sessionKey: 'main',
              dryRun: false,
            });
          } else {
            throw new NodeOperationError(
              this.getNode(),
              `Unknown session operation: ${operation}`,
            );
          }
        } else if (resource === 'cron') {
          if (operation === 'list') {
            responseData = await openClawApiRequest.call(this, 'POST', '/tools/invoke', {
              tool: 'cron',
              action: 'list',
              args: {},
              sessionKey: 'main',
              dryRun: false,
            });
          } else if (operation === 'add') {
            const name = this.getNodeParameter('cronName', i) as string;
            const schedule = this.getNodeParameter('cronSchedule', i) as string;
            const task = this.getNodeParameter('cronTask', i) as string;
            const cronSessionKey = this.getNodeParameter('cronSessionKey', i, 'main') as string;
            responseData = await openClawApiRequest.call(this, 'POST', '/tools/invoke', {
              tool: 'cron',
              action: 'add',
              args: { name, schedule, task, sessionKey: cronSessionKey },
              sessionKey: 'main',
              dryRun: false,
            });
          } else if (operation === 'remove') {
            const name = this.getNodeParameter('cronName', i) as string;
            responseData = await openClawApiRequest.call(this, 'POST', '/tools/invoke', {
              tool: 'cron',
              action: 'remove',
              args: { name },
              sessionKey: 'main',
              dryRun: false,
            });
          } else if (operation === 'run') {
            const name = this.getNodeParameter('cronName', i) as string;
            responseData = await openClawApiRequest.call(this, 'POST', '/tools/invoke', {
              tool: 'cron',
              action: 'run',
              args: { name },
              sessionKey: 'main',
              dryRun: false,
            });
          } else {
            throw new NodeOperationError(this.getNode(), `Unknown cron operation: ${operation}`);
          }
        } else {
          throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
        }

        const executionData = this.helpers.constructExecutionMetaData(
          this.helpers.returnJsonArray(responseData as IDataObject | IDataObject[]),
          { itemData: { item: i } },
        );
        returnData.push(...executionData);
      } catch (error) {
        if (this.continueOnFail()) {
          const executionErrorData = this.helpers.constructExecutionMetaData(
            [{ json: { error: (error as Error).message } }],
            { itemData: { item: i } },
          );
          returnData.push(...executionErrorData);
          continue;
        }
        if (error instanceof NodeApiError || error instanceof NodeOperationError) {
          throw error;
        }
        throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
      }
    }

    return [returnData];
  }
}
