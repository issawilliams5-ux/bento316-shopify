import { AuthForm } from '@/components/AuthForm';
export const metadata = { title: 'Log in' };
export default function Login(){return <main className="mx-auto max-w-md p-6 py-20"><h1 className="text-3xl font-bold">Log in</h1><AuthForm mode="login"/></main>}
