"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Wrench, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const StudentPortalMaintenance = () => {
  // Animation for the main container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  // Animation for child elements
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  // Animation for the tools
  const wrenchVariants = {
    initial: { rotate: 0 },
    animate: {
      rotate: [0, 15, -15, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const,
        ease: 'easeInOut'
      }
    }
  };

  // Animation for the clock
  const clockVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop' as const
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 md:p-8 flex flex-col items-center justify-center">
      <motion.div
        className="max-w-3xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-block bg-brand-orange/20 p-4 rounded-full mb-4">
            <AlertTriangle className="h-12 w-12 text-brand-orange" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Student Portal Maintenance</h1>
          <p className="text-xl text-slate-300">We're making important improvements to enhance your learning experience</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-slate-800/50 border-slate-700 shadow-xl overflow-hidden mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <motion.div 
                  className="bg-brand-orange/10 p-4 rounded-full"
                  variants={wrenchVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Wrench className="h-12 w-12 text-brand-orange" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-white">System Upgrades in Progress</h2>
                  <p className="text-slate-300">
                    We're implementing significant improvements to the student portal, including enhanced learning resources, 
                    faster performance, and new interactive features designed to make your educational journey more effective and enjoyable.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-slate-800/50 border-slate-700 shadow-xl overflow-hidden mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <motion.div 
                  className="bg-brand-orange/10 p-4 rounded-full"
                  variants={clockVariants}
                  initial="initial"
                  animate="animate"
                >
                  <Clock className="h-12 w-12 text-brand-orange" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-white">Expected Timeline</h2>
                  <p className="text-slate-300">
                    The maintenance is scheduled to be completed by <span className="font-bold text-brand-orange">May 30, 2025</span>. 
                    We're working diligently to minimize downtime and appreciate your patience during this period.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <p className="text-slate-400 mb-6">
            For urgent inquiries during this maintenance period, please contact support@learnbridge.com.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white font-medium px-6 py-2 rounded-md inline-flex items-center gap-2"
          >
            Return to Home <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
