import React, { useState, useEffect } from "react";
import { Curriculum } from "./types";
import CurriculumForm from "./components/CurriculumForm";
import SyllabusViewer from "./components/SyllabusViewer";
import { 
  GraduationCap, Sparkles, BookOpen, Clock, Compass, HelpCircle, 
  Trash2, Terminal, ChevronRight, Bookmark, ArrowLeft, X
} from "lucide-react";

const LOADER_STEPS = [
  "Initializing Curriculum Synthesis Pipeline...",
  "Drafting standard, balanced semester timelines...",
  "Configuring formal courses, titles, and credit quotas...",
  "Structuring custom, granular topics and lecture items...",
  "Mapping engineering project milestones and descriptions...",
  "Sourcing accredited literature, textbooks, and resources...",
  "Performing unified schema validation checks..."
];

export default function App() {
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loaderStep, setLoaderStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Curriculum[]>([]);
  const [showFaq, setShowFaq] = useState(false);

  // Load curriculum history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("syllabi_curriculum_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load syllabus histories:", e);
    }
  }, []);

  // Progressive loader effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoaderStep(0);
      let stepIdx = 0;
      interval = setInterval(() => {
        if (stepIdx < LOADER_STEPS.length - 1) {
          stepIdx++;
          setLoaderStep(stepIdx);
        }
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleGenerate = async (formData: {
    skill: string;
    level: string;
    semesters: number;
    weeklyHours: number;
    industryFocus: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setCurriculum(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to synthesize curriculum.");
      }

      const data: Curriculum = await response.json();
      setCurriculum(data);

      // Add to unique history array (prevent duplicates)
      setHistory(prev => {
        const filtered = prev.filter(c => c.title.toLowerCase() !== data.title.toLowerCase());
        const updated = [data, ...filtered].slice(0, 10); // Keep max 10
        localStorage.setItem("syllabi_curriculum_history", JSON.stringify(updated));
        return updated;
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during synthesis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromHistory = (index: number) => {
    setCurriculum(history[index]);
    setError(null);
  };

  const handleDeleteHistoryItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((_, i) => i !== index);
    setHistory(updated);
    localStorage.setItem("syllabi_curriculum_history", JSON.stringify(updated));
    if (curriculum && history[index] && curriculum.title === history[index].title) {
      setCurriculum(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    window.open("/api/export-json", "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased py-6">
      {/* Bento Styled Header Bar */}
      <header className="no-print w-full max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase mb-1">
              Active Project Workspace
            </span>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-display">
                  CurriculaAI Architect
                </h1>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider leading-none mt-1">
                  Unified Syllabus Design Engine
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFaq(!showFaq)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100/85 px-4 py-2 rounded-2xl border border-slate-100"
              >
                <HelpCircle className="h-4 w-4 text-indigo-600" />
                Syllabus Guidelines
              </button>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-mono uppercase">Version 2.5 • Live</p>
              <p className="text-[10px] text-slate-400 font-mono uppercase">Sync State: Synchronized</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main id="interactive-dashboard" className="no-print mx-auto max-w-7xl px-4 md:px-8">
        
        {/* Dynamic Guidelines Drawer as a Bento Cell */}
        {showFaq && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 mb-8 relative shadow-sm">
            <button 
              type="button"
              onClick={() => setShowFaq(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                00 / Guidelines
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 mt-1">
                Syllabus Engineering Guidelines
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-600 font-sans leading-relaxed">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <h4 className="font-bold text-slate-800 mb-1">Tailored Architecture</h4>
                <p className="text-xs text-slate-500 mt-1">Divided into customizable terms. Workloads are dynamically calibrated depending on your targeted weekly hours.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <h4 className="font-bold text-slate-800 mb-1">Academic Coding</h4>
                <p className="text-xs text-slate-500 mt-1">Subjects inherit standardized course codes (e.g. CS-101 to CS-401 algorithms) to preserve sequencing rigor.</p>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <h4 className="font-bold text-slate-800 mb-1">Sourced Literature</h4>
                <p className="text-xs text-slate-500 mt-1">Generates textbook lists and robust hands-on milestone projects with live tracking features.</p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Banner Grid (Visible when no syllabus loaded) */}
        {!curriculum && !isLoading && (
          <div className="mb-8 text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Academic Syllabus Engine
            </span>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Synthesize Professional Learning Pathways
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
              Design structured curricular roadmaps tailored to specialized systems engineering, digital logic, machine learning fields, or custom disciplines.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left panel options (Form + history) */}
          <div className={`space-y-6 ${curriculum ? "lg:col-span-4" : "lg:col-span-8 lg:col-start-2"}`}>
            
            {/* Show Form */}
            {(!curriculum || isLoading) ? (
              <CurriculumForm onSubmit={handleGenerate} isLoading={isLoading} />
            ) : (
              /* Back button if syllabus is active on sidebar */
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Active Session
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurriculum(null)}
                  className="w-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 text-indigo-600" />
                  Generate New Syllabus
                </button>
                <div className="border-t border-slate-100 pt-4 mt-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Current Syllabus:</div>
                  <div className="text-base font-extrabold text-indigo-700 truncate">{curriculum.title}</div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">{curriculum.discipline}</div>
                </div>
              </div>
            )}

            {/* History Selector Panel as a Bento block */}
            {history.length > 0 && !isLoading && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-4 flex items-center gap-1.5">
                  <Bookmark className="h-4 w-4 text-indigo-600" />
                  Historical Workspaces ({history.length})
                </h3>
                
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {history.map((hist, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectFromHistory(idx)}
                      className={`group flex items-center justify-between p-3 border rounded-2xl cursor-pointer text-left transition-all ${
                        curriculum?.title === hist.title
                          ? "border-indigo-600 bg-indigo-50/20"
                          : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <span className="block font-bold text-xs sm:text-sm text-slate-800 truncate">
                          {hist.title}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                          {hist.discipline} • {hist.totalSemesters} terms
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteHistoryItem(idx, e)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete history item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right panel output: Curriculum interactive view or loaders */}
          <div className={`lg:col-span-8 ${curriculum ? "" : "hidden"}`}>
            {curriculum && (
              <SyllabusViewer 
                curriculum={curriculum} 
                onPrint={handlePrint} 
                onDownloadJSON={handleDownloadJSON} 
              />
            )}
          </div>

          {/* Loader progressive animation as clean Bento Cell */}
          {isLoading && (
            <div className="lg:col-span-8 border border-slate-200 rounded-3xl p-10 sm:p-20 bg-slate-900 text-white text-center space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-6 left-6 text-left">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Syllabus Generation
                </span>
              </div>
              <div className="absolute top-6 right-6">
                <span className="text-orange-400 bg-orange-950/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
                  Active
                </span>
              </div>

              <div className="relative mx-auto flex h-16 w-16 items-center justify-center mt-6">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-20"></span>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                  <Terminal className="h-5 w-5 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold tracking-tight">
                  Synthesizing Curriculum Blueprint
                </h3>
                <p className="text-xs sm:text-sm text-indigo-400 font-mono font-bold">
                  {LOADER_STEPS[loaderStep]}
                </p>
              </div>

              <div className="max-w-xs mx-auto w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${((loaderStep + 1) / LOADER_STEPS.length) * 100}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                Consulting academic design models. We coordinate structured JSON validation structures via Gemini context filters (~5-10 seconds total).
              </p>
            </div>
          )}

          {/* Error notifications as Bento Cell */}
          {error && (
            <div className="lg:col-span-8 border border-rose-200 bg-rose-50/50 p-6 rounded-3xl flex items-start gap-4 shadow-sm">
              <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <ArrowLeft className="h-5 w-5 transform rotate-45" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-rose-800">Syllabus Synthesis Failed</h4>
                <p className="text-xs sm:text-sm text-rose-600 leading-relaxed font-mono">
                  {error}
                </p>
                <div className="pt-3">
                  <button
                    onClick={() => setError(null)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    Reset and Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Shared Footer block */}
      <footer className="no-print mt-20 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-2">
          <p>© 2026 Curriculum Syllabus Workspace • For Educational & Academic Portfolio Demonstrations</p>
          <p className="font-mono text-[10px]">Deploy containerized in Cloud Run • Powered by Server-side Gemini intelligence models</p>
        </div>
      </footer>

      {/* Interactive print wrapper: contains same syllabus layout targeted solely for PDF media prints */}
      {curriculum && (
        <div id="print-syllabus-catalog" className="hidden print:block font-serif text-slate-900 p-8 space-y-8 bg-white">
          <div className="text-center border-b-4 border-slate-900 pb-6">
            <h1 className="text-3xl font-extrabold uppercase tracking-tight font-sans">
              {curriculum.title}
            </h1>
            <p className="text-sm font-semibold tracking-wider uppercase text-slate-500 mt-2">
              Formal Academic Curriculum Syllabus & Study Roadmap
            </p>
            <div className="grid grid-cols-4 gap-4 text-xs font-mono mt-4 pt-4 border-t border-slate-200">
              <div>
                <span className="font-bold uppercase block text-[10px] text-slate-400">DISCIPLINE</span>
                {curriculum.discipline}
              </div>
              <div>
                <span className="font-bold uppercase block text-[10px] text-slate-400">DIFFICULTY</span>
                {curriculum.level}
              </div>
              <div>
                <span className="font-bold uppercase block text-[10px] text-slate-400">TOTAL TIMELINE</span>
                {curriculum.totalSemesters} Semesters
              </div>
              <div>
                <span className="font-bold uppercase block text-[10px] text-slate-400">INDUSTRY FOCUS</span>
                {curriculum.industryFocus}
              </div>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <h2 className="text-md font-bold uppercase tracking-wide border-b border-slate-400 pb-1">
              Curriculum Overview & Educational Scope
            </h2>
            <p className="text-justify leading-relaxed text-xs">
              {curriculum.overview}
            </p>
          </div>

          {/* Semesters & Courses list */}
          <div className="space-y-6">
            <h2 className="text-md font-bold uppercase tracking-wide border-b border-slate-400 pb-1">
              Term Breakdowns & Syllabus Chapters
            </h2>
            
            {curriculum.semesters.map((sem) => (
              <div key={sem.semesterNumber} className="space-y-3 p-1.5 border border-slate-300 rounded-sm page-break-inside-avoid">
                <h3 className="text-xs font-bold uppercase tracking-wide bg-slate-100 p-1.5 border-l-3 border-slate-800 text-slate-800">
                  {sem.semesterName}
                </h3>

                <div className="space-y-3">
                  {sem.courses.map((course) => (
                    <div key={course.courseCode} className="border border-slate-100 p-2.5 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                        <span className="font-sans text-[10px] font-extrabold text-indigo-700 bg-slate-50 px-1.5 py-0.5 rounded-sm">
                          {course.courseCode}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 flex-grow pl-2 truncate">
                          {course.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {course.credits} Credits • {course.weeklyWorkload} hrs/wk
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-normal">
                        {course.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Topics */}
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Syllabus Modules</span>
                          <ul className="list-disc list-inside text-[10px] text-slate-700 space-y-0.5">
                            {course.topics.map((top, idx) => (
                              <li key={idx} className="truncate">
                                <strong>{top.title}</strong>: {top.subtopics.join(", ")}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Side Books & Projects */}
                        <div className="space-y-1.5">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Practical Projects</span>
                            <ul className="list-disc list-inside text-[10px] text-slate-700 space-y-0.5">
                              {course.projects.map((p, idx) => (
                                <li key={idx} className="truncate"><strong>{p.name}</strong> - {p.description}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Key Literature & Textbooks</span>
                            <ul className="list-disc list-inside text-[10px] text-slate-700 space-y-0.5">
                              {course.recommendedReadings.map((r, idx) => (
                                <li key={idx} className="truncate"><em>{r.title}</em> by {r.author}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer info */}
          <div className="text-center text-[9px] text-slate-400 border-t border-slate-200 pt-3 mt-6 font-mono">
            Syllabus Generated via Gemini Deep Intelligence • Verified Specification Program
          </div>
        </div>
      )}

    </div>
  );
}
