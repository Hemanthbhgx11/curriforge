import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client on the server
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Cache last generated curriculum in memory for the JSON export
let cachedCurriculum: any = null;

// API routes
app.post("/api/generate", async (req: express.Request, res: express.Response) => {
  try {
    const { skill, level, semesters, weeklyHours, industryFocus } = req.body;

    if (!skill || typeof skill !== "string") {
      return res.status(400).json({ error: "Focus discipline or skill is required." });
    }

    const systemInstruction = 
      "You are an expert curriculum designer, educational director, and university professor. " +
      "Your specialty is crafting detailed, standard, high-quality, and modern training syllabus and academic curricula. " +
      "Ensure recommended readings are real, structured books or documentation links with accurate authors. " +
      "Course codes must have logical progression (e.g., 100 for core introductory courses, progressing to higher numbers in subsequent semesters). " +
      "The core curriculum must be tailored to the specified difficulty level, timeline (total semesters), hours per week, and target career/industry industryFocus.";

    const promptText = `Generate a comprehensive curriculum and syllabus for: "${skill}".
Difficulty Level: ${level || 'Intermediate'}.
Recommended over: ${semesters || 2} semesters.
Weekly Study Commitment: ${weeklyHours || 10} hours.
Strategic Industry/Career Focus: ${industryFocus || 'General Industry'}.

Provide highly detailed subjects. Choose 2 to 3 major courses for each semester. Ensure each course has a catalog code (e.g. CS-101), specific weekly workload, 3 descriptive modules/topics (with subtopics), realistic project outlines, and credible textbooks/readings. Return exact validation-ready JSON matching the requested schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Highly professional title of the curriculum syllabus" },
            discipline: { type: Type.STRING },
            level: { type: Type.STRING },
            industryFocus: { type: Type.STRING },
            totalSemesters: { type: Type.INTEGER },
            weeklyHours: { type: Type.INTEGER },
            overview: { type: Type.STRING, description: "A detailed paragraph explaining learning outcomes and curriculum philosophy" },
            semesters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  semesterNumber: { type: Type.INTEGER },
                  semesterName: { type: Type.STRING },
                  courses: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        courseCode: { type: Type.STRING, description: "Unique catalog code like CS-101 or EE-202" },
                        title: { type: Type.STRING, description: "Formal title of the course" },
                        description: { type: Type.STRING, description: "Comprehensive syllabus description of the course" },
                        credits: { type: Type.INTEGER },
                        weeklyWorkload: { type: Type.INTEGER, description: "Hours of study per week recommended for this course" },
                        topics: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              title: { type: Type.STRING, description: "Topic module or chapter title" },
                              subtopics: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                              }
                            },
                            required: ["title", "subtopics"]
                          }
                        },
                        projects: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              description: { type: Type.STRING }
                            },
                            required: ["name", "description"]
                          }
                        },
                        recommendedReadings: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              title: { type: Type.STRING },
                              author: { type: Type.STRING },
                              year: { type: Type.STRING }
                            },
                            required: ["title", "author"]
                          }
                        }
                      },
                      required: ["courseCode", "title", "description", "credits", "weeklyWorkload", "topics", "projects", "recommendedReadings"]
                    }
                  }
                },
                required: ["semesterNumber", "semesterName", "courses"]
              }
            },
            careerPaths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            skillsAcquired: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "discipline", "level", "industryFocus", "totalSemesters", "weeklyHours", "overview", "semesters", "careerPaths", "skillsAcquired"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from Gemini AI model");
    }

    const curriculumData = JSON.parse(text);
    cachedCurriculum = curriculumData;
    res.json(curriculumData);
  } catch (error: any) {
    console.error("Failed to generate syllabus:", error);
    res.status(500).json({ error: error.message || "Failed to generate syllabus from Gemini API." });
  }
});

app.get("/api/export-json", (req: express.Request, res: express.Response) => {
  if (!cachedCurriculum) {
    return res.status(404).json({ error: "No curriculum generated yet." });
  }
  res.setHeader("Content-Disposition", "attachment; filename=syllabi-curriculum.json");
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(cachedCurriculum, null, 2));
});

// Vite middleware & Server Bootstrap
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start custom Express server:", err);
});
