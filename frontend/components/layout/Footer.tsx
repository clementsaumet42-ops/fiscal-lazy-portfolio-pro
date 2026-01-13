export function Footer() {
  return (
    <footer className="bg-midnight-light border-t border-midnight-lighter mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Fiscal <span className="text-gold">Lazy Portfolio</span> Pro
            </h3>
            <p className="text-sm text-cream/70">
              Plateforme B2B pour experts-comptables français
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Ressources
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/docs" className="text-sm text-cream/70 hover:text-gold transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/api" className="text-sm text-cream/70 hover:text-gold transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">
              Légal
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="/legal" className="text-sm text-cream/70 hover:text-gold transition-colors">
                  Mentions légales
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-sm text-cream/70 hover:text-gold transition-colors">
                  Politique de confidentialité
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-midnight-lighter">
          <p className="text-xs text-cream/60 text-center">
            © {new Date().getFullYear()} Fiscal Lazy Portfolio Pro. Tous droits réservés.
          </p>
          <p className="text-xs text-cream/60 text-center mt-2">
            ⚠️ Ce logiciel est fourni à titre informatif uniquement. Consultez des experts qualifiés.
          </p>
        </div>
      </div>
    </footer>
  )
}
