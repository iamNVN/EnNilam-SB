
import { motion } from "framer-motion";
import { Shield, Zap, Globe, DollarSign, History, Lock } from "lucide-react";

const benefits = [
  {
    icon: <Shield className="w-8 h-8 text-neon-purple" />,
    title: "Fraud Prevention",
    description: "Immutable blockchain records ensure land ownership can't be tampered with."
  },
  {
    icon: <Zap className="w-8 h-8 text-neon-purple" />,
    title: "Instant Verification",
    description: "Public API allows banks and institutions to verify land ownership without paperwork."
  },
  {
    icon: <Globe className="w-8 h-8 text-neon-purple" />,
    title: "Global Accessibility",
    description: "Decentralized marketplace allows users to buy and sell from anywhere."
  },
  {
    icon: <DollarSign className="w-8 h-8 text-neon-purple" />,
    title: "No Middlemen",
    description: "Direct transactions reduce brokerage costs and legal fees."
  },
  {
    icon: <History className="w-8 h-8 text-neon-purple" />,
    title: "Ownership History",
    description: "View complete past ownership records of any land NFT."
  },
  {
    icon: <Lock className="w-8 h-8 text-neon-purple" />,
    title: "Privacy & Security",
    description: "Aadhaar-linked authentication ensures only rightful owners can manage land assets."
  }
];

const Benefits = () => {
  return (
    <section className="py-24 bg-dark-200">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-neon-purple font-medium">Benefits</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4 text-white">
            Why Choose EnNilam
          </h2>
          <p className="text-gray-400">
            Experience the future of land ownership with our blockchain-powered platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-lg bg-dark-100 border border-gray-800 hover:border-neon-purple transition-colors duration-300"
            >
              <div className="mb-4">{benefit.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-400">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
