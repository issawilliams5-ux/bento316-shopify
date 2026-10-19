// page.tsx is a client component and cannot export metadata, so the title lives here.
export const metadata = { title: 'Legal assistant' };
export default function LegalLayout({ children }: { children: React.ReactNode }) { return children; }
