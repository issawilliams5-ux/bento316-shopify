import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

// eslint-config-next 15 is still eslintrc-format ({ extends: [...] }) and is not
// a flat-config array, so it has to come through FlatCompat under ESLint 9.
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals'),
];

export default config;
