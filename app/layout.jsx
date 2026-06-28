import "./globals.css";

export const metadata = {
  title: "Vibe Meter",
  description:
    "Share your energy level, your forecast for the night, and how down you are to imbibe. Marin County / SF, Pride Weekend ready.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#C0362C",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
