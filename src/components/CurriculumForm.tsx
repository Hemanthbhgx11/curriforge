import React, { useState } from "react";
import { BookOpen, Sparkles, Terminal, Cpu, Database, Award } from "lucide-react";

interface CurriculumFormProps {
  onSubmit: (data: {
    skill: string;
    level: string;
    semesters: number;
    weeklyHours: number;
    industryFocus: string;
  }) => void;
  isLoading: boolean;
}

const PRESETS = [
  {
    label: "Embedded Systems & IoT",
    skill: "Embedded Systems, Microcontrollers (ESP32/ARM), and Digital Logic Design",
    level: "Intermediate",
    semesters: 2,
    weeklyHours: 15,
    industryFocus: "Project-Based & Hardware Prototyping",
    icon: Cpu,
  },
  {
    label: "Advanced Full-Stack TypeScript",
    skill: "Full-Stack Software Engineering with React, Node.js, Express, and Database Design",
    level: "Advanced",
    semesters: 3,
    weeklyHours: 20,
    industryFocus: "Enterprise & Startup-oriented",
    icon: Terminal,
  },
  {
    label: "Machine Learning & AI",
    skill: "Data Science, Neural Networks, Supervised Learning, and Large Language Models",
    level: "Intermediate",
    semesters: 2,
    weeklyHours: 12,
    industryFocus: "Research & Academic",
    icon: Sparkles,
  },
  {
    label: "Database Systems & Engineering",
    skill: "Relational Databases, SQL Query Optimization, Distributed Databases, and NoSQL",
    level: "Advanced",
    semesters: 2,
    weeklyHours: 10,
    industryFocus: "Production Enterprise Infrastructure",
    icon: Database,
  },
];

export default function CurriculumForm({ onSubmit, isLoading }: CurriculumFormProps) {
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("Intermediate");
  const [semesters, setSemesters] = useState(2);
  const [weeklyHours, setWeeklyHours] = useState(15);
  const [industryFocus, setIndustryFocus] = useState("Project-Based / Hands-On");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skill.trim()) return;
    onSubmit({
      skill: skill.trim(),
      level,
      semesters,
      weeklyHours,
      industryFocus,
    });
  };

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setSkill(preset.skill);
    setLevel(preset.level);
    setSemesters(preset.semesters);
    setWeeklyHours(preset.weeklyHours);
    setIndustryFocus(preset.industryFocus);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            01 / Curriculum Specification
          </h2>
          <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-bold">
            FAST SYNTHESIS
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mt-1">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          Specify Program Parameters
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Provide your target ECE, software engineering, or technical discipline criteria or apply an academic preset.
        </p>
      </div>

      {/* Presets List */}
      <div className="mb-6">
        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
          Syllabus Architecture Presets
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESETS.map((preset) => {
            const IconComponent = preset.icon;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="flex items-start text-left p-3.5 border border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50 rounded-2xl transition-all group cursor-pointer"
              >
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100/70 transition-colors mr-3 mt-0.5 shrink-0">
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <span className="block font-bold text-xs sm:text-sm text-slate-800">
                    {preset.label}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5 leading-none">
                    {preset.level} • {preset.semesters} Semesters
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex items-center my-6">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-white z-10 px-2">
          Or Craft From Scratch
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Discipline / Skill */}
        <div>
          <label htmlFor="discipline-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Focus Discipline or Subject & Area of Study <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="discipline-input"
            rows={3}
            required
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            disabled={isLoading}
            placeholder="e.g. Embedded Systems, Microcontrollers (ESP32/ARM), Real-time Drivers Development, or Deep Learning models..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 text-sm font-sans"
          />
        </div>

        {/* Level & Semesters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="level-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Academic Difficulty Level
            </label>
            <select
              id="level-select"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 text-sm cursor-pointer"
            >
              <option value="Beginner (Introductory Study)">Beginner (100 Level Intro)</option>
              <option value="Intermediate">Intermediate (200-300 Level Core)</option>
              <option value="Advanced">Advanced (400-500 Level Specialization)</option>
              <option value="Post-Graduate / Professional">Post-Graduate / Professional-grade</option>
            </select>
          </div>

          <div>
            <label htmlFor="semesters-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Timeline Duration (Total Terms)
            </label>
            <select
              id="semesters-select"
              value={semesters}
              onChange={(e) => setSemesters(Number(e.target.value))}
              disabled={isLoading}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 text-sm cursor-pointer"
            >
              <option value={1}>1 Semester (Crash Course Study)</option>
              <option value={2}>2 Semesters (1 Academic Year)</option>
              <option value={3}>3 Semesters (Extended Core)</option>
              <option value={4}>4 Semesters (2 Full Academic Years)</option>
              <option value={6}>6 Semesters (Professional Program)</option>
              <option value={8}>8 Semesters (Full Bachelor Degree equivalent)</option>
            </select>
          </div>
        </div>

        {/* Study Hours & Industry Focus */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="weekly-hours-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Weekly Hour Commitment ({weeklyHours} hrs)
            </label>
            <div className="flex items-center gap-4">
              <input
                id="weekly-hours-input"
                type="range"
                min={4}
                max={40}
                step={2}
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                disabled={isLoading}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
              />
              <span className="font-mono text-xs bg-slate-100 text-slate-700 py-1.5 px-3 rounded-lg border border-slate-200 font-bold min-w-[3.5rem] tracking-tight text-center">
                {weeklyHours}h/Wk
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Refines study density: {weeklyHours <= 10 ? "Casual study workload" : weeklyHours <= 20 ? "Targeted ECE standard workload" : "Intensive full-time study load"}.
            </p>
          </div>

          <div>
            <label htmlFor="industry-focus-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Syllabus Career/Industry Focus
            </label>
            <input
              id="industry-focus-input"
              type="text"
              value={industryFocus}
              onChange={(e) => setIndustryFocus(e.target.value)}
              disabled={isLoading}
              placeholder="e.g. Enterprise Software, Autonomous Research, DIY Hardware"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 transition-all focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 text-sm"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3.5 px-6 rounded-2xl transition-all shadow-xs hover:shadow-lg hover:shadow-indigo-100 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? "Consulting AI Curriculum Architect..." : "Generate Professional Syllabus"}
        </button>
      </form>
    </div>
  );
}
