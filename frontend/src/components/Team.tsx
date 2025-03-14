
import { motion } from "framer-motion";
import { Linkedin, Github, Twitter } from "lucide-react";

const teamMembers = [
  {
    name: "Naveen Kumar",
    role: "Fullstack Developer",
    image: "public/naveen.jpg",
    social: {
      linkedin: "#",
      github: "#",
      twitter: "#"
    }
  },
  {
    name: "Pradhun Krishna",
    role: "Web3 Developer",
    image: "public/pradhun.jpg",
    social: {
      linkedin: "#",
      github: "#",
      twitter: "#"
    }
  },
  {
    name: "Yuva Shree",
    role: "Backend Developer",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=512",
    social: {
      linkedin: "#",
      github: "#",
      twitter: "#"
    }
  },
  {
    name: "Navyavarshini",
    role: "QA Engineer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=512",
    social: {
      linkedin: "#",
      github: "#",
      twitter: "#"
    }
  }
];

const Team = () => {
  return (
    <section className="py-24 bg-dark-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-neon-purple font-medium">Our Team</span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2 mb-4 text-white">
            Meet the Innovators
          </h2>
          <p className="text-gray-400">
            Passionate experts building the future of land ownership
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative group"
            >
              <div className="relative overflow-hidden rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 p-6 text-center transition-transform duration-300 hover:scale-[1.02]">
                <div className="relative mb-4 h-32 w-32 mx-auto">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover rounded-full"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-neon-purple mb-4">{member.role}</p>
                <div className="flex justify-center space-x-4">
                  <a href={member.social.linkedin} className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin size={20} />
                  </a>
                  <a href={member.social.github} className="text-gray-400 hover:text-white transition-colors">
                    <Github size={20} />
                  </a>
                  <a href={member.social.twitter} className="text-gray-400 hover:text-white transition-colors">
                    <Twitter size={20} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
