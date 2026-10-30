import type { Difficulty } from '@/types';
export const concepts: Record<string, string[]> = {
  React: ['state', 'props', 'hooks', 'render', 'memoization'],
  'Node.js': ['event loop', 'async', 'middleware', 'streams', 'error'],
  Python: ['generator', 'iterator', 'memory', 'exception', 'decorator'],
  SQL: ['index', 'join', 'transaction', 'query', 'normalization'],
  ML: ['training', 'validation', 'overfitting', 'precision', 'features'],
  DSA: ['complexity', 'hash', 'tree', 'space', 'algorithm'],
  'System Design': [
    'cache',
    'load balancer',
    'database',
    'queue',
    'replication',
  ],
};
const bank: Record<string, Record<Difficulty, string[]>> = {
  React: {
    Easy: [
      'How do props and state differ?',
      'Explain useEffect and its cleanup function.',
    ],
    Medium: [
      'How would you prevent unnecessary component renders?',
      'How do you manage shared state and asynchronous updates?',
    ],
    Hard: [
      'How would you design a concurrent rendering strategy?',
      'Explain hydration and investigate a server/client mismatch.',
    ],
  },
  'Node.js': {
    Easy: ['Explain the event loop in Node.js.', 'What is Express middleware?'],
    Medium: [
      'How do you handle errors in async request handlers?',
      'When would you use streams for processing files?',
    ],
    Hard: [
      'Design a resilient worker queue with retries.',
      'How would you diagnose event loop starvation?',
    ],
  },
  Python: {
    Easy: ['Explain lists versus generators.', 'How do you handle exceptions?'],
    Medium: [
      'Explain decorators with a practical example.',
      'How do iterators help memory efficiency?',
    ],
    Hard: [
      'How does the GIL affect CPU-bound concurrency?',
      'Design a memory-efficient pipeline for a large dataset.',
    ],
  },
  SQL: {
    Easy: [
      'Explain INNER JOIN versus LEFT JOIN.',
      'What is database normalization?',
    ],
    Medium: [
      'How does an index speed up a query?',
      'Explain transactions and isolation levels.',
    ],
    Hard: [
      'Diagnose a slow query using an execution plan.',
      'Design indexes for a high-volume multi-tenant database.',
    ],
  },
  ML: {
    Easy: [
      'What is the purpose of a validation set?',
      'Explain precision versus recall.',
    ],
    Medium: [
      'How would you detect and reduce overfitting?',
      'How do you handle imbalanced training data?',
    ],
    Hard: [
      'Design a monitoring strategy for model drift.',
      'How would you prevent leakage in a temporal dataset?',
    ],
  },
  DSA: {
    Easy: [
      'Explain the complexity of a hash table lookup.',
      'When would you use a stack instead of a queue?',
    ],
    Medium: [
      'How would you detect a cycle in a graph?',
      'Compare balanced trees and hash maps.',
    ],
    Hard: [
      'Design an efficient least-recently-used cache.',
      'Explain a dynamic programming solution to edit distance.',
    ],
  },
  'System Design': {
    Easy: ['Why do applications use a cache?', 'What does a load balancer do?'],
    Medium: [
      'Design a rate limiter for a public API.',
      'How would you choose between a queue and synchronous calls?',
    ],
    Hard: [
      'Design a distributed notification system.',
      'Explain consistency tradeoffs in a replicated database.',
    ],
  },
};
export function normalizeSkill(skill: string) {
  if (/postgres|sql/i.test(skill)) return 'SQL';
  if (/machine|ml/i.test(skill)) return 'ML';
  return (
    Object.keys(bank).find((s) => s.toLowerCase() === skill.toLowerCase()) ??
    'System Design'
  );
}
export function questionText(
  skill: string,
  difficulty: Difficulty,
  order: number,
) {
  const choices = bank[normalizeSkill(skill)][difficulty];
  return choices[order % choices.length];
}
