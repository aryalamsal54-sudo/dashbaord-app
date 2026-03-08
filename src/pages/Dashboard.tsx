import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Image, MessageSquare } from 'lucide-react';
import AIModelSelector from '../components/ai/AIModelSelector';
import AISettingsPanel from '../components/ai/AISettingsPanel';
import ImageGeneratorPanel from '../components/ai/ImageGeneratorPanel';
import AIChatDrawer from '../components/ai/AIChatDrawer';
import ThemeToggle from '../components/ThemeToggle';
import TrackingHub from '../components/TrackingHub';

export default function Dashboard() {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [showImageGen, setShowImageGen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const openImageGen = (subject: string) => {
    setActiveSubject(subject);
    setShowImageGen(true);
  };

  const openChat = (subject: string) => {
    setActiveSubject(subject);
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-indigo-500/30 transition-colors duration-300">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-50 dark:opacity-100">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      {/* Global AI Controls */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        <ThemeToggle />
        <AIModelSelector />
        <AISettingsPanel />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-24 pb-12 md:py-24">
        {/* Header */}
        <header className="text-center mb-16 md:mb-20">
          <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[var(--text-tertiary)] mb-5">
            Tribhuvan University · IOE · First Year
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
            Arya's<br />
            <span className="bg-gradient-to-r from-indigo-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              Study Hub
            </span>
          </h1>
          <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed max-w-sm mx-auto">
            Four subjects. One dashboard. Built to survive engineering year one.
          </p>
        </header>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-20 md:mb-24">
          
          {/* Physics */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="group relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[13px] p-7 flex flex-col gap-3.5 hover:bg-[var(--bg-tertiary)] hover:border-indigo-500/30 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="font-mono text-2xl font-bold text-indigo-400/80">Ph</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openImageGen('Engineering Physics')}
                  className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                  title="AI Visualizer"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => openChat('Engineering Physics')}
                  className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                  title="Ask AI Tutor"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[var(--text-primary)] group-hover:text-indigo-300 transition-colors">Engineering Physics</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">ENSH 102 · Oscillation, optics, electrostatics & quantum mechanics</p>
            </div>
            <div className="mt-auto pt-1 flex flex-wrap gap-1.5">
              <Link 
                to="/physics/derivations"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-indigo-500/10 text-[var(--text-secondary)] border border-[var(--border-primary)] hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30 transition-all"
              >
                Derivations
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[9.5px] tracking-wide border border-indigo-500/20">44</span>
              </Link>
              <Link 
                to="/physics/numericals"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium text-[var(--text-tertiary)] border border-transparent hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/30 transition-all"
              >
                Numericals
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9.5px] tracking-wide border border-indigo-500/20">265</span>
              </Link>
            </div>
            {/* AI Status Icon */}
            <div className="absolute bottom-3 right-3" title="AI Ready">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
          </motion.div>

          {/* Mathematics */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="group relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[13px] p-7 flex flex-col gap-3.5 hover:bg-[var(--bg-tertiary)] hover:border-emerald-500/30 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="font-serif text-2xl text-emerald-400/80">∑</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openImageGen('Engineering Mathematics')}
                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                  title="AI Visualizer"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => openChat('Engineering Mathematics')}
                  className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                  title="Ask AI Tutor"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[var(--text-primary)] group-hover:text-emerald-300 transition-colors">Engineering Mathematics I</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">ENSH 101 · Calculus, ODEs & 3D geometry</p>
            </div>
            <div className="mt-auto pt-1">
              <Link 
                to="/math"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-emerald-500/10 text-[var(--text-secondary)] border border-[var(--border-primary)] hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 transition-all"
              >
                Question Bank
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9.5px] tracking-wide border border-emerald-500/20">18</span>
              </Link>
            </div>
            {/* AI Status Icon */}
            <div className="absolute bottom-3 right-3" title="AI Ready">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
          </motion.div>

          {/* Electrical */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="group relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[13px] p-7 flex flex-col gap-3.5 hover:bg-[var(--bg-tertiary)] hover:border-amber-500/30 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="font-mono text-2xl font-bold text-amber-400/80">EE</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openImageGen('Electrical & Electronics')}
                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                  title="AI Visualizer"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => openChat('Electrical & Electronics')}
                  className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors"
                  title="Ask AI Tutor"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[var(--text-primary)] group-hover:text-amber-300 transition-colors">Electrical & Electronics</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">ENEX 101 · Circuits, diodes & transistors</p>
            </div>
            <div className="mt-auto pt-1">
              <Link 
                to="/electrical"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-amber-500/10 text-[var(--text-secondary)] border border-[var(--border-primary)] hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/30 transition-all"
              >
                AI Topic Teacher
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[9.5px] tracking-wide border border-amber-500/20">New</span>
              </Link>
            </div>
            {/* AI Status Icon */}
            <div className="absolute bottom-3 right-3" title="AI Ready">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
          </motion.div>

          {/* Programming */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="group relative bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-[13px] p-7 flex flex-col gap-3.5 hover:bg-[var(--bg-tertiary)] hover:border-blue-500/30 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <span className="font-mono text-2xl font-bold text-blue-400/80">C</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openImageGen('Computer Programming')}
                  className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                  title="AI Visualizer"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => openChat('Computer Programming')}
                  className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                  title="Ask AI Tutor"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[var(--text-primary)] group-hover:text-blue-300 transition-colors">Computer Programming</h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">ENCT 101 · C language, pointers & file I/O</p>
            </div>
            <div className="mt-auto pt-1">
              <Link 
                to="/programming"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-blue-500/10 text-[var(--text-secondary)] border border-[var(--border-primary)] hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/30 transition-all"
              >
                Code Lab
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[9.5px] tracking-wide border border-blue-500/20">45</span>
              </Link>
            </div>
            {/* AI Status Icon */}
            <div className="absolute bottom-3 right-3" title="AI Ready">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            </div>
          </motion.div>

        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10 opacity-50">
          <div className="h-px bg-[var(--border-primary)] flex-1" />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[var(--text-tertiary)]">Progress & Tracking Hub</span>
          <div className="h-px bg-[var(--border-primary)] flex-1" />
        </div>

        {/* Tracking Hub */}
        <TrackingHub />

        <footer className="mt-20 text-center font-mono text-[11px] text-[var(--text-tertiary)]">
          arya-ioe-hub · 2025 · built with ☕
        </footer>

      </main>

      {/* AI Drawers & Panels */}
      <ImageGeneratorPanel 
        isOpen={showImageGen} 
        onClose={() => setShowImageGen(false)} 
        subject={activeSubject || ''} 
      />
      <AIChatDrawer 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
        subject={activeSubject || ''} 
      />
    </div>
  );
}
