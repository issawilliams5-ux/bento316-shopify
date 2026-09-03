import './globals.css';import { GlassFilterDefs } from '@/components/GlassFilterDefs';
export const metadata = { title:'AdPilot AI', description:'Generate ecommerce ad testing packs with AI.' };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><GlassFilterDefs/>{children}</body></html>}
