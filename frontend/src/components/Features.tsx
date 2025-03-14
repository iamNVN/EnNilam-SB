
import { Card } from "@/components/ui/card";
import { Wallet, HandshakeIcon, Lock, Database } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Wallet className="w-8 h-8 text-neon-purple" />,
    title: "NFT Land Digitization",
    description: "Convert your land ownership into secure NFTs, linked directly with your Aadhaar card."
  },
  {
    icon: <HandshakeIcon className="w-8 h-8 text-neon-purple" />,
    title: "P2P Lending",
    description: "Access loans using your land as collateral through our secure escrow system."
  },
  {
    icon: <Lock className="w-8 h-8 text-neon-purple" />,
    title: "Secure Marketplace",
    description: "Buy, sell, and auction land NFTs in our transparent and secure marketplace."
  },
  {
    icon: <Database className="w-8 h-8 text-neon-purple" />,
    title: "Instant Verification",
    description: "Quick and reliable land ownership verification for banks and third parties."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-dark-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-neon-purple font-medium">Features</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4 text-white">
            Everything you need to manage your land digitally
          </h2>
          <p className="text-gray-400">
            EnNilam provides a comprehensive suite of tools for digital land management, from ownership verification to P2P lending.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full hover:shadow-lg hover:scale-[1.03] hover:bg-dark-100 hover:border-[#171923] transition-all duration-300 bg-dark-200 border-dark-100">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-heading text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
