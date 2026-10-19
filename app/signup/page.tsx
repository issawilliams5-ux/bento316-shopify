import { AuthForm } from '@/components/AuthForm';
export const metadata = { title: 'Create account' };
export default function Signup(){return <main className="mx-auto max-w-md p-6 py-20"><h1 className="text-3xl font-bold">Create account</h1><AuthForm mode="signup"/></main>}
