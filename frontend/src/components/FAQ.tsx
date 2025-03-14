
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "How does blockchain ensure land security?",
    answer: "Blockchain creates an immutable, distributed ledger of all land ownership records. Each transaction is cryptographically secured and can't be altered, providing tamper-proof documentation of ownership history."
  },
  {
    question: "What happens if I don't repay my P2P loan?",
    answer: "Smart contracts automatically manage loan collateral. If a loan defaults, the land NFT collateral is transferred to the lender through the escrow system, ensuring fair and transparent resolution."
  },
  {
    question: "How do I verify land ownership?",
    answer: "Land ownership can be verified instantly through our public API or blockchain explorer. Simply input the land NFT ID to view complete ownership details and history."
  },
  {
    question: "Is my Aadhaar information secure?",
    answer: "Yes, we use advanced encryption and secure storage protocols. Your Aadhaar data is only used for verification and is never stored or shared on the blockchain."
  },
  {
    question: "Can I sell my land internationally?",
    answer: "Yes, our platform supports global transactions. However, buyers must comply with local regulations and complete necessary KYC procedures."
  },
  {
    question: "What are the transaction fees?",
    answer: "Our platform charges minimal gas fees for blockchain transactions. There are no hidden charges or traditional brokerage fees, making it more cost-effective than traditional methods."
  }
];

const FAQ = () => {
  return (
    <section className="py-24 bg-dark-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-neon-purple font-medium">FAQ</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4 text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400">
            Find answers to common questions about our platform
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-dark-200 rounded-lg border border-gray-800"
              >
                <AccordionTrigger className="px-6 text-white hover:text-neon-purple hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
