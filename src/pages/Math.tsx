import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Menu, X, Sparkles } from 'lucide-react';
import { Question } from '../types';

interface MathTopic {
  id: string;
  title: string;
  questions: Question[];
}

export default function Math() {
  const [topics, setTopics] = useState<MathTopic[]>([]);
  const [activeTopicId, setActiveTopicId] = useState<string>('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [selectedQuestion, setSelectedQuestion] = useState<{q: Question, topicId: string, idx: number} | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelUsed, setModelUsed] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/math/topics')
      .then(res => res.json())
      .then(data => setTopics(data));
  }, []);

  const filteredTopics = topics.map(topic => ({
    ...topic,
    questions: topic.questions.filter(d => 
      d.t.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(t => activeTopicId === 'all' || t.id === activeTopicId)
     .filter(t => t.questions.length > 0);

  const solveWithAI = async (forceRefresh = false) => {
    if (!selectedQuestion) return;
    setLoading(true);
    try {
      const res = await fetch('/api/math/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: `${selectedQuestion.topicId}-math-${selectedQuestion.idx}`,
          question: selectedQuestion.q.t,
          topic: selectedQuestion.topicId,
          forceRefresh
        })
      });
      const data = await res.json();
      setSolution(data.solution);
      setModelUsed(data.modelUsed);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#ffffff] text-[#0f172a] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-white transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/60 hover:text-white mb-3 transition-colors">
            <ChevronLeft size={12} /> Study Hub
          </Link>
          <h1 className="font-serif text-xl text-white mb-1">Math Bank</h1>
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/40">ENSH 101 · TU IOE</p>
        </div>
        
        <nav className="p-2 overflow-y-auto h-[calc(100vh-140px)]">
          <div className="px-4 py-2 text-[9px] uppercase tracking-widest text-white/30 font-mono">Chapters</div>
          <button 
            onClick={() => setActiveTopicId('all')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] transition-colors flex items-center gap-3 ${activeTopicId === 'all' ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
          >
            <span className="font-serif opacity-40 w-4">—</span> All Chapters
          </button>
          {topics.map((topic, i) => (
            <button 
              key={topic.id}
              onClick={() => setActiveTopicId(topic.id)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] transition-colors flex items-center gap-3 ${activeTopicId === topic.id ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
            >
              <span className="font-serif opacity-40 w-4">{String(i + 1).padStart(2, '0')}</span>
              <span className="truncate">{topic.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-white relative">
        {/* Topbar */}
        <header className="h-[60px] border-b border-gray-100 flex items-center px-6 gap-4 bg-white/80 backdrop-blur-md z-10">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 -ml-2 text-gray-500">
            <Menu size={20} />
          </button>
          
          <div className="flex-1 max-w-md relative">
            <input 
              type="text" 
              placeholder="Search problems..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
          </div>

          <div className="ml-auto font-mono text-[10px] uppercase tracking-widest text-gray-400 hidden sm:block">
            ENSH 101 · Engineering Mathematics I
          </div>
        </header>

        {/* Content Scroll */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-24">
          {filteredTopics.map((topic, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={topic.id} 
              className="mb-12"
            >
              <div className="flex items-baseline gap-4 border-b border-gray-100 pb-4 mb-6">
                <span className="font-serif text-3xl text-gray-200">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-serif text-2xl font-bold text-gray-900">{topic.title}</h2>
                <span className="ml-auto text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                  {topic.questions.length} problems
                </span>
              </div>

              <div className="grid gap-3">
                {topic.questions.map((q, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setSelectedQuestion({ q, topicId: topic.id, idx });
                      setSolution(null);
                    }}
                    className="group flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-200"
                  >
                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-xs font-serif text-gray-400 group-hover:bg-white group-hover:text-emerald-500 group-hover:border-emerald-200 transition-colors shrink-0 mt-0.5">
                      {q.n}
                    </div>
                    <p className="text-[15px] text-gray-700 leading-relaxed group-hover:text-gray-900 font-serif">
                      {q.t}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {filteredTopics.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p>No problems found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuestion(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-white z-10">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">
                    {topics.find(t => t.id === selectedQuestion.topicId)?.title} · Problem {selectedQuestion.q.n}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 leading-relaxed pr-8 font-serif">
                    {selectedQuestion.q.t}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedQuestion(null)}
                  className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                {solution ? (
                  <div className="prose prose-slate max-w-none">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wide border border-emerald-200">
                        {modelUsed || 'AI Generated'}
                      </span>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: solution }} />
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-xl bg-white">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4">
                      <Sparkles size={20} />
                    </div>
                    <p className="text-gray-500 text-sm mb-6 max-w-xs">
                      Generate a step-by-step solution using our AI model.
                    </p>
                    <button 
                      onClick={() => solveWithAI()}
                      disabled={loading}
                      className="px-6 py-2.5 bg-[#0f172a] text-white rounded-lg text-sm font-medium hover:bg-[#1e293b] transition-all disabled:opacity-70 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Solving...
                        </>
                      ) : (
                        <>⚡ Solve with AI</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {solution && (
                <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                  <button 
                    onClick={() => setSelectedQuestion(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => solveWithAI(true)}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    {loading ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
