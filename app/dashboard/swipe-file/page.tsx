import { SwipeFile } from '@/components/SwipeFile';
export const metadata = { title: 'Swipe file' };
export default function SwipeFilePage() {
  return <div><h1 className="text-3xl font-bold">Swipe file</h1>
    <p className="mt-2 text-slate-300">Save competitor and inspiration links manually. No scraping.</p>
    <SwipeFile /></div>;
}
