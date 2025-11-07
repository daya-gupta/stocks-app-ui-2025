// import { ProtectedRoute } from "../components/ProtectedRoute";
import Header from "../components/Banner";
import MarketStatus from "../components/MarketStatus";

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
          {/* <div className="flex text-sm font-medium">
            <div>Logged in menu</div>
            <Link className="ml-8" href="/alpha/watchlist">Watchlist</Link>
            <Link className="ml-8" href="/alpha/portfolio">Portfolio</Link>
            <Link className="ml-8" href="/alpha/insights">Insights</Link>
          </div> */}
          {/* <div style={{ display: 'flex', gap: '16px' }}>
            <MarketStatus />
          </div> */}
        </div>
        <div style={{margin: '16px 5%', width: '90%'}}>
          {children}
        </div>
      </div>
    // </ProtectedRoute>
  );
}
