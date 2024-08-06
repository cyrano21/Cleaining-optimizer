import { Inter } from "next/font/google";
import "./globals.css";

// Configurer la police Inter
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

export const metadata = {
  title: "Hotel Cleaning Management",
  description: "Manage hotel room cleaning efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
