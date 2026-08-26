import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { FluxThemeProvider } from "@/components/flux/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flux — Financial stability for the independent workforce",
  description:
    "Flux predicts irregular income, protects your runway, and builds a safety vault so freelancers and gig workers can focus on the work — not the cash flow.",
  keywords: ["Flux", "freelance finance", "gig worker", "income forecasting", "safety vault", "AI CFO"],
  authors: [{ name: "Flux" }],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Flux — Financial stability for the independent workforce",
    description: "AI-CFO for gig workers. Forecast income, automate savings, plan breaks safely.",
    siteName: "Flux",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${fraunces.variable} antialiased`}
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <FluxThemeProvider>{children}</FluxThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
