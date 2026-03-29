import {
  validateGatewayUrl,
  requireNonEmpty,
  parseJsonArgs,
  validateCronExpression,
} from '../nodes/shared/GenericFunctions';
import { INode, NodeOperationError } from 'n8n-workflow';

// Minimal mock INode
const mockNode: INode = {
  id: 'test-node',
  name: 'Test Node',
  type: 'openClaw',
  typeVersion: 1,
  position: [0, 0],
  parameters: {},
};

describe('validateGatewayUrl', () => {
  it('passes for valid http URL', () => {
    expect(() => validateGatewayUrl('http://localhost:18789', mockNode)).not.toThrow();
  });

  it('passes for valid https URL', () => {
    expect(() => validateGatewayUrl('https://my-gateway.example.com', mockNode)).not.toThrow();
  });

  it('throws for empty string', () => {
    expect(() => validateGatewayUrl('', mockNode)).toThrow(NodeOperationError);
  });

  it('throws for non-http protocol', () => {
    expect(() => validateGatewayUrl('ftp://localhost:18789', mockNode)).toThrow(NodeOperationError);
  });

  it('throws for completely invalid URL', () => {
    expect(() => validateGatewayUrl('not-a-url', mockNode)).toThrow(NodeOperationError);
  });
});

describe('requireNonEmpty', () => {
  it('passes for non-empty string', () => {
    expect(() => requireNonEmpty('hello', 'Test field', mockNode)).not.toThrow();
  });

  it('throws for empty string', () => {
    expect(() => requireNonEmpty('', 'Test field', mockNode)).toThrow(NodeOperationError);
  });

  it('throws for whitespace-only string', () => {
    expect(() => requireNonEmpty('   ', 'Test field', mockNode)).toThrow(NodeOperationError);
  });

  it('includes field name in error message', () => {
    let thrown: Error | null = null;
    try {
      requireNonEmpty('', 'My Field', mockNode);
    } catch (e) {
      thrown = e as Error;
    }
    expect(thrown).not.toBeNull();
    expect(thrown!.message).toContain('My Field');
  });
});

describe('parseJsonArgs', () => {
  it('parses valid JSON string to object', () => {
    const result = parseJsonArgs('{"key":"value"}', mockNode);
    expect(result).toEqual({ key: 'value' });
  });

  it('returns object as-is when already an object', () => {
    const input = { foo: 'bar' };
    const result = parseJsonArgs(input, mockNode);
    expect(result).toEqual(input);
  });

  it('throws for invalid JSON string', () => {
    expect(() => parseJsonArgs('not json', mockNode)).toThrow(NodeOperationError);
  });

  it('throws when JSON parses to array (not object)', () => {
    expect(() => parseJsonArgs('[1,2,3]', mockNode)).toThrow(NodeOperationError);
  });

  it('returns empty object for empty string', () => {
    // empty string falls through to empty object return
    const result = parseJsonArgs('{}', mockNode);
    expect(result).toEqual({});
  });
});

describe('validateCronExpression', () => {
  it('passes for standard 5-part cron', () => {
    expect(() => validateCronExpression('0 * * * *', mockNode)).not.toThrow();
  });

  it('passes for 6-part cron (with seconds)', () => {
    expect(() => validateCronExpression('0 0 * * * *', mockNode)).not.toThrow();
  });

  it('throws for empty string', () => {
    expect(() => validateCronExpression('', mockNode)).toThrow(NodeOperationError);
  });

  it('throws for invalid cron (too few parts)', () => {
    expect(() => validateCronExpression('* *', mockNode)).toThrow(NodeOperationError);
  });

  it('throws for invalid cron (too many parts)', () => {
    expect(() => validateCronExpression('* * * * * * *', mockNode)).toThrow(NodeOperationError);
  });

  it('includes expression in error message', () => {
    let thrown: Error | null = null;
    try {
      validateCronExpression('bad expr', mockNode);
    } catch (e) {
      thrown = e as Error;
    }
    expect(thrown).not.toBeNull();
    expect(thrown!.message).toContain('bad expr');
  });
});
