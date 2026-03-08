import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DATA = {
  physics: {
    name: 'Engineering Physics',
    tag: 'ENSH 102 · Oscillation · Optics · Quantum',
    badge: 'Year 1 · Part I',
    accent: '#818cf8',
    completion: 55,
    hoursStudied: 38, hoursTarget: 60,
    hoursNote: '22 h remaining to hit semester goal',
    chapters: [
      { name: '1. Oscillation',          pct: 90 },
      { name: '2. Acoustics',            pct: 80 },
      { name: '3. Heat & Thermodynamics',pct: 70 },
      { name: '4. Optics',               pct: 50 },
      { name: '5. Electrostatics',       pct: 40 },
      { name: '6. Electromagnetism',     pct: 25 },
      { name: '7. Electromagnetic Waves',pct: 15 },
      { name: '8. Photon & Matter Waves',pct: 10 },
    ],
    trend: [2.0, 1.5, 3.0, 2.5, 1.0, 2.5, 2.0],
    topicLabels: ['Oscillation','Acoustics','Thermo','Optics','Electrostatics','EM Waves','Quantum'],
    topicValues:  [90, 80, 70, 50, 40, 15, 10],
    stats: { questions: 198, derivations: 44, score: '71%', last: 'Today' },
  },
  mathematics: {
    name: 'Engineering Mathematics I',
    tag: 'ENSH 101 · Calculus · ODE · 3D Geometry',
    badge: 'Year 1 · Part I',
    accent: '#6ee7b7',
    completion: 62,
    hoursStudied: 32, hoursTarget: 45,
    hoursNote: '13 h remaining to hit semester goal',
    chapters: [
      { name: '1. Derivatives & Applications',    pct: 88 },
      { name: '2. Antiderivatives & Applications', pct: 75 },
      { name: '3. Ordinary Differential Equations',pct: 60 },
      { name: '4. Plane Analytic Geometry',        pct: 45 },
      { name: '5. Three Dimensional Geometry',     pct: 30 },
    ],
    trend: [2.5, 2.0, 3.5, 1.5, 3.0, 2.0, 2.5],
    topicLabels: ['Derivatives','Antiderivatives','ODE','Plane Geom.','3D Geom.'],
    topicValues:  [88, 75, 60, 45, 30],
    stats: { questions: 224, derivations: 18, score: '76%', last: 'Yesterday' },
  },
  electrical: {
    name: 'Electrical & Electronics Engg.',
    tag: 'ENEX 101 · DC/AC · Diodes · Op-Amp',
    badge: 'Year 1 · Part I',
    accent: '#fcd34d',
    completion: 48,
    hoursStudied: 22, hoursTarget: 45,
    hoursNote: '23 h remaining to hit semester goal',
    chapters: [
      { name: '1. Basic Circuit Concepts', pct: 85 },
      { name: '2. Average & RMS Values',   pct: 78 },
      { name: '3. AC Circuit Analysis',    pct: 55 },
      { name: '4. Diodes',                 pct: 40 },
      { name: '5. Transistors',            pct: 25 },
      { name: '6. Op-Amp & Oscillators',   pct: 10 },
    ],
    trend: [1.0, 1.5, 2.0, 1.0, 2.5, 1.5, 1.5],
    topicLabels: ['Basic Circuits','RMS/Avg','AC Analysis','Diodes','BJT/FET','Op-Amp'],
    topicValues:  [85, 78, 55, 40, 25, 10],
    stats: { questions: 112, derivations: 26, score: '65%', last: '2 days ago' },
  },
  programming: {
    name: 'Computer Programming',
    tag: 'ENCT 101 · C Language · DSA · Files',
    badge: 'Year 1 · Part I',
    accent: '#34d399',
    completion: 72,
    hoursStudied: 38, hoursTarget: 45,
    hoursNote: '7 h remaining to hit semester goal',
    chapters: [
      { name: '1. Intro to Programming',   pct: 100 },
      { name: '2. Overview of C',          pct: 95  },
      { name: '3. Operators & Expressions',pct: 90  },
      { name: '4. Input & Output',         pct: 88  },
      { name: '5. Control Structures',     pct: 80  },
      { name: '6. Arrays & Pointers',      pct: 65  },
      { name: '7. User-defined Functions', pct: 55  },
      { name: '8. Structures',             pct: 35  },
      { name: '9. File Management',        pct: 20  },
      { name: '10. Recent Trends / OOP',   pct: 10  },
    ],
    trend: [3.0, 2.5, 4.0, 2.0, 3.5, 3.0, 2.5],
    topicLabels: ['Intro','C Basics','Operators','I/O','Control','Arrays/Ptrs','Functions','Structures','Files','OOP'],
    topicValues:  [100, 95, 90, 88, 80, 65, 55, 35, 20, 10],
    stats: { questions: 287, derivations: 0, score: '80%', last: 'Today' },
  },
};

