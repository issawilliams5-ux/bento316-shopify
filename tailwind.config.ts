import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#070816', electric:'#4f8cff', violet:'#8b5cf6' }, boxShadow:{glow:'0 0 40px rgba(79,140,255,.25)'} } }, plugins: [] } satisfies Config;
