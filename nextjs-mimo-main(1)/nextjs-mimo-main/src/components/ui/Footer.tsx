import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">NextMimo</h3>
            <p className="text-gray-400 text-sm">
              La plateforme d'apprentissage interactive pour maîtriser Next.js
              et le développement web moderne.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Parcours
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link
                  href="/javascript-fundamentals"
                  className="hover:text-white"
                >
                  JavaScript
                </Link>
              </li>
              <li>
                <Link href="/react-fundamentals" className="hover:text-white">
                  React
                </Link>
              </li>
              <li>
                <Link href="/learning-path" className="hover:text-white">
                  Next.js
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Ressources
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="/portfolio" className="hover:text-white">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-white">
                  Profil
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white">
                  Administration
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Légal
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link href="#" className="hover:text-white">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} NextMimo. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