type SubjectKey = keyof typeof DATA;
const SUBJECT_KEYS: SubjectKey[] = ['physics', 'mathematics', 'electrical', 'programming'];

export default function TrackingHub() {
  const [activeSubject, setActiveSubject] = useState<SubjectKey>('physics');
  const d = DATA[activeSubject];

  const trendData = d.trend.map((val, i) => ({ day: DAYS[i], hours: val }));
  const barData = d.topicLabels.map((label, i) => ({ topic: label, mastery: d.topicValues[i] }));
  const pieData = [{ name: 'Done', value: d.completion }, { name: 'Left', value: 100 - d.completion }];

  return (
    <section id="tracking-hub" className="w-full">
      {/* Carousel nav */}
      <div className="relative mb-8 overflow-hidden">
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {SUBJECT_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveSubject(key)}
              className={`snap-center shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeSubject === key 
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-lg' 
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)]'
              }`}
            >
              {DATA[key].name}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubject}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4"
        >
          {/* Row 1: identity + pie + hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Identity */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider">Active Subject</span>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-2 leading-tight">{d.name}</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{d.tag}</p>
              </div>
              <span className="inline-block self-start px-2.5 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[10px] font-mono mt-4 border border-[var(--border-primary)]">
                {d.badge}
              </span>
            </div>

            {/* Doughnut */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 flex flex-col items-center justify-center relative">
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider absolute top-6 left-6">Completion</span>
              <div className="relative w-32 h-32 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={45}
                      outerRadius={60}
                      dataKey="value"
                      stroke="none"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={d.accent} />
                      <Cell fill="var(--bg-tertiary)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">{d.completion}%</span>
                  <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">done</span>
                </div>
              </div>
            </div>

            {/* Hours tracker */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 flex flex-col justify-center">
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Hours This Month</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-[var(--text-primary)]">{d.hoursStudied}</span>
                <span className="text-xs text-[var(--text-tertiary)]">/ {d.hoursTarget} h target</span>
              </div>
              <div className="h-2 w-full bg-[var(--bg-tertiary)] rounded-full mt-5 overflow-hidden border border-[var(--border-primary)]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(d.hoursStudied / d.hoursTarget) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: d.accent }}
                />
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] mt-3">{d.hoursNote}</p>
            </div>
          </div>

          {/* Row 2: chapters + trend line */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chapter bars */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6">
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider mb-4 block">Chapter Progress</span>
              <div className="space-y-4 max-h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[var(--border-primary)] scrollbar-track-transparent">
                {d.chapters.map((ch, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--text-secondary)] truncate pr-4">{ch.name}</span>
                      <span className="text-[var(--text-primary)] font-mono">{ch.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${ch.pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: d.accent }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7-day trend */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 flex flex-col">
              <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider mb-4 block">Study Trend · Last 7 Days</span>
              <div className="flex-1 min-h-[148px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: d.accent }}
                      formatter={(value) => [`${value} h`, 'Studied']}
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke={d.accent}
                      strokeWidth={2}
                      dot={{ r: 3, fill: d.accent, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: d.accent, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 3: topic mastery bar chart */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6">
            <span className="text-[10px] font-mono text-[var(--text-tertiary)] uppercase tracking-wider mb-4 block">Topic Mastery</span>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="topic" stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: 'var(--bg-tertiary)' }}
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value) => [`${value}%`, 'Mastery']}
                  />
                  <Bar dataKey="mastery" fill={d.accent} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 4: stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-5 flex flex-col justify-center">
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Questions Solved</span>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{d.stats.questions}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-5 flex flex-col justify-center">
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Derivations Done</span>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{d.stats.derivations}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-5 flex flex-col justify-center">
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Avg Score</span>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{d.stats.score}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-5 flex flex-col justify-center">
              <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Last Studied</span>
              <p className="text-lg font-medium text-[var(--text-secondary)]">{d.stats.last}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
