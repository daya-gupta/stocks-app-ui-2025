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
      <div>
        {children}
      </div>
    </div>
  );
}
