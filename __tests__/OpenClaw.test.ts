/**
 * Structural tests for the OpenClaw action node.
 */
import { OpenClaw } from '../nodes/OpenClaw/OpenClaw.node';

describe('OpenClaw node description', () => {
  let node: OpenClaw;

  beforeEach(() => {
    node = new OpenClaw();
  });

  it('has correct name', () => {
    expect(node.description.name).toBe('openClaw');
  });

  it('has one input and one output', () => {
    expect(node.description.inputs).toHaveLength(1);
    expect(node.description.outputs).toHaveLength(1);
  });

  it('requires openClawApi credential', () => {
    expect(node.description.credentials).toHaveLength(1);
    expect(node.description.credentials![0].name).toBe('openClawApi');
    expect(node.description.credentials![0].required).toBe(true);
  });

  it('has four resources', () => {
    const resourceProp = node.description.properties.find(
      (p) => p.name === 'resource' && p.type === 'options',
    );
    expect(resourceProp).toBeDefined();
    // @ts-expect-error options exists on type options property
    const resourceValues = resourceProp!.options!.map((o: { value: string }) => o.value);
    expect(resourceValues).toContain('agent');
    expect(resourceValues).toContain('tool');
    expect(resourceValues).toContain('session');
    expect(resourceValues).toContain('cron');
  });

  it('has agent operations Wake and Run Agent', () => {
    const agentOps = node.description.properties.find(
      (p) =>
        p.name === 'operation' &&
        p.displayOptions?.show?.resource?.includes('agent'),
    );
    expect(agentOps).toBeDefined();
    // @ts-expect-error options exists
    const opValues = agentOps!.options!.map((o: { value: string }) => o.value);
    expect(opValues).toContain('wake');
    expect(opValues).toContain('runAgent');
  });

  it('has cron operations List, Add, Remove, Run', () => {
    const cronOps = node.description.properties.find(
      (p) =>
        p.name === 'operation' &&
        p.displayOptions?.show?.resource?.includes('cron'),
    );
    expect(cronOps).toBeDefined();
    // @ts-expect-error options exists
    const opValues = cronOps!.options!.map((o: { value: string }) => o.value);
    expect(opValues).toContain('list');
    expect(opValues).toContain('add');
    expect(opValues).toContain('remove');
    expect(opValues).toContain('run');
  });

  it('has session operations List, Send Message, Get History, Spawn', () => {
    const sessionOps = node.description.properties.find(
      (p) =>
        p.name === 'operation' &&
        p.displayOptions?.show?.resource?.includes('session'),
    );
    expect(sessionOps).toBeDefined();
    // @ts-expect-error options exists
    const opValues = sessionOps!.options!.map((o: { value: string }) => o.value);
    expect(opValues).toContain('list');
    expect(opValues).toContain('sendMessage');
    expect(opValues).toContain('getHistory');
    expect(opValues).toContain('spawn');
  });

  it('has tool invoke operation with preset tools', () => {
    const toolNameProp = node.description.properties.find((p) => p.name === 'toolName');
    expect(toolNameProp).toBeDefined();
    // @ts-expect-error options exists
    const toolValues = toolNameProp!.options!.map((o: { value: string }) => o.value);
    expect(toolValues).toContain('message');
    expect(toolValues).toContain('cron');
    expect(toolValues).toContain('sessions_list');
    expect(toolValues).toContain('web_search');
    expect(toolValues).toContain('__custom__');
  });
});
