export interface Book {
  title: string;
  author: string;
  year?: string;
}

export interface Project {
  name: string;
  description: string;
}

export interface CourseTopic {
  title: string;
  subtopics: string[];
}

export interface Course {
  courseCode: string;
  title: string;
  description: string;
  credits: number;
  weeklyWorkload: number;
  topics: CourseTopic[];
  projects: Project[];
  recommendedReadings: Book[];
}

export interface Semester {
  semesterNumber: number;
  semesterName: string;
  courses: Course[];
}

export interface Curriculum {
  title: string;
  discipline: string;
  level: string;
  industryFocus: string;
  totalSemesters: number;
  weeklyHours: number;
  overview: string;
  semesters: Semester[];
  careerPaths: string[];
  skillsAcquired: string[];
}
