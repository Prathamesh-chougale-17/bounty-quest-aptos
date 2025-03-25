"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Code,
  Palette,
  Lightbulb,
  Rocket,
} from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  skills: string[];
}

const teamMembers: TeamMember[] = [
  {
    name: "Prathamesh Chougale",
    role: "Full Stack Developer/Web3 Developer",
    avatar: "/api/placeholder/100/100",
    bio: "Passionate about creating scalable and efficient web solutions.",
    skills: ["React", "Node.js", "GraphQL", "AWS", "Solidity", "Rust"],
  },
  {
    name: "Yash Diwan",
    role: "Full Stack Developer/Web3 Developer",
    avatar: "/api/placeholder/100/100",
    bio: "A Web3 developer building secure and user-focused blockchain solutions.",
    skills: ["React", "Node.js", "etherjs", "solidity", "rust", "docker"],
  },
];

const AboutPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const sectionVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.5 } },
  };

  const floatingIconVariants = {
    hidden: { y: 0 },
    visible: {
      y: [-10, 10, -10],
      transition: { repeat: Infinity, duration: 3 },
    },
  };

  const Section: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, icon, children }) => (
    <motion.div variants={itemVariants} className="mb-8">
      <Button
        variant="outline"
        className="w-full justify-between text-lg font-semibold py-4"
        onClick={() => setActiveSection(activeSection === title ? null : title)}
      >
        <span className="flex items-center">
          {icon}
          <span className="ml-2">{title}</span>
        </span>
        {activeSection === title ? (
          <ChevronUp size={24} />
        ) : (
          <ChevronDown size={24} />
        )}
      </Button>
      <AnimatePresence>
        {activeSection === title && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mt-4 bg-secondary p-6 rounded-lg"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className=" mx-auto px-4 py-16 relative overflow-hidden">
      <motion.div
        className="absolute inset-0 -z-10 opacity-10"
        animate={{
          backgroundImage: [
            "radial-gradient(circle at 20% 20%, #ff6b6b 0%, transparent 50%)",
            "radial-gradient(circle at 80% 80%, #4ecdc4 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, #45b7d1 0%, transparent 50%)",
            "radial-gradient(circle at 20% 20%, #ff6b6b 0%, transparent 50%)",
          ],
        }}
        transition={{ repeat: Infinity, duration: 20 }}
      />

      <motion.div
        className="relative"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1
          variants={itemVariants}
          className="text-6xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
        >
          Innovate. Create. Inspire.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl text-center mb-16 max-w-2xl mx-auto"
        >
          We are a team of visionaries, innovators, and problem-solvers
          dedicated to shaping the future of technology.
        </motion.p>

        <Section
          title="Our Expertise"
          icon={<Code size={24} className="text-primary" />}
        >
          <p className="mb-4">
            With a diverse skill set spanning full-stack development, AI,
            blockchain, and UX design, we tackle complex challenges with
            creativity and precision. Our expertise in cutting-edge
            technologies, including secure and scalable blockchain solutions,
            allows us to build efficient, user-friendly platforms that drive
            business growth and innovation.
          </p>
        </Section>

        <Section
          title="Our Approach"
          icon={<Palette size={24} className="text-primary" />}
        >
          <p className="mb-4">
            The approach involves building a decentralized platform on the Aptos
            blockchain that enables users to participate in Web3 challenges and
            earn rewards in USDC-SPL tokens. AI agents will be used for task
            allocation, submission moderation, and personalized engagement to
            ensure fairness and efficiency. Gamification elements like
            leaderboards, badges, and referral bonuses will incentivize
            participation and skill development. The platform will also utilize
            decentralized storage for submissions and integrate seamless wallet
            connections for reward distribution and user interaction.
          </p>
        </Section>

        <Section
          title="Our Vision"
          icon={<Lightbulb size={24} className="text-primary" />}
        >
          <p className="mb-4">
            The vision of this project is to create a decentralized platform on
            the Aptos blockchain that engages users in Web3-related challenges,
            incentivizing participation through rewards in USDC-SPL tokens. It
            aims to leverage AI for task allocation, moderation, and community
            engagement, ensuring fairness and scalability. By integrating
            gamification, social outreach, and collaboration, the platform seeks
            to drive mass adoption of Web3 technologies, foster skill
            development, and build a vibrant, transparent, and decentralized
            ecosystem that benefits both challenge creators and participants.
          </p>
        </Section>

        <motion.h2
          variants={itemVariants}
          className="text-4xl font-bold mb-8 text-center mt-16"
        >
          Meet Our Team
        </motion.h2>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="overflow-hidden h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <motion.div
                    className="mb-4 relative"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <motion.div
                      className="absolute -top-2 -right-2 bg-primary text-white dark:text-black rounded-full p-2"
                      variants={floatingIconVariants}
                    >
                      <Rocket size={16} />
                    </motion.div>
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-1 text-center">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    {member.role}
                  </p>
                  <p className="text-sm mb-4 flex-grow">{member.bio}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AboutPage;
