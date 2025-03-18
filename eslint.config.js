import { base, node, react, typescript, vitest } from '@faergeek/eslint-config';

export default [
  { ignores: ['dist/', '/src/routeTree.gen.ts'] },
  ...base,
  ...node.map(config => ({
    ...config,
    files: ['*.js'],
  })),
  ...react.map(config => ({
    ...config,
    files: ['src/**/*'],
    settings: {
      linkComponents: [
        { name: 'Button', linkAttribute: ['href', 'to'] },
        { name: 'Link', linkAttribute: 'to' },
      ],
    },
  })),
  ...typescript,
  ...vitest.map(config => ({
    ...config,
    files: ['**/*.spec.*'],
  })),
];
