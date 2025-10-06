// frontend/components/LandingPage.js
"use client";

import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.5,
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function LandingPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      {/* Background Image and Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: 'url("/vintage-family-bg.jpg")' }} // Your image path
        ></div>
        <div className="absolute inset-0 bg-purple-500 opacity-20"></div>
        <div className="absolute inset-0 bg-yellow-300 opacity-10"></div>
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center p-4 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="font-serif text-5xl font-bold text-purple-900 md:text-7xl"
          variants={itemVariants}
        >
          The Legacy Trunk
        </motion.h1>

        <motion.p
          className="mt-4 max-w-xl text-lg text-purple-800 md:text-xl"
          variants={itemVariants}
        >
          Preserving family stories and memories across generations. A private digital hearth where every member can safeguard their stories and heirlooms.
        </motion.p>

        <motion.p
          className="mt-2 max-w-2xl text-base italic text-gray-700 md:text-lg"
          variants={itemVariants}
        >
          For the Great Zanetti family, the circus is a hundred-year-old bond forged in sawdust and starlight. Their heritage is a tapestry of legendary acts and whispered family stories passed from grandparent to grandchild. But as the elder Zanettis take their final bow, this precious heritage is fading. Your mission, as the family's Chronicler, is to protect their shared soul.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="mt-8 flex flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0"
          variants={itemVariants}
        >
          <motion.button
            className="rounded-full bg-purple-800 px-8 py-3 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-purple-900"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Open the Trunk (Login)
          </motion.button>
          <motion.button
            className="rounded-full border-2 border-purple-800 px-8 py-3 font-semibold text-purple-800 transition-all duration-300 hover:bg-purple-800 hover:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join a Family (Sign Up)
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}