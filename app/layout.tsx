import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Providers from "@/app/Provider";
import { QueryProvider } from "@/providers/query-provider";
import { FirebaseProvider } from "@/providers/FirebaseProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VegaCity",
  description: "Admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vegacity Web</title>
      </head>
      <body
        className={inter.className}
        // style={{ height: "100%", overflowY: "auto" }} //add to prevent scrolling from Provider
      >
        <FirebaseProvider>
          <Providers>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={true}
              storageKey="dashboard-theme"
            >
              <QueryProvider>{children}</QueryProvider>
              <Toaster />
            </ThemeProvider>
          </Providers>
        </FirebaseProvider>
      </body>
    </html>
  );
}
