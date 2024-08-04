/* eslint-disable react/prop-types */
import "./globals.css";

export const metadata = {
  title: "Hotel Cleaning Management",
  description: "Manage hotel room cleaning efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}