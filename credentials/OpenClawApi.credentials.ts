import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class OpenClawApi implements ICredentialType {
  name = 'openClawApi';
  displayName = 'OpenClaw API';
  documentationUrl = 'https://github.com/ArielleTolome/n8n-nodes-openclaw';
  properties: INodeProperties[] = [
    {
      displayName: 'Gateway URL',
      name: 'gatewayUrl',
      type: 'string',
      default: 'http://localhost:18789',
      placeholder: 'http://localhost:18789',
      description: 'The URL of your OpenClaw gateway (e.g. http://localhost:18789)',
      required: true,
    },
    {
      displayName: 'Token',
      name: 'token',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'The Bearer token for OpenClaw gateway authentication',
      required: true,
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.token}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.gatewayUrl}}',
      url: '/tools/invoke',
      method: 'POST',
      body: {
        tool: 'sessions_list',
        action: 'json',
        args: {},
        sessionKey: 'main',
        dryRun: false,
      },
    },
  };
}
