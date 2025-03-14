
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Connect Aadhaar",
    description: "Link your Aadhaar card to verify your identity and existing land ownership."
  },
  {
    number: "02",
    title: "Digitize Land",
    description: "Convert your land documents into secure NFTs on the blockchain."
  },
  {
    number: "03",
    title: "Access Services",
    description: "Trade in the marketplace or access P2P loans using your land as collateral."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-dark-300">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-neon-purple font-medium">Process</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4 text-white">
            How EnNilam Works
          </h2>
          <p className="text-gray-400">
            Get started with EnNilam in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="p-6 bg-dark-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.03] ">
                <div className="text-4xl font-bold text-neon-purple/20 mb-4">
                  {step.number}
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2 text-white">
                  {step.title}
                </h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-neon-purple/20"></div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
