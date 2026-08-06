import "./globals.css";

export const metadata = {
  title: "Flashride Logistics",
  description: "Transport express national et international",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}