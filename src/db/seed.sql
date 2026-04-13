INSERT INTO courses (id, code, title, category, level, max_seats) VALUES
  (1, 'TS-API', 'TypeScript API Fundamentals', 'backend', 'beginner', 30),
  (2, 'SQL-REPORTS', 'SQL for Reporting', 'data', 'intermediate', 25),
  (3, 'NODE-ARCH', 'Node Service Design', 'backend', 'advanced', 20),
  (4, 'TEST-HTTP', 'HTTP Testing Workshop', 'quality', 'intermediate', 18),
  (5, 'DX-COPILOT', 'Developer Experience with Copilot', 'productivity', 'beginner', 40);

INSERT INTO students (id, first_name, last_name, email, active) VALUES
  (1, 'Ana', 'Pereyra', 'ana.pereyra@example.com', 1),
  (2, 'Bruno', 'Sosa', 'bruno.sosa@example.com', 1),
  (3, 'Carla', 'Rios', 'carla.rios@example.com', 1),
  (4, 'Diego', 'Molina', 'diego.molina@example.com', 0),
  (5, 'Elena', 'Suarez', 'elena.suarez@example.com', 1),
  (6, 'Franco', 'Ibarra', 'franco.ibarra@example.com', 1);

INSERT INTO enrollments (id, student_id, course_id, status, enrolled_at) VALUES
  (1, 1, 1, 'completed', '2026-01-15'),
  (2, 1, 2, 'active', '2026-02-10'),
  (3, 2, 1, 'active', '2026-03-01'),
  (4, 2, 4, 'completed', '2026-01-22'),
  (5, 3, 2, 'completed', '2026-01-30'),
  (6, 3, 5, 'active', '2026-03-05'),
  (7, 4, 3, 'dropped', '2026-02-12'),
  (8, 5, 3, 'active', '2026-03-08'),
  (9, 5, 4, 'active', '2026-03-10'),
  (10, 6, 5, 'completed', '2026-01-18');