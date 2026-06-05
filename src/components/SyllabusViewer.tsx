import React, { useState, useEffect } from "react";
import { Curriculum, Course, Semester } from "../types";
import { 
  BookOpen, Award, Briefcase, Clock, Layers, ChevronDown, ChevronUp, 
  CheckSquare, Square, Printer, Download, Search, CheckCircle, HelpCircle
} from "lucide-react";

interface SyllabusViewerProps {
  curriculum: Curriculum;
  onPrint: () => void;
  onDownloadJSON: () => void;
}

export default function SyllabusViewer({ curriculum, onPrint, onDownloadJSON }: SyllabusViewerProps) {
  const [activeSemesterTab, setActiveSemesterTab] = useState<number>(1);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});
  const [projectStatuses, setProjectStatuses] = useState<Record<string, string>>({});

  // Generate unique keys for storage to keep work compartmentalized
  const getTopicKey = (semNum: number, courseCode: string, topicIndex: number) => {
    return `${curriculum.title.replace(/\s+/g, "_")}_S${semNum}_${courseCode}_T${topicIndex}`;
  };

  const getProjectKey = (semNum: number, courseCode: string, projIndex: number) => {
    return `${curriculum.title.replace(/\s+/g, "_")}_S${semNum}_${courseCode}_P${projIndex}`;
  };

  // Load persistence files on mount or curriculum changes
  useEffect(() => {
    const loadedTopics: Record<string, boolean> = {};
    const loadedProj: Record<string, string> = {};

    curriculum.semesters.forEach(sem => {
      sem.courses.forEach(course => {
        course.topics.forEach((_, idx) => {
          const key = getTopicKey(sem.semesterNumber, course.courseCode, idx);
          loadedTopics[key] = localStorage.getItem(key) === "true";
        });
        course.projects.forEach((_, idx) => {
          const key = getProjectKey(sem.semesterNumber, course.courseCode, idx);
          loadedProj[key] = localStorage.getItem(key) || "Not Started";
        });
      });
    });

    setCompletedTopics(loadedTopics);
    setProjectStatuses(loadedProj);

    // Expand the first few courses in active view by default
    if (curriculum.semesters.length > 0) {
      const initialExpanded: Record<string, boolean> = {};
      curriculum.semesters[0].courses.forEach(c => {
        initialExpanded[c.courseCode] = true;
      });
      setExpandedCourses(initialExpanded);
    }
  }, [curriculum]);

  // Toggle topics completion
  const toggleTopic = (semNum: number, courseCode: string, topicIndex: number) => {
    const key = getTopicKey(semNum, courseCode, topicIndex);
    const updatedStatus = !completedTopics[key];
    setCompletedTopics(prev => ({ ...prev, [key]: updatedStatus }));
    localStorage.setItem(key, updatedStatus ? "true" : "false");
  };

  // Toggle project statuses
  const cycleProjectStatus = (semNum: number, courseCode: string, projIndex: number) => {
    const key = getProjectKey(semNum, courseCode, projIndex);
    const current = projectStatuses[key] || "Not Started";
    let next = "Not Started";
    if (current === "Not Started") next = "In Progress";
    else if (current === "In Progress") next = "Completed";

    setProjectStatuses(prev => ({ ...prev, [key]: next }));
    localStorage.setItem(key, next);
  };

  // Calculate stats for curriculum
  let totalTopicsCount = 0;
  let totalCompletedTopicsCount = 0;

  curriculum.semesters.forEach(sem => {
    sem.courses.forEach(course => {
      course.topics.forEach((_, idx) => {
        totalTopicsCount++;
        const key = getTopicKey(sem.semesterNumber, course.courseCode, idx);
        if (completedTopics[key]) totalCompletedTopicsCount++;
      });
    });
  });

  const overallProgressPercentage = totalTopicsCount > 0 
    ? Math.round((totalCompletedTopicsCount / totalTopicsCount) * 100) 
    : 0;

  // Filter semester list/courses or search
  const activeSemester = curriculum.semesters.find(s => s.semesterNumber === activeSemesterTab) || curriculum.semesters[0];

  const toggleCourseExpanded = (code: string) => {
    setExpandedCourses(prev => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="space-y-6">
      {/* Upper Badge Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bento Card 1: Main Metadata */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between border border-slate-800">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                02 / Active Syllabus
              </span>
              <span className="text-[10px] text-slate-500 font-mono">LATENCY: OK</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight font-display text-slate-100 line-clamp-2">
              {curriculum.title}
            </h3>
            <p className="text-xs text-indigo-400 mt-2 font-mono uppercase tracking-wider">
              {curriculum.discipline}
            </p>
          </div>
          <div className="mt-8 pt-4 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Focused Alignment</span>
            <span className="text-xs font-bold text-slate-300 block truncate">
              {curriculum.industryFocus}
            </span>
          </div>
        </div>

        {/* Bento Card 2: Numeric Metrics */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                03 / Course Load Metrics
              </span>
              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                CALIBRATED
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <Layers className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                <span className="block text-base font-extrabold text-slate-800">{curriculum.totalSemesters}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Terms</span>
              </div>
              <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <Clock className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                <span className="block text-base font-extrabold text-slate-800">{curriculum.weeklyHours}h</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Wk Load</span>
              </div>
              <div className="text-center p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                <BookOpen className="h-4 w-4 text-indigo-600 mx-auto mb-1" />
                <span className="block text-base font-extrabold text-slate-800">
                  {curriculum.semesters.reduce((acc, sem) => acc + sem.courses.length, 0)}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Courses</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3 mt-4">
            Custom schedule matches rigorous credit workloads.
          </p>
        </div>

        {/* Bento Card 3: Live Progress tracker */}
        <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-lg shadow-indigo-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">
                04 / Program Progress
              </span>
              <span className="text-[10px] font-mono font-bold text-white bg-indigo-500/50 px-2 py-0.5 rounded-sm">
                {overallProgressPercentage}% Completed
              </span>
            </div>
            
            <div className="mt-2 space-y-2">
              <div className="w-full bg-indigo-700 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500" 
                  style={{ width: `${overallProgressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-indigo-150">
                <span>Completed Modules</span>
                <span className="font-mono">{totalCompletedTopicsCount} / {totalTopicsCount}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-indigo-500 pt-3 mt-4 flex items-center justify-between">
            <span className="text-xs text-indigo-100">Certificate Status</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-md">
              {overallProgressPercentage === 100 
                ? "Program Graduate" 
                : overallProgressPercentage > 60 
                  ? "Capstones Active" 
                  : "Core Underway"}
            </span>
          </div>
        </div>
      </div>

      {/* Action panel & Search */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 w-full md:max-w-md">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 bg-slate-100 py-2 px-2.5 rounded-xl border border-slate-200 shrink-0">
            05 / FILTER
          </span>
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              id="course-search"
              type="text"
              placeholder="Search subjects, core concepts, textbooks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500/80 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onPrint}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-5 px-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            Print Curriculum / PDF
          </button>
          <button
            onClick={onDownloadJSON}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-5 px-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export JSON Scheme
          </button>
        </div>
      </div>

      {/* Overview Block */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="mb-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
            06 / Educational Context & Intent
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 font-display">
            Program Architecture Overview
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
          {curriculum.overview}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-slate-100 pt-6">
          <div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
              Target Engineering Career Profiles
            </span>
            <div className="flex flex-wrap gap-2">
              {curriculum.careerPaths.map(path => (
                <span key={path} className="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200">
                  {path}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              <Award className="h-3.5 w-3.5 text-indigo-500" />
              Primary Core Competencies Acquired
            </span>
            <div className="flex flex-wrap gap-2">
              {curriculum.skillsAcquired.map(skill => (
                <span key={skill} className="text-xs bg-indigo-50/40 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-100/30">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Term Roadmap Columns or Tabs */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        {/* Semester Tab Switcher */}
        <div className="mb-6">
          <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-3">
            07 / Course Term Catalog
          </span>
          <div className="flex flex-wrap gap-2">
            {curriculum.semesters.map((sem) => (
              <button
                key={sem.semesterNumber}
                onClick={() => {
                  setActiveSemesterTab(sem.semesterNumber);
                  // Auto expand courses inside the newly selected semester
                  const newExpanded: Record<string, boolean> = {};
                  sem.courses.forEach(c => {
                    newExpanded[c.courseCode] = true;
                  });
                  setExpandedCourses(newExpanded);
                }}
                className={`py-2 px-4.5 text-xs font-extrabold tracking-wide rounded-2xl transition-all cursor-pointer border ${
                  activeSemesterTab === sem.semesterNumber
                    ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10"
                    : "border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {sem.semesterName}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Display */}
        {activeSemester ? (
          <div className="space-y-6">
            {activeSemester.courses
              .filter(course => {
                const query = searchQuery.toLowerCase();
                return (
                  course.title.toLowerCase().includes(query) ||
                  course.courseCode.toLowerCase().includes(query) ||
                  course.description.toLowerCase().includes(query) ||
                  course.topics.some(t => t.title.toLowerCase().includes(query))
                );
              })
              .map((course: Course) => {
                const isExpanded = !!expandedCourses[course.courseCode];
                
                // Course topic counts
                let courseTopics = course.topics.length;
                let completedInCourse = 0;
                course.topics.forEach((_, idx) => {
                  const key = getTopicKey(activeSemester.semesterNumber, course.courseCode, idx);
                  if (completedTopics[key]) completedInCourse++;
                });
                const courseCompletionPercent = courseTopics > 0 ? Math.round((completedInCourse / courseTopics) * 100) : 0;

                return (
                  <div 
                    key={course.courseCode} 
                    className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                  >
                    {/* Course Title Header Accordion button */}
                    <button
                      type="button"
                      onClick={() => toggleCourseExpanded(course.courseCode)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 text-left cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1">
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-xl">
                            {course.courseCode}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {course.credits} Credits • {course.weeklyWorkload} hrs/wk
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm sm:text-base pr-4">
                          {course.title}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${courseCompletionPercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            {courseCompletionPercent}%
                          </span>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-400 bg-white p-0.5 border rounded-lg" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-400 bg-white p-0.5 border rounded-lg" />
                        )}
                      </div>
                    </button>

                    {/* Extended Details */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 bg-white border-t border-slate-100 space-y-6">
                        {/* Summary Description */}
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
                            Course Focus & Objective
                          </span>
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                            {course.description}
                          </p>
                        </div>

                        {/* Program study items / Topics */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Module Topics Checkbox list */}
                          <div className="lg:col-span-8 space-y-4">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-3">
                                Modules & Interactive Lectures
                              </span>
                              
                              <div className="space-y-2 max-h-[320px] overflow-y-auto border border-slate-100 p-3 rounded-2xl bg-slate-50/50">
                                {course.topics.map((topic, tIdx) => {
                                  const topicKey = getTopicKey(activeSemester.semesterNumber, course.courseCode, tIdx);
                                  const isDone = !!completedTopics[topicKey];

                                  return (
                                    <div 
                                      key={tIdx}
                                      onClick={() => toggleTopic(activeSemester.semesterNumber, course.courseCode, tIdx)}
                                      className="flex items-start gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 cursor-pointer transition-all hover:bg-slate-50/60"
                                    >
                                      <button type="button" className="mt-0.5 text-indigo-600 focus:outline-hidden">
                                        {isDone ? (
                                          <CheckSquare className="h-4 w-4 text-indigo-600" />
                                        ) : (
                                          <Square className="h-4 w-4 text-slate-300 hover:text-slate-400" />
                                        )}
                                      </button>
                                      
                                      <div className="flex-grow">
                                        <span className={`block text-xs font-extrabold text-slate-800 ${isDone ? 'line-through text-slate-400' : ''}`}>
                                          Module {tIdx + 1}: {topic.title}
                                        </span>
                                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                          {topic.subtopics.map((sub, sIdx) => (
                                            <span 
                                              key={sIdx} 
                                              className={`text-[10px] ${isDone ? 'text-slate-300' : 'text-slate-400'} font-mono`}
                                            >
                                              • {sub}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Side books and projects column */}
                          <div className="lg:col-span-4 space-y-6">
                            {/* Practical Capstones / Projects */}
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-2">
                                Term Project Milestones
                              </span>
                              <div className="space-y-3">
                                {course.projects.map((proj, pIdx) => {
                                  const projKey = getProjectKey(activeSemester.semesterNumber, course.courseCode, pIdx);
                                  const status = projectStatuses[projKey] || "Not Started";

                                  return (
                                    <div key={pIdx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                                      <div className="flex justify-between items-start gap-1">
                                        <span className="text-xs font-bold text-slate-800 leading-tight">
                                          {proj.name}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => cycleProjectStatus(activeSemester.semesterNumber, course.courseCode, pIdx)}
                                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm select-none cursor-pointer tracking-wider ${
                                            status === "Completed"
                                              ? "bg-emerald-100 text-emerald-800"
                                              : status === "In Progress"
                                                ? "bg-indigo-100 text-indigo-800"
                                                : "bg-slate-200 text-slate-500"
                                          }`}
                                        >
                                          {status}
                                        </button>
                                      </div>
                                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                                        {proj.description}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Books */}
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-2">
                                Key Sourced Literature
                              </span>
                              <div className="space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                {course.recommendedReadings.map((book, bIdx) => (
                                  <div key={bIdx} className="flex gap-2">
                                    <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                                    <div className="text-[11px] leading-tight">
                                      <span className="font-semibold text-slate-700 block">
                                        {book.title}
                                      </span>
                                      <span className="text-slate-400 font-mono">
                                        {book.author} {book.year ? `(${book.year})` : ""}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            No academic terms created yet.
          </div>
        )}
      </div>

      {/* Hidden Print Syllabus Template Block (designed solely for professional PDF printer outputs) */}
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
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wide border-b border-slate-400 pb-1 mb-2">
            Curriculum Overview & Educational Scope
          </h2>
          <p className="text-justify leading-relaxed text-sm">
            {curriculum.overview}
          </p>
        </div>

        {/* Semesters & Courses Table list */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold uppercase tracking-wide border-b border-slate-400 pb-1 mb-2">
            Term Breakdowns & Syllabus Chapters
          </h2>
          
          {curriculum.semesters.map((sem) => (
            <div key={sem.semesterNumber} className="space-y-4 page-break-inside-avoid">
              <h3 className="text-md font-bold uppercase tracking-wide bg-slate-100 p-2 border-l-4 border-slate-800 text-slate-800">
                {sem.semesterName}
              </h3>

              <div className="space-y-4">
                {sem.courses.map((course) => (
                  <div key={course.courseCode} className="border border-slate-200 p-4 rounded-sm space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="font-mono text-xs font-bold text-indigo-700 bg-slate-50 px-2 py-0.5 rounded-sm">
                        {course.courseCode}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 flex-grow pl-3">
                        {course.title}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">
                        {course.credits} Credits • {course.weeklyWorkload} hrs/wk
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed italic">
                      {course.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {/* Topics */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Syllabus Modules</span>
                        <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
                          {course.topics.slice(0, 3).map((top, idx) => (
                            <li key={idx}>
                              <strong>{top.title}</strong>: {top.subtopics.join(", ")}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Side Books & Projects */}
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Practical Projects</span>
                          <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
                            {course.projects.map((p, idx) => (
                              <li key={idx}><strong>{p.name}</strong> - {p.description}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Key Lit / Textbooks</span>
                          <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-1">
                            {course.recommendedReadings.map((r, idx) => (
                              <li key={idx}><em>{r.title}</em> by {r.author}</li>
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
        <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-4 mt-8 font-mono">
          Curriculum Syllabus Generated via Gemini Deep intelligence Program • Verified Vector Specification
        </div>
      </div>
    </div>
  );
}
