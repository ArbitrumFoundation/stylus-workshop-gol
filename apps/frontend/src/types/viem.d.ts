// Tell TypeScript that our ABI JSON files satisfy viem's `Abi` type.
// Without this, `import abi from '../abi/Foo.json'` yields the inferred
// shape (string instead of "function" literal) which wagmi/viem reject.
declare module '*.json' {
  import type { Abi } from 'viem';
  const value: Abi;
  export default value;
}
