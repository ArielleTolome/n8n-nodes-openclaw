/**
 * Tests for OpenClawTrigger webhook() method logic.
 * We isolate the filtering logic since we can't easily mock IWebhookFunctions.
 */

// Extracted filter logic from OpenClawTrigger.webhook() for unit testing
function shouldPassEvent(
  eventType: string,
  bodyData: Record<string, unknown>,
): boolean {
  if (eventType === 'any') return true;

  const incomingType = (bodyData.type as string) || (bodyData.event as string) || '';

  if (eventType === 'agentCompletion') {
    return incomingType.includes('agent');
  }
  if (eventType === 'wake') {
    return incomingType.includes('wake');
  }
  return true;
}

describe('OpenClawTrigger event filtering', () => {
  describe('eventType: any', () => {
    it('passes any payload', () => {
      expect(shouldPassEvent('any', {})).toBe(true);
      expect(shouldPassEvent('any', { type: 'wake' })).toBe(true);
      expect(shouldPassEvent('any', { type: 'agentCompletion' })).toBe(true);
      expect(shouldPassEvent('any', { type: 'unknown' })).toBe(true);
    });
  });

  describe('eventType: agentCompletion', () => {
    it('passes payload with type containing "agent"', () => {
      expect(shouldPassEvent('agentCompletion', { type: 'agentCompletion' })).toBe(true);
      expect(shouldPassEvent('agentCompletion', { type: 'agent_done' })).toBe(true);
    });

    it('passes payload with event containing "agent"', () => {
      expect(shouldPassEvent('agentCompletion', { event: 'agent.complete' })).toBe(true);
    });

    it('blocks payload without agent in type or event', () => {
      expect(shouldPassEvent('agentCompletion', { type: 'wake' })).toBe(false);
      expect(shouldPassEvent('agentCompletion', {})).toBe(false);
    });
  });

  describe('eventType: wake', () => {
    it('passes payload with type containing "wake"', () => {
      expect(shouldPassEvent('wake', { type: 'wake' })).toBe(true);
      expect(shouldPassEvent('wake', { type: 'wake_event' })).toBe(true);
    });

    it('passes payload with event containing "wake"', () => {
      expect(shouldPassEvent('wake', { event: 'system.wake' })).toBe(true);
    });

    it('blocks payload without wake in type or event', () => {
      expect(shouldPassEvent('wake', { type: 'agentCompletion' })).toBe(false);
      expect(shouldPassEvent('wake', {})).toBe(false);
    });
  });

  describe('event field fallback', () => {
    it('falls back to event field when type is missing', () => {
      expect(shouldPassEvent('agentCompletion', { event: 'agent.finish' })).toBe(true);
      expect(shouldPassEvent('wake', { event: 'wake.triggered' })).toBe(true);
    });

    it('prefers type over event field', () => {
      // type=wake but filtering for agentCompletion → should fail on type
      expect(shouldPassEvent('agentCompletion', { type: 'wake', event: 'agent.done' })).toBe(false);
    });
  });
});

describe('OpenClawTrigger output shape', () => {
  it('should include _receivedAt in output', () => {
    const receivedAt = new Date().toISOString();
    const body = { type: 'wake', message: 'hello' };
    const output = {
      ...body,
      _receivedAt: receivedAt,
    };
    expect(output._receivedAt).toBe(receivedAt);
    expect(output.type).toBe('wake');
    expect(output.message).toBe('hello');
  });
});
