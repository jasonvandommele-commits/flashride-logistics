import "./globals.css";

export const metadata = {
  title: "Flashride Logistics | Transport & Logistique en France et Europe",
  description:
    "Flashride Logistics accompagne professionnels et particuliers pour leurs besoins de transport : transport express, tournées régulières, transport dédié, marchandises et logistique en France et en Europe.",
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