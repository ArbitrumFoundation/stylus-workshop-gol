import { describe, expect, it } from 'vitest';
import { wagmiConfig } from './wagmi';
import { localhost } from '../constants';

describe('wagmiConfig', () => {
  it('targets the local Nitro chain (412346)', () => {
    expect(wagmiConfig.chains.map((c) => c.id)).toEqual([localhost.id]);
    expect(localhost.id).toBe(412346);
  });

  it('registers an injected connector', () => {
    const types = wagmiConfig.connectors.map((c) => c.type);
    expect(types).toContain('injected');
  });

  it('has an HTTP transport for the local chain', () => {
    // _transports is the raw map keyed by chain id; we just check
    // there is one entry under the expected id.
    expect(wagmiConfig._internal.transports[localhost.id]).toBeDefined();
  });
});
