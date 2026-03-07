import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e9eef8] font-sans selection:bg-indigo-500/30">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Header */}
        <header className="text-center mb-16 md:mb-20">
          <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[#3e5070] mb-5">
            Tribhuvan University · IOE · First Year
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4">
            Arya's<br />
            <span className="bg-gradient-to-r from-indigo-400 via-emerald-300 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
              Study Hub
            </span>
          </h1>
          <p className="text-[#8795b0] text-[15px] leading-relaxed max-w-sm mx-auto">
            Four subjects. One dashboard. Built to survive engineering year one.
          </p>
        </header>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 mb-20 md:mb-24">
          
          {/* Physics */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="group relative bg-[#162038] border border-white/5 rounded-[13px] p-7 flex flex-col gap-3.5 hover:bg-[#1a2644] hover:border-indigo-500/30 hover:shadow-lg transition-all duration-200"
          >
            <span className="font-mono text-2xl font-bold text-indigo-400/80">Ph</span>
            <div>
              <h3 className="text-[17px] font-semibold text-white group-hover:text-indigo-300 transition-colors">Engineering Physics</h3>
              <p className="text-[13px] text-[#8795b0] leading-relaxed">ENSH 102 · Oscillation, optics, electrostatics & quantum mechanics</p>
            </div>
            <div className="mt-auto pt-1 flex flex-wrap gap-1.5">
              <Link 
                to="/physics/derivations"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-indigo-500/10 text-[#8795b0] border border-white/5 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30 transition-all"
              >
                Derivations
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[9.5px] tracking-wide border border-indigo-500/20">44</span>
              </Link>
              <Link 
                to="/physics/numericals"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium text-[#3e5070] border border-transparent hover:bg-indigo-500/10 hover:text-indigo-300 hover:border-indigo-500/30 transition-all"
              >
                Numericals
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[9.5px] tracking-wide border border-indigo-500/20">265</span>
              </Link>
            </div>
          </motion.div>

          {/* Mathematics */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="group relative bg-[#162038] border border-white/5 rounded-[13px] p-7 flex flex-col gap-3.5 hover:bg-[#1a2644] hover:border-emerald-500/30 hover:shadow-lg transition-all duration-200"
          >
            <span className="font-serif text-2xl text-emerald-400/80">∑</span>
            <div>
              <h3 className="text-[17px] font-semibold text-white group-hover:text-emerald-300 transition-colors">Engineering Mathematics I</h3>
              <p className="text-[13px] text-[#8795b0] leading-relaxed">ENSH 101 · Calculus, ODEs & 3D geometry</p>
            </div>
            <div className="mt-auto pt-1">
              <Link 
                to="/math"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-emerald-500/10 text-[#8795b0] border border-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 transition-all"
              >
                Question Bank
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9.5px] tracking-wide border border-emerald-500/20">18</span>
              </Link>
            </div>
          </motion.div>

          {/* Electrical */}
          <div className="group relative bg-[#162038] border border-white/5 rounded-[13px] p-7 flex flex-col gap-3.5 opacity-60 hover:opacity-100 transition-opacity">
            <span className="font-mono text-2xl font-bold text-amber-400/80">EE</span>
            <div>
              <h3 className="text-[17px] font-semibold text-white group-hover:text-amber-300 transition-colors">Electrical & Electronics</h3>
              <p className="text-[13px] text-[#8795b0] leading-relaxed">ENEX 101 · Circuits, diodes & transistors</p>
            </div>
            <div className="mt-auto pt-1">
              <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#3e5070]">Coming Soon</span>
            </div>
          </div>

          {/* Programming */}
          <motion.div 
            whileHover={{ y: -2 }}
            className="group relative bg-[#162038] border border-white/5 rounded-[13px] p-7 flex flex-col gap-3.5 hover:bg-[#1a2644] hover:border-blue-500/30 hover:shadow-lg transition-all duration-200"
          >
            <span className="font-mono text-2xl font-bold text-blue-400/80">C</span>
            <div>
              <h3 className="text-[17px] font-semibold text-white group-hover:text-blue-300 transition-colors">Computer Programming</h3>
              <p className="text-[13px] text-[#8795b0] leading-relaxed">ENCT 101 · C language, pointers & file I/O</p>
            </div>
            <div className="mt-auto pt-1">
              <Link 
                to="/programming"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-blue-500/10 text-[#8795b0] border border-white/5 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/30 transition-all"
              >
                Code Lab
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[9.5px] tracking-wide border border-blue-500/20">45</span>
              </Link>
            </div>
          </motion.div>

        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10 opacity-50">
          <div className="h-px bg-white/10 flex-1" />
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#3e5070]">Progress & Tracking Hub</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        {/* Tracking Hub Placeholder */}
        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <p className="text-[#8795b0] text-sm">Tracking Hub coming in Phase 2</p>
        </div>

        <footer className="mt-20 text-center font-mono text-[11px] text-[#3e5070]">
          arya-ioe-hub · 2025 · built with ☕
        </footer>

      </main>
    </div>
  );
}
