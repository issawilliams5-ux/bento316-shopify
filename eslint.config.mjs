import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

// eslint-config-next still ships legacy eslintrc objects, so it cannot be
// spread into a flat config directly — FlatCompat translates it.
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  // .claude/skills holds vendored third-party skills; the rest are local tool output.
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', '.claude/skills/**', 'brag-output*/**', '.arena/**', '.taste-skill/**'] },
  ...compat.extends('next/core-web-vitals'),
];

export default config;
