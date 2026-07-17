import { listSwipeItems } from '@/lib/swipe';
import { SwipeForm } from '@/components/SwipeForm';

export default async function SwipeFile() {
  const items = await listSwipeItems();
  return (
    <div>
      <h1 className="text-3xl font-bold">Swipe file</h1>
      <p className="mt-2 text-slate-300">Save competitor and inspiration links manually. No scraping. Ads marked Winner are used as style inspiration the next time you generate an ad pack.</p>
      <SwipeForm />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item, i) => (
          <article key={i} className="glass rounded-2xl p-5">
            <p className="text-sm text-electric">{item.platform} • {item.status}</p>
            <h2 className="mt-2 text-xl font-bold">{item.product}</h2>
            <p className="mt-2 text-slate-200">{item.hook}</p>
            <p className="mt-2 text-slate-400">{item.angle} — {item.notes}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
