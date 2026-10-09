import { mockAdPack, demoInput } from '@/lib/demo';import { AdPackView } from '@/components/AdPackView';
export default async function PackPage(){return <AdPackView pack={mockAdPack(demoInput)} title={`${demoInput.productName} Ad Pack`}/>}
