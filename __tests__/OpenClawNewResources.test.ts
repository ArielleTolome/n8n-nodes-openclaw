/**
 * Tests for new resources: Chat Completion and Memory.
 */
import { OpenClaw } from '../nodes/OpenClaw/OpenClaw.node';

describe('OpenClaw — Chat Completion resource', () => {
  let node: OpenClaw;

  beforeEach(() => {
    node = new OpenClaw();
  });

  it('has Chat Completion in resource list', () => {
    const resourceProp = node.description.properties.find(
      (p) => p.name === 'resource' && p.type === 'options',
    );
    const options = (resourceProp as { options?: Array<{ value: string }> }).options ?? [];
    const values = options.map((o) => o.value);
    expect(values).toContain('chat');
  });

  it('has Complete operation for chat resource', () => {
    const chatOps = node.description.properties.find(
      (p) =>
        p.name === 'operation' &&
        p.displayOptions?.show?.resource?.includes('chat'),
    );
    expect(chatOps).toBeDefined();
    const ops = (chatOps as { options?: Array<{ value: string }> }).options ?? [];
    expect(ops.map((o) => o.value)).toContain('complete');
  });

  it('has chatMessages parameter for chat/complete', () => {
    const prop = node.description.properties.find((p) => p.name === 'chatMessages');
    expect(prop).toBeDefined();
    expect(prop!.type).toBe('json');
    expect(prop!.required).toBe(true);
  });

  it('has chatModel, chatMaxTokens, chatTemperature, chatStream parameters', () => {
    const propNames = node.description.properties.map((p) => p.name);
    expect(propNames).toContain('chatModel');
    expect(propNames).toContain('chatMaxTokens');
    expect(propNames).toContain('chatTemperature');
    expect(propNames).toContain('chatStream');
  });

  it('chatTemperature has min 0 and max 2', () => {
    const prop = node.description.properties.find((p) => p.name === 'chatTemperature');
    expect(prop).toBeDefined();
    const typeOptions = (prop as { typeOptions?: { minValue?: number; maxValue?: number } }).typeOptions;
    expect(typeOptions?.minValue).toBe(0);
    expect(typeOptions?.maxValue).toBe(2);
  });
});

describe('OpenClaw — Memory resource', () => {
  let node: OpenClaw;

  beforeEach(() => {
    node = new OpenClaw();
  });

  it('has Memory in resource list', () => {
    const resourceProp = node.description.properties.find(
      (p) => p.name === 'resource' && p.type === 'options',
    );
    const options = (resourceProp as { options?: Array<{ value: string }> }).options ?? [];
    const values = options.map((o) => o.value);
    expect(values).toContain('memory');
  });

  it('has Search and Store operations for memory resource', () => {
    const memOps = node.description.properties.find(
      (p) =>
        p.name === 'operation' &&
        p.displayOptions?.show?.resource?.includes('memory'),
    );
    expect(memOps).toBeDefined();
    const ops = (memOps as { options?: Array<{ value: string }> }).options ?? [];
    const values = ops.map((o) => o.value);
    expect(values).toContain('search');
    expect(values).toContain('store');
  });

  it('has memoryQuery parameter for search operation', () => {
    const prop = node.description.properties.find((p) => p.name === 'memoryQuery');
    expect(prop).toBeDefined();
    expect(prop!.required).toBe(true);
  });

  it('has memoryText parameter for store operation', () => {
    const prop = node.description.properties.find((p) => p.name === 'memoryText');
    expect(prop).toBeDefined();
    expect(prop!.required).toBe(true);
    expect(prop!.type).toBe('string');
  });

  it('has memoryUserId parameter for store (optional)', () => {
    const prop = node.description.properties.find((p) => p.name === 'memoryUserId');
    expect(prop).toBeDefined();
    expect(prop!.required).toBeFalsy();
  });

  it('has memoryLimit parameter for search', () => {
    const prop = node.description.properties.find((p) => p.name === 'memoryLimit');
    expect(prop).toBeDefined();
    expect(prop!.type).toBe('number');
  });
});

describe('OpenClaw — total resource count', () => {
  it('has 6 resources', () => {
    const node = new OpenClaw();
    const resourceProp = node.description.properties.find(
      (p) => p.name === 'resource' && p.type === 'options',
    );
    const options = (resourceProp as { options?: unknown[] }).options ?? [];
    // Agent, Chat Completion, Cron, Memory, Session, Tool
    expect(options.length).toBe(6);
  });

  it('has usableAsTool set to true', () => {
    const node = new OpenClaw();
    expect(node.description.usableAsTool).toBe(true);
  });
});
