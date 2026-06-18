'use client';
import { useAuth } from "../components/AuthProvider";
import Banner from "../components/Banner";

export default function AlphaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  return (
    <div>
      <Banner />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10%' }}>
      </div>
      <div style={{ margin: '16px 5%', width: '90%' }}>
        {children}
      </div>
    </div>
  );
}
