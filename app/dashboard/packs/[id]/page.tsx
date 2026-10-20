import { mockAdPack, demoInput } from '@/lib/demo';
import { AdPackSection } from '@/components/AdPackSection';
import { CopyButton } from '@/components/CopyButton';
import { SavedPack } from '@/components/SavedPack';
import { SECTIONS, sectionItems } from '@/lib/pack';

const DEMO_ID = 'demo-1';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: id === DEMO_ID ? `${demoInput.productName} ad pack (demo)` : 'Ad pack' };
}

export default async function PackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id !== DEMO_ID) return <SavedPack id={id} />;
  const pack = mockAdPack(demoInput);
  return <div className="space-y-5">
    <div className="glass rounded-2xl p-6">
      <h1 className="text-3xl font-bold">{demoInput.productName} Ad Pack</h1>
      <p className="mt-2 text-slate-300">{pack.productSummary}</p>
      <div className="mt-4"><CopyButton text={JSON.stringify(pack, null, 2)} /></div>
    </div>
    {SECTIONS.map((s) => <AdPackSection key={s.key} sectionKey={s.key} items={sectionItems(pack, s.key)} />)}
  </div>;
}
