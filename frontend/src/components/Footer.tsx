
const Footer = () => {
  return (
    <footer className="py-12 bg-dark-300 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">EnNilam</h3>
            <p className="text-gray-400 max-w-md">
              Revolutionizing land ownership through blockchain technology and smart contracts.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="/marketplace" className="text-gray-400 hover:text-white transition-colors">Marketplace</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Account</h4>
              <ul className="space-y-2">
                <li><a href="/login" className="text-gray-400 hover:text-white transition-colors">Login</a></li>
                <li><a href="/verify" className="text-gray-400 hover:text-white transition-colors">Verify Land</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EnNilam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
