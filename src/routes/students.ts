import { Router } from "express";
import { selectAll, selectOne } from "../db/client";

const router = Router();

type StudentRow = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  active: number;
};

type EnrollmentRow = {
  enrollmentId: number;
  status: string;
  enrolledAt: string;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  courseLevel: string;
};

router.get("/:id", async (request, response, next) => {
  try {
    const studentId = Number.parseInt(request.params.id, 10);

    if (!Number.isInteger(studentId) || studentId <= 0) {
      response.status(400).json({
        error: "El id del estudiante debe ser un entero positivo.",
      });
      return;
    }

    const student = await selectOne<StudentRow>(
      `
        SELECT
          id AS id,
          first_name AS firstName,
          last_name AS lastName,
          email AS email,
          active AS active
        FROM students
        WHERE id = ?
      `,
      [studentId],
    );

    if (!student) {
      response.status(404).json({
        error: "No existe un estudiante con el id indicado.",
      });
      return;
    }

    const enrollments = await selectAll<EnrollmentRow>(
      `
        SELECT
          e.id AS enrollmentId,
          e.status AS status,
          e.enrolled_at AS enrolledAt,
          c.id AS courseId,
          c.code AS courseCode,
          c.title AS courseTitle,
          c.level AS courseLevel
        FROM enrollments e
        INNER JOIN courses c ON c.id = e.course_id
        WHERE e.student_id = ?
        ORDER BY e.enrolled_at DESC, c.title ASC
      `,
      [studentId],
    );

    response.json({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        active: student.active === 1,
      },
      enrollments,
    });
  } catch (error) {
    next(error);
  }
});

export default router;