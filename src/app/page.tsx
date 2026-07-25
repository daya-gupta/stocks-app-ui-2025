'use client';
// import Image from "next/image";
import { useEffect } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/dist/client/components/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, []);
  return (
    <div className={styles.page}>
      {/* <main className={styles.main}>
        <h1>Home page</h1>
      </main> */}
    </div>
  );
}
