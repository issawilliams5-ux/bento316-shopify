import { NewPackForm } from '@/components/NewPackForm';
export const metadata = { title: 'Create new ad pack' };
export default function NewPack() {
  return <div className="max-w-3xl"><h1 className="text-3xl font-bold">Create new ad pack</h1>
    <p className="mt-2 text-slate-300">Enter details and generate a structured ecommerce creative pack.</p>
    <NewPackForm /></div>;
}
