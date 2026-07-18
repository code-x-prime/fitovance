import { Jost, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "sonner";
import { RouteGuard } from "@/components/route-guard";
import { ClientOnly } from "@/components/client-only";
import { ScrollToTop } from "@/components/ScrollToTop";
import TawkToWidget from "@/components/TawkToWidget";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jost",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata = {
  title: "FITOVANCE - Premium Sports Nutrition & Fitness Supplements",
  description:
    "Discover premium sports nutrition products at FITOVANCE. Shop high-quality protein bars, whey protein, and pre-workout formulas. Free shipping on orders above ₹999.",
  keywords:
    "protein bars, whey protein, pre-workout, sports nutrition, fitness supplements, premium protein, fitovance",
  openGraph: {
    title: "FITOVANCE - Premium Sports Nutrition & Fitness Supplements",
    description:
      "Discover premium sports nutrition products at FITOVANCE. Shop high-quality protein bars, whey protein, and pre-workout formulas.",
    images: [
      {
        url: "/open-graph.png",
        width: 1200,
        height: 630,
        alt: "FITOVANCE Sports Nutrition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/open-graph.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${jost.variable} ${roboto.variable} font-roboto antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                <ClientOnly>
                  <RouteGuard>{children}</RouteGuard>
                </ClientOnly>
              </main>
              <Footer />
            </div>
            <Toaster position="top-center" richColors closeButton />
            <TawkToWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
