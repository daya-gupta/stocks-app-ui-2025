import { ProtectedRoute } from "../components/ProtectedRoute";
import Header from "../components/Banner";
import MarketStatus from "../components/MarketStatus";
import AutoCompletex from "../components/AutoCompletex";

export default function AlphaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <ProtectedRoute>
      <div>
        <Header />
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 5%', gap: '16px' }}>
          <div className="text-sm text-green-600 font-medium">Alpha Access</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <AutoCompletex />
            <MarketStatus />
          </div>
        </div>
        <div style={{margin: '16px 5%', width: '90%'}}>
          {children}
        </div>
      </div>
    // </ProtectedRoute>
  );
}
