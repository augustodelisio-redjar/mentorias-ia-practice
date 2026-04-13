import express from "express";
import coursesRouter from "./routes/courses";
import healthRouter from "./routes/health";
import studentsRouter from "./routes/students";

const app = express();

app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    name: "practica-ia",
    description: "Starter backend para preparar la mentoría antes de integrar herramientas de IA.",
    endpoints: [
      "/api/health",
      "/api/courses",
      "/api/students/:id",
    ],
  });
});

app.use("/api/health", healthRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/students", studentsRouter);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);

  response.status(500).json({
    error: "Se produjo un error inesperado.",
  });
});

export default app;