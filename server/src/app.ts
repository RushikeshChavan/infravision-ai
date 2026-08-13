import express from "express";
import helmet from "helmet";
import cors from "cors";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import protectedRouter from "./routes/protected";
import projectRouter from "./routes/projects";
import milestoneRouter from "./routes/milestones";
import budgetRouter from "./routes/budgets";
import contractorRouter from "./routes/contractors";
import inspectionRouter from "./routes/inspections";
import documentRouter from "./routes/documents";
import requestLogger from "./middleware/requestLogger";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/protected", protectedRouter);
app.use("/api/projects", projectRouter);
app.use("/api/milestones", milestoneRouter);
app.use("/api/budgets", budgetRouter);
app.use("/api/contractors", contractorRouter);
app.use("/api/inspections", inspectionRouter);
app.use("/api/documents", documentRouter);

// Centralized error handler (basic)
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  },
);

export default app;
