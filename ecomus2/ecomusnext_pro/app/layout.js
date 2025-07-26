import "../styles/scss/main.scss";
import "photoswipe/dist/photoswipe.css";
import "rc-slider/assets/index.css";
import "../styles/css/custom-image-fixes.css";
import "../styles/css/image-fixes.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import ClientLayout from "@/components/layout/ClientLayout";
import Context from "@/context/Context";

export const metadata = {
  title: "Ecomus - E-commerce Platform",
  description: "Plateforme e-commerce moderne avec Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning={true}>
        <div className="preload preload-container" id="preloader">
          <div className="preload-logo">
            <div className="spinner"></div>
          </div>
        </div>
        <Context>
          <ClientLayout>{children}</ClientLayout>
        </Context>
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          defer
        />
      </body>
    </html>
  );
}
