import {
  IExecuteFunctions,
  IHookFunctions,
  IWebhookFunctions,
  IDataObject,
  IHttpRequestMethods,
  IRequestOptions,
  JsonObject,
  NodeApiError,
} from 'n8n-workflow';

type OpenClawContext = IExecuteFunctions | IHookFunctions | IWebhookFunctions;

/**
 * Make an authenticated request to an OpenClaw gateway.
 */
export async function openClawApiRequest(
  this: OpenClawContext,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  qs?: IDataObject,
): Promise<unknown> {
  const credentials = await this.getCredentials('openClawApi');
  const gatewayUrl = (credentials.gatewayUrl as string).replace(/\/$/, '');
  const token = credentials.token as string;

  const options: IRequestOptions = {
    method,
    url: `${gatewayUrl}${endpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body,
    qs,
    json: true,
  };

  try {
    return await this.helpers.request(options);
  } catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}
