DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;

CREATE TABLE courses (
  id INTEGER PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  max_seats INTEGER NOT NULL CHECK (max_seats > 0)
);

CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'dropped')),
  enrolled_at TEXT NOT NULL,
  UNIQUE (student_id, course_id),
  FOREIGN KEY (student_id) REFERENCES students (id),
  FOREIGN KEY (course_id) REFERENCES courses (id)
);