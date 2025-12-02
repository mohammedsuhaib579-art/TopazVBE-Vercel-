import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Leftovers Business Simulation (Topaz-VBE)",
  description: "Topaz-style management simulation reimagined for Vercel."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:px-8">
          {children}
        </div>
      </body>
    </html>
  );
}


