import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  // .claude/skills and its Codex mirror .agents/skills hold vendored third-party skills; the rest are local tool output.
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', '.claude/skills/**', '.agents/skills/**', 'brag-output*/**', '.arena/**', '.taste-skill/**', 'film/**'] },
  ...nextVitals,
];

export default config;
