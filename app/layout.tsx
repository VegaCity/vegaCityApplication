"use client";

import Providers from "@/app/Provider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseProvider } from "@/providers/FirebaseProvider";
import { QueryProvider } from "@/providers/query-provider";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "VegaCity",
//   description: "Admin dashboard",
// };

// function MainApp() {
//   const { state } = useSidebar(); // Using useSidebar

//   return (
//     <div>
//       <h1>{state}</h1>
//       <AppSidebar />
//     </div>
//   );
// }

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
        <title>Vega City</title>
      </head>
      <body
        className={inter.className}
        // style={{ height: "100%", overflowY: "auto" }} //add to prevent scrolling from Provider
      >
        <FirebaseProvider>
          <Providers>
            {/* <AppSidebar /> */}
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
