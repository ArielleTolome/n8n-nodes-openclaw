/**
 * Basic structural tests for OpenClawTrigger node.
 */
import { OpenClawTrigger } from '../nodes/OpenClawTrigger/OpenClawTrigger.node';

describe('OpenClawTrigger node description', () => {
  let node: OpenClawTrigger;

  beforeEach(() => {
    node = new OpenClawTrigger();
  });

  it('has correct name', () => {
    expect(node.description.name).toBe('openClawTrigger');
  });

  it('has no inputs (is a trigger)', () => {
    expect(node.description.inputs).toEqual([]);
  });

  it('has one output', () => {
    expect(node.description.outputs).toHaveLength(1);
  });

  it('exposes a webhook', () => {
    expect(node.description.webhooks).toHaveLength(1);
    expect(node.description.webhooks![0].httpMethod).toBe('POST');
    expect(node.description.webhooks![0].path).toBe('openclaw');
  });

  it('has eventType, webhookNotice, verifyToken, webhookToken, includeHeaders properties', () => {
    const propNames = node.description.properties.map((p) => p.name);
    expect(propNames).toContain('eventType');
    expect(propNames).toContain('webhookNotice');
    expect(propNames).toContain('verifyToken');
    expect(propNames).toContain('webhookToken');
    expect(propNames).toContain('includeHeaders');
  });

  it('has three event type options', () => {
    const eventTypeProp = node.description.properties.find((p) => p.name === 'eventType');
    expect(eventTypeProp).toBeDefined();
    expect(eventTypeProp!.type).toBe('options');
    const opts = (eventTypeProp as { options?: unknown[] }).options;
    expect(opts).toHaveLength(3);
  });

  it('webhookToken is a password field', () => {
    const prop = node.description.properties.find((p) => p.name === 'webhookToken');
    expect(prop).toBeDefined();
    expect(prop!.type).toBe('string');
    const typeOptions = (prop as { typeOptions?: { password?: boolean } }).typeOptions;
    expect(typeOptions?.password).toBe(true);
  });

  it('webhookToken only shows when verifyToken is true', () => {
    const prop = node.description.properties.find((p) => p.name === 'webhookToken');
    expect(prop).toBeDefined();
    expect(prop!.displayOptions?.show?.verifyToken).toEqual([true]);
  });
});
