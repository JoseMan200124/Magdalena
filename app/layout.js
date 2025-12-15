import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "Magdalena | Portal",
  description: "Login + Reporte + Admin de usuarios",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
