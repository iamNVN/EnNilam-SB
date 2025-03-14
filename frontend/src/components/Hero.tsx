
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dark-200">
      <div className="absolute inset-0 w-full h-full bg-dark-200 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 animate-spotlight" />
      </div>
      
      <div className="container mx-auto px-4 py-32 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-neon-purple/10 text-neon-purple font-medium text-sm mb-4">
            Empowering Land Ownership
            </span>
            <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              Revolutionizing Land Ownership with Blockchain
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Buy, Sell, and Secure Your Land with Transparency & Trust
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {/* <button 
              onClick={() => navigate('/login')}
              className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#9063c8_0%,#393BB2_50%,#9063c8_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950/40 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                Get Started
              </span>
            </button> */}
            
            <button 
              onClick={() => navigate('/marketplace')}
              className="relative inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#9063c8_0%,#393BB2_50%,#9063c8_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950/60 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                Explore Marketplace
              </span>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
