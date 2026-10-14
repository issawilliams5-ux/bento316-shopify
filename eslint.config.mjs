import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  // .claude/skills holds vendored third-party skills; the rest are local tool output.
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', '.claude/skills/**', 'brag-output*/**', '.arena/**', '.taste-skill/**'] },
  ...nextVitals,
];

export default config;
