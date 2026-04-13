import { Router } from "express";
import { selectAll } from "../db/client";

const router = Router();
const allowedLevels = new Set(["beginner", "intermediate", "advanced"]);

type CourseRow = {
  id: number;
  code: string;
  title: string;
  category: string;
  level: string;
  maxSeats: number;
  enrolledCount: number;
  activeEnrollmentCount: number;
  completedEnrollmentCount: number;
};

router.get("/", async (request, response, next) => {
  try {
    const level = typeof request.query.level === "string" ? request.query.level : null;

    if (level && !allowedLevels.has(level)) {
      response.status(400).json({
        error: "El parametro level debe ser beginner, intermediate o advanced.",
      });
      return;
    }

    const params: unknown[] = [];
    let sql = `
      SELECT
        c.id AS id,
        c.code AS code,
        c.title AS title,
        c.category AS category,
        c.level AS level,
        c.max_seats AS maxSeats,
        COUNT(e.id) AS enrolledCount,
        SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) AS activeEnrollmentCount,
        SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) AS completedEnrollmentCount
      FROM courses c
      LEFT JOIN enrollments e ON e.course_id = c.id
    `;

    if (level) {
      sql += " WHERE c.level = ?";
      params.push(level);
    }

    sql += " GROUP BY c.id ORDER BY c.title ASC";

    const items = await selectAll<CourseRow>(sql, params);

    response.json({
      items,
      filters: {
        level,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;