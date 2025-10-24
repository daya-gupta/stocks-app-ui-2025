import Banner from "../components/Banner";
import MarketStatus from "../components/MarketStatus";
import AutoCompletex from "../components/AutoCompletex";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Banner />
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 5%', gap: '16px' }}>
        <AutoCompletex />
        <MarketStatus />
      </div>
      <div style={{margin: '16px 5%', width: '90%'}}>
        {children}
      </div>
    </div>
  );
}
