import {
  IExecuteFunctions,
  IHookFunctions,
  IWebhookFunctions,
  IDataObject,
  IHttpRequestMethods,
  IRequestOptions,
  JsonObject,
  NodeApiError,
  NodeOperationError,
  INode,
} from 'n8n-workflow';

type OpenClawContext = IExecuteFunctions | IHookFunctions | IWebhookFunctions;

/**
 * Validate that a Gateway URL is well-formed.
 */
export function validateGatewayUrl(url: string, node: INode): void {
  if (!url || url.trim() === '') {
    throw new NodeOperationError(node, 'Gateway URL cannot be empty');
  }
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new NodeOperationError(
        node,
        `Gateway URL must use http or https protocol, got: ${parsed.protocol}`,
      );
    }
  } catch (e) {
    if (e instanceof NodeOperationError) throw e;
    throw new NodeOperationError(node, `Gateway URL is invalid: ${url}`);
  }
}

/**
 * Validate that a required string parameter is non-empty.
 */
export function requireNonEmpty(value: string, fieldName: string, node: INode): void {
  if (!value || value.trim() === '') {
    throw new NodeOperationError(node, `${fieldName} cannot be empty`);
  }
}

/**
 * Parse JSON args safely, returning IDataObject.
 */
export function parseJsonArgs(raw: string | IDataObject, node: INode): IDataObject {
  if (typeof raw === 'object' && raw !== null) {
    return raw;
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new NodeOperationError(node, 'Arguments must be a JSON object (not array or primitive)');
      }
      return parsed as IDataObject;
    } catch (e) {
      if (e instanceof NodeOperationError) throw e;
      throw new NodeOperationError(node, `Arguments must be valid JSON: ${(e as Error).message}`);
    }
  }
  return {};
}

/**
 * Validate a cron expression (basic format check).
 */
export function validateCronExpression(expr: string, node: INode): void {
  if (!expr || expr.trim() === '') {
    throw new NodeOperationError(node, 'Cron schedule cannot be empty');
  }
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 5 || parts.length > 6) {
    throw new NodeOperationError(
      node,
      `Invalid cron expression "${expr}". Expected 5 or 6 space-separated fields (e.g. "0 * * * *").`,
    );
  }
}

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

  validateGatewayUrl(gatewayUrl, this.getNode());

  if (!token) {
    throw new NodeOperationError(this.getNode(), 'OpenClaw API token cannot be empty');
  }

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
    const err = error as JsonObject & { statusCode?: number; message?: string };
    // Provide actionable error messages for common HTTP status codes
    if (err.statusCode === 401) {
      throw new NodeOperationError(
        this.getNode(),
        'Authentication failed: check your OpenClaw token in the credential',
      );
    }
    if (err.statusCode === 403) {
      throw new NodeOperationError(
        this.getNode(),
        'Access forbidden: your token may lack the required permissions',
      );
    }
    if (err.statusCode === 404) {
      throw new NodeOperationError(
        this.getNode(),
        `Endpoint not found: ${endpoint}. Check your gateway URL and OpenClaw version.`,
      );
    }
    if (err.statusCode === 503 || err.statusCode === 502) {
      throw new NodeOperationError(
        this.getNode(),
        `OpenClaw gateway is unavailable (${err.statusCode}). Is it running at ${gatewayUrl}?`,
      );
    }
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}
