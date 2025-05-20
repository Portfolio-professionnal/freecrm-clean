import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "@/hooks/useAuth";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: "FreeCRM - Gestion pour freelances",
  description: "Application de gestion pour freelances et micro-entrepreneurs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
          <ToastContainer position="bottom-right" autoClose={3000} />
        </AuthProvider>
      </body>
    </html>
  );
}
