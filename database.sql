DROP DATABASE IF EXISTS smartcampus;
CREATE DATABASE IF NOT EXISTS smartcampus;
USE smartcampus;

-- DEPARTMENTS
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

INSERT INTO departments (name) VALUES
('CS'), ('IT'), ('DSDA'), ('AI');

-- YEARS
CREATE TABLE years (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) NOT NULL
);

INSERT INTO years (name) VALUES
('FY'), ('SY'), ('TY');

-- SUBJECTS
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    dept_id INT,
    year_id INT,
    FOREIGN KEY (dept_id) REFERENCES departments(id),
    FOREIGN KEY (year_id) REFERENCES years(id)
);

-- CS SUBJECTS
INSERT INTO subjects (name, dept_id, year_id) VALUES
-- FY
('Python Programming', 1, 1),
('Mathematics', 1, 1),
('Digital Logic', 1, 1),
('Communication Skills', 1, 1),
('Web Basics', 1, 1),
('Computer Fundamentals', 1, 1),
-- SY
('Data Structures', 1, 2),
('DBMS', 1, 2),
('Operating System', 1, 2),
('Computer Networks', 1, 2),
('Software Engineering', 1, 2),
('Java Programming', 1, 2),
-- TY
('Machine Learning', 1, 3),
('Cloud Computing', 1, 3),
('Cyber Security', 1, 3),
('Compiler Design', 1, 3),
('AI Fundamentals', 1, 3),
('Project Management', 1, 3);

-- IT SUBJECTS
INSERT INTO subjects (name, dept_id, year_id) VALUES
-- FY
('Web Development', 2, 1),
('Networking Basics', 2, 1),
('Programming in C', 2, 1),
('Mathematics', 2, 1),
('IT Fundamentals', 2, 1),
('Communication Skills', 2, 1),
-- SY
('Cyber Security', 2, 2),
('Cloud Computing', 2, 2),
('Linux Administration', 2, 2),
('Mobile App Development', 2, 2),
('Database Management', 2, 2),
('Python Programming', 2, 2),
-- TY
('DevOps', 2, 3),
('Ethical Hacking', 2, 3),
('IoT', 2, 3),
('Big Data', 2, 3),
('Network Security', 2, 3),
('Project Management', 2, 3);

-- DSDA SUBJECTS
INSERT INTO subjects (name, dept_id, year_id) VALUES
-- FY
('Statistics', 3, 1),
('Python Programming', 3, 1),
('Mathematics', 3, 1),
('Data Collection', 3, 1),
('Communication Skills', 3, 1),
('Computer Fundamentals', 3, 1),
-- SY
('Data Visualization', 3, 2),
('Machine Learning', 3, 2),
('Big Data Analytics', 3, 2),
('DBMS', 3, 2),
('Data Mining', 3, 2),
('R Programming', 3, 2),
-- TY
('Deep Learning', 3, 3),
('NLP', 3, 3),
('Data Engineering', 3, 3),
('Business Intelligence', 3, 3),
('AI Ethics', 3, 3),
('Capstone Project', 3, 3);

-- AI SUBJECTS
INSERT INTO subjects (name, dept_id, year_id) VALUES
-- FY
('Python Programming', 4, 1),
('Mathematics', 4, 1),
('Logic & Reasoning', 4, 1),
('Computer Fundamentals', 4, 1),
('Communication Skills', 4, 1),
('Statistics', 4, 1),
-- SY
('Artificial Intelligence', 4, 2),
('Neural Networks', 4, 2),
('Computer Vision', 4, 2),
('NLP', 4, 2),
('Robotics', 4, 2),
('Machine Learning', 4, 2),
-- TY
('Deep Learning', 4, 3),
('Reinforcement Learning', 4, 3),
('AI Ethics', 4, 3),
('Generative AI', 4, 3),
('AI Project', 4, 3),
('Edge AI', 4, 3);

-- USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    first_login TINYINT(1) DEFAULT 1,
    phone VARCHAR(15) DEFAULT NULL
);

INSERT INTO users (username, password, role, first_login, phone) VALUES
('admin', 'scrypt:32768:8:1$7hHQS28tSq7i8iiV$16a5804f93a9e1c4605ce0aabc589bc3869b70940b2f1de84adcb19e07153d7cc01f5450470282021f47acbde0f58bf643c7ddfbd0f4ba89d1c35fd0e6e3c879', 'admin', 0, '9876543210');

-- TEACHERS
CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    dept_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- Teacher subjects mapping (one teacher, multiple subjects across years)
CREATE TABLE teacher_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT,
    subject_id INT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- TEACHER DATA
-- 3 teachers per department.
-- Each teacher handles 2 subjects in FY, 2 in SY, and 2 in TY.
-- This keeps all 6 subjects of every year assigned.

-- CS TEACHERS
INSERT INTO users (username, password, role, first_login, phone) VALUES
('1000001@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000001'),
('1000002@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000002'),
('1000003@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000003');

INSERT INTO teachers (user_id, name, username, dept_id) VALUES
(2, 'Rajesh Sharma', '1000001@college.ac.in', 1),
(3, 'Priya Mehta',   '1000002@college.ac.in', 1),
(4, 'Suresh Patel',  '1000003@college.ac.in', 1);

INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES
(1,1),(1,2),(1,7),(1,8),(1,13),(1,14),
(2,3),(2,4),(2,9),(2,10),(2,15),(2,16),
(3,5),(3,6),(3,11),(3,12),(3,17),(3,18);

-- IT TEACHERS
INSERT INTO users (username, password, role, first_login, phone) VALUES
('1000004@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000004'),
('1000005@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000005'),
('1000006@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000006');

INSERT INTO teachers (user_id, name, username, dept_id) VALUES
(5, 'Amit Joshi', '1000004@college.ac.in', 2),
(6, 'Sunita Rao', '1000005@college.ac.in', 2),
(7, 'Ravi Kumar', '1000006@college.ac.in', 2);

INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES
(4,19),(4,20),(4,25),(4,26),(4,31),(4,32),
(5,21),(5,22),(5,27),(5,28),(5,33),(5,34),
(6,23),(6,24),(6,29),(6,30),(6,35),(6,36);

-- DSDA TEACHERS
INSERT INTO users (username, password, role, first_login, phone) VALUES
('1000007@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000007'),
('1000008@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000008'),
('1000009@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000009');

INSERT INTO teachers (user_id, name, username, dept_id) VALUES
(8,  'Deepak Mishra', '1000007@college.ac.in', 3),
(9,  'Rekha Pandey', '1000008@college.ac.in', 3),
(10, 'Sanjay Kulkarni', '1000009@college.ac.in', 3);

INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES
(7,37),(7,38),(7,43),(7,44),(7,49),(7,50),
(8,39),(8,40),(8,45),(8,46),(8,51),(8,52),
(9,41),(9,42),(9,47),(9,48),(9,53),(9,54);

-- AI TEACHERS
INSERT INTO users (username, password, role, first_login, phone) VALUES
('1000010@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000010'),
('1000011@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000011'),
('1000012@college.ac.in', 'scrypt:32768:8:1$AVDVyOAU5TOBBnBt$623834f21b3548c2db78682d946c20f5f720d0d541794eff99dca47f87eb7b7f574371f527e9a263b788ec5c078343f1b4f49ec11f09d4c85c93ba5406ec3b2e', 'teacher', 1, '9000000012');

INSERT INTO teachers (user_id, name, username, dept_id) VALUES
(11, 'Arun Khanna', '1000010@college.ac.in', 4),
(12, 'Divya Menon', '1000011@college.ac.in', 4),
(13, 'Kiran Reddy', '1000012@college.ac.in', 4);

INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES
(10,55),(10,56),(10,61),(10,62),(10,67),(10,68),
(11,57),(11,58),(11,63),(11,64),(11,69),(11,70),
(12,59),(12,60),(12,65),(12,66),(12,71),(12,72);

-- STUDENTS
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    roll_no VARCHAR(20) NOT NULL UNIQUE,
    dept_id INT,
    year_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (dept_id) REFERENCES departments(id),
    FOREIGN KEY (year_id) REFERENCES years(id)
);

-- CS STUDENTS (5 per year = 15 total)
INSERT INTO users (username, password, role, first_login, phone) VALUES
('2000001@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000025'),
('2000002@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000026'),
('2000003@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000027'),
('2000004@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000028'),
('2000005@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000029'),
('2000006@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000030'),
('2000007@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000031'),
('2000008@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000032'),
('2000009@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000033'),
('2000010@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000034'),
('2000011@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000035'),
('2000012@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000036'),
('2000013@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000037'),
('2000014@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000038'),
('2000015@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000039');

INSERT INTO students (user_id, name, username, roll_no, dept_id, year_id) VALUES
-- FY
(14, 'Aarav Shah',    '2000001@college.ac.in', 'CS-FY-001', 1, 1),
(15, 'Bhavna Jain',   '2000002@college.ac.in', 'CS-FY-002', 1, 1),
(16, 'Chirag Patel',  '2000003@college.ac.in', 'CS-FY-003', 1, 1),
(17, 'Divya Sharma',  '2000004@college.ac.in', 'CS-FY-004', 1, 1),
(18, 'Eshan Mehta',   '2000005@college.ac.in', 'CS-FY-005', 1, 1),
-- SY
(19, 'Fatima Khan',   '2000006@college.ac.in', 'CS-SY-001', 1, 2),
(20, 'Gaurav Verma',  '2000007@college.ac.in', 'CS-SY-002', 1, 2),
(21, 'Hena Gupta',    '2000008@college.ac.in', 'CS-SY-003', 1, 2),
(22, 'Ishaan Rao',    '2000009@college.ac.in', 'CS-SY-004', 1, 2),
(23, 'Jyoti Singh',   '2000010@college.ac.in', 'CS-SY-005', 1, 2),
-- TY
(24, 'Kabir Malhotra','2000011@college.ac.in', 'CS-TY-001', 1, 3),
(25, 'Lavanya Nair',  '2000012@college.ac.in', 'CS-TY-002', 1, 3),
(26, 'Manav Tiwari',  '2000013@college.ac.in', 'CS-TY-003', 1, 3),
(27, 'Nidhi Desai',   '2000014@college.ac.in', 'CS-TY-004', 1, 3),
(28, 'Om Mishra',     '2000015@college.ac.in', 'CS-TY-005', 1, 3);

-- IT STUDENTS (5 per year = 15 total)
INSERT INTO users (username, password, role, first_login, phone) VALUES
('2000016@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000040'),
('2000017@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000041'),
('2000018@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000042'),
('2000019@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000043'),
('2000020@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000044'),
('2000021@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000045'),
('2000022@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000046'),
('2000023@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000047'),
('2000024@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000048'),
('2000025@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000049'),
('2000026@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000050'),
('2000027@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000051'),
('2000028@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000052'),
('2000029@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000053'),
('2000030@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000054');

INSERT INTO students (user_id, name, username, roll_no, dept_id, year_id) VALUES
-- FY
(29, 'Prachi Kulkarni', '2000016@college.ac.in', 'IT-FY-001', 2, 1),
(30, 'Qasim Ansari',    '2000017@college.ac.in', 'IT-FY-002', 2, 1),
(31, 'Riya Bansal',     '2000018@college.ac.in', 'IT-FY-003', 2, 1),
(32, 'Sahil Saxena',    '2000019@college.ac.in', 'IT-FY-004', 2, 1),
(33, 'Tanvi Reddy',     '2000020@college.ac.in', 'IT-FY-005', 2, 1),
-- SY
(34, 'Uday Khanna',     '2000021@college.ac.in', 'IT-SY-001', 2, 2),
(35, 'Varsha Menon',    '2000022@college.ac.in', 'IT-SY-002', 2, 2),
(36, 'Waqar Hussain',   '2000023@college.ac.in', 'IT-SY-003', 2, 2),
(37, 'Xenia DSouza',    '2000024@college.ac.in', 'IT-SY-004', 2, 2),
(38, 'Yash Chauhan',    '2000025@college.ac.in', 'IT-SY-005', 2, 2),
-- TY
(39, 'Zara Iyer',       '2000026@college.ac.in', 'IT-TY-001', 2, 3),
(40, 'Arjun Yadav',     '2000027@college.ac.in', 'IT-TY-002', 2, 3),
(41, 'Bhumi Bose',      '2000028@college.ac.in', 'IT-TY-003', 2, 3),
(42, 'Chetan Joshi',    '2000029@college.ac.in', 'IT-TY-004', 2, 3),
(43, 'Disha Pandey',    '2000030@college.ac.in', 'IT-TY-005', 2, 3);

-- DSDA STUDENTS (5 per year = 15 total)
INSERT INTO users (username, password, role, first_login, phone) VALUES
('2000031@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000055'),
('2000032@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000056'),
('2000033@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000057'),
('2000034@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000058'),
('2000035@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000059'),
('2000036@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000060'),
('2000037@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000061'),
('2000038@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000062'),
('2000039@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000063'),
('2000040@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000064'),
('2000041@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000065'),
('2000042@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000066'),
('2000043@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000067'),
('2000044@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000068'),
('2000045@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000069');

INSERT INTO students (user_id, name, username, roll_no, dept_id, year_id) VALUES
-- FY
(44, 'Ekta Sharma',  '2000031@college.ac.in', 'DSDA-FY-001', 3, 1),
(45, 'Farhan Malik', '2000032@college.ac.in', 'DSDA-FY-002', 3, 1),
(46, 'Gauri Tiwari', '2000033@college.ac.in', 'DSDA-FY-003', 3, 1),
(47, 'Harsh Verma',  '2000034@college.ac.in', 'DSDA-FY-004', 3, 1),
(48, 'Isha Patel',   '2000035@college.ac.in', 'DSDA-FY-005', 3, 1),
-- SY
(49, 'Jay Mehta',    '2000036@college.ac.in', 'DSDA-SY-001', 3, 2),
(50, 'Komal Singh',  '2000037@college.ac.in', 'DSDA-SY-002', 3, 2),
(51, 'Laksh Gupta',  '2000038@college.ac.in', 'DSDA-SY-003', 3, 2),
(52, 'Mahi Rao',     '2000039@college.ac.in', 'DSDA-SY-004', 3, 2),
(53, 'Nikhil Kumar', '2000040@college.ac.in', 'DSDA-SY-005', 3, 2),
-- TY
(54, 'Ojas Mehta',   '2000041@college.ac.in', 'DSDA-TY-001', 3, 3),
(55, 'Pooja Rao',    '2000042@college.ac.in', 'DSDA-TY-002', 3, 3),
(56, 'Rahul Verma',  '2000043@college.ac.in', 'DSDA-TY-003', 3, 3),
(57, 'Sneha Joshi',  '2000044@college.ac.in', 'DSDA-TY-004', 3, 3),
(58, 'Tarun Nair',   '2000045@college.ac.in', 'DSDA-TY-005', 3, 3);

-- AI STUDENTS (5 per year = 15 total)
INSERT INTO users (username, password, role, first_login, phone) VALUES
('2000046@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000070'),
('2000047@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000071'),
('2000048@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000072'),
('2000049@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000073'),
('2000050@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000074'),
('2000051@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000075'),
('2000052@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000076'),
('2000053@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000077'),
('2000054@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000078'),
('2000055@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000079'),
('2000056@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000080'),
('2000057@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000081'),
('2000058@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000082'),
('2000059@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000083'),
('2000060@college.ac.in', 'scrypt:32768:8:1$6TSL3PmdS37Q1aBD$08398158fc05549aad8bf5a137814c93ab9b5ea7a0482bbdbcf5054de449c8df6fdb40750e5d85d747cc14aebd5acbdd9f30eb1eb129acd4cd2b238cfae571f7', 'student', 1, '9000000084');

INSERT INTO students (user_id, name, username, roll_no, dept_id, year_id) VALUES
-- FY
(59, 'Uma Sharma',    '2000046@college.ac.in', 'AI-FY-001', 4, 1),
(60, 'Varun Patel',   '2000047@college.ac.in', 'AI-FY-002', 4, 1),
(61, 'Wini DSouza',   '2000048@college.ac.in', 'AI-FY-003', 4, 1),
(62, 'Xerxes Irani',  '2000049@college.ac.in', 'AI-FY-004', 4, 1),
(63, 'Yamini Reddy',  '2000050@college.ac.in', 'AI-FY-005', 4, 1),
-- SY
(64, 'Zaid Khan',     '2000051@college.ac.in', 'AI-SY-001', 4, 2),
(65, 'Aisha Menon',   '2000052@college.ac.in', 'AI-SY-002', 4, 2),
(66, 'Bharat Kumar',  '2000053@college.ac.in', 'AI-SY-003', 4, 2),
(67, 'Chhavi Gupta',  '2000054@college.ac.in', 'AI-SY-004', 4, 2),
(68, 'Dhruv Bansal',  '2000055@college.ac.in', 'AI-SY-005', 4, 2),
-- TY
(69, 'Elan Saxena',   '2000056@college.ac.in', 'AI-TY-001', 4, 3),
(70, 'Falak Ansari',  '2000057@college.ac.in', 'AI-TY-002', 4, 3),
(71, 'Girish Rao',    '2000058@college.ac.in', 'AI-TY-003', 4, 3),
(72, 'Hina Tiwari',   '2000059@college.ac.in', 'AI-TY-004', 4, 3),
(73, 'Ishan Verma',   '2000060@college.ac.in', 'AI-TY-005', 4, 3);


-- ATTENDANCE
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject_id INT,
    date DATE NOT NULL,
    status ENUM('P', 'A', 'L') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);


-- Attendance data 
--FY
INSERT INTO attendance (student_id, subject_id, date, status) VALUES
(11,1,'2024-06-01','P'),(11,1,'2024-06-02','P'),(11,1,'2024-06-03','P'),(11,1,'2024-06-04','A'),(11,1,'2024-06-05','P'),
(11,2,'2024-06-01','P'),(11,2,'2024-06-02','P'),(11,2,'2024-06-03','A'),(11,2,'2024-06-04','P'),(11,2,'2024-06-05','P'),
(11,3,'2024-06-01','P'),(11,3,'2024-06-02','P'),(11,3,'2024-06-03','P'),(11,3,'2024-06-04','P'),(11,3,'2024-06-05','P'),
(11,4,'2024-06-01','A'),(11,4,'2024-06-02','P'),(11,4,'2024-06-03','P'),(11,4,'2024-06-04','P'),(11,4,'2024-06-05','P'),
(11,5,'2024-06-01','P'),(11,5,'2024-06-02','P'),(11,5,'2024-06-03','L'),(11,5,'2024-06-04','P'),(11,5,'2024-06-05','P');

--SY
INSERT INTO attendance (student_id, subject_id, date, status) VALUES
(11,7,'2025-06-01','P'),(11,7,'2025-06-02','P'),(11,7,'2025-06-03','A'),(11,7,'2025-06-04','P'),(11,7,'2025-06-05','P'),
(11,8,'2025-06-01','P'),(11,8,'2025-06-02','A'),(11,8,'2025-06-03','P'),(11,8,'2025-06-04','P'),(11,8,'2025-06-05','P'),
(11,9,'2025-06-01','P'),(11,9,'2025-06-02','P'),(11,9,'2025-06-03','P'),(11,9,'2025-06-04','A'),(11,9,'2025-06-05','P'),
(11,10,'2025-06-01','P'),(11,10,'2025-06-02','P'),(11,10,'2025-06-03','L'),(11,10,'2025-06-04','P'),(11,10,'2025-06-05','P'),
(11,11,'2025-06-01','A'),(11,11,'2025-06-02','P'),(11,11,'2025-06-03','P'),(11,11,'2025-06-04','P'),(11,11,'2025-06-05','P');

--TY
INSERT INTO attendance (student_id, subject_id, date, status) VALUES
(11,13,'2026-06-01','P'),(11,13,'2026-06-02','P'),(11,13,'2026-06-03','A'),(11,13,'2026-06-04','P'),(11,13,'2026-06-05','A'),
(11,13,'2026-06-06','P'),(11,13,'2026-06-07','A'),(11,13,'2026-06-08','P'),(11,13,'2026-06-09','L'),(11,13,'2026-06-10','P'),
(11,14,'2026-06-01','P'),(11,14,'2026-06-02','A'),(11,14,'2026-06-03','P'),(11,14,'2026-06-04','P'),(11,14,'2026-06-05','A'),
(11,14,'2026-06-06','P'),(11,14,'2026-06-07','P'),(11,14,'2026-06-08','A'),(11,14,'2026-06-09','P'),(11,14,'2026-06-10','P'),
(11,15,'2026-06-01','P'),(11,15,'2026-06-02','P'),(11,15,'2026-06-03','A'),(11,15,'2026-06-04','P'),(11,15,'2026-06-05','P'),
(11,15,'2026-06-06','A'),(11,15,'2026-06-07','P'),(11,15,'2026-06-08','P'),(11,15,'2026-06-09','A'),(11,15,'2026-06-10','L'),
(11,16,'2026-06-01','P'),(11,16,'2026-06-02','A'),(11,16,'2026-06-03','P'),(11,16,'2026-06-04','P'),(11,16,'2026-06-05','A'),
(11,16,'2026-06-06','P'),(11,16,'2026-06-07','P'),(11,16,'2026-06-08','A'),(11,16,'2026-06-09','P'),(11,16,'2026-06-10','P'),
(11,17,'2026-06-01','P'),(11,17,'2026-06-02','P'),(11,17,'2026-06-03','A'),(11,17,'2026-06-04','P'),(11,17,'2026-06-05','P'),
(11,17,'2026-06-06','A'),(11,17,'2026-06-07','P'),(11,17,'2026-06-08','P'),(11,17,'2026-06-09','A'),(11,17,'2026-06-10','P');

-- MARKS
CREATE TABLE marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    subject_id INT,
    internal_marks INT DEFAULT 0,
    theory_marks INT DEFAULT 0,
    total_marks INT DEFAULT 100,
    year_name ENUM('FY','SY','TY') NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

INSERT INTO marks (student_id, subject_id, internal_marks, theory_marks, total_marks, year_name) VALUES
-- FY Result
(11, 1, 24, 56, 100, 'FY'),
(11, 2, 23, 54, 100, 'FY'),
(11, 3, 22, 55, 100, 'FY'),
(11, 4, 25, 57, 100, 'FY'),
(11, 5, 24, 53, 100, 'FY'),
(11, 6, 23, 56, 100, 'FY'),

-- SY Result
(11, 7, 23, 52, 100, 'SY'),
(11, 8, 24, 51, 100, 'SY'),
(11, 9, 22, 50, 100, 'SY'),
(11, 10, 23, 54, 100, 'SY'),
(11, 11, 24, 52, 100, 'SY'),
(11, 12, 22, 53, 100, 'SY');

ALTER TABLE attendance ADD UNIQUE KEY unique_attendance(student_id,subject_id,date);

ALTER TABLE marks ADD UNIQUE KEY unique_marks (student_id, subject_id);

UPDATE marks
SET internal_marks=27, theory_marks=58, total_marks=85
WHERE student_id=11 AND subject_id=13;

UPDATE marks
SET internal_marks=26, theory_marks=60, total_marks=86
WHERE student_id=11 AND subject_id=14;

UPDATE marks
SET internal_marks=28, theory_marks=61, total_marks=89
WHERE student_id=11 AND subject_id=15;

UPDATE marks
SET internal_marks=25, theory_marks=57, total_marks=82
WHERE student_id=11 AND subject_id=16;

UPDATE marks
SET internal_marks=24, theory_marks=56, total_marks=80
WHERE student_id=11 AND subject_id=17;

UPDATE marks
SET internal_marks=29, theory_marks=63, total_marks=92
WHERE student_id=11 AND subject_id=18;

UPDATE marks SET year_name='TY'
WHERE student_id=11 AND subject_id BETWEEN 13 AND 18;

-- =========================================================
-- TEACHER ASSIGNMENT VERIFICATION
-- Expected:
-- 3 teachers per department
-- 2 subjects per teacher for FY
-- 2 subjects per teacher for SY
-- 2 subjects per teacher for TY
-- 6 subjects total per teacher
-- =========================================================

SELECT
    d.name AS department,
    COUNT(DISTINCT t.id) AS total_teachers
FROM departments d
LEFT JOIN teachers t ON t.dept_id = d.id
GROUP BY d.id, d.name
ORDER BY d.id;

SELECT
    d.name AS department,
    t.name AS teacher_name,
    y.name AS year_name,
    COUNT(ts.subject_id) AS assigned_subjects,
    GROUP_CONCAT(s.name ORDER BY s.id SEPARATOR ', ') AS subjects
FROM teacher_subjects ts
JOIN teachers t ON t.id = ts.teacher_id
JOIN departments d ON d.id = t.dept_id
JOIN subjects s ON s.id = ts.subject_id
JOIN years y ON y.id = s.year_id
GROUP BY d.id, t.id, y.id
ORDER BY d.id, t.id, y.id;

SELECT
    d.name AS department,
    t.name AS teacher_name,
    COUNT(ts.subject_id) AS total_assigned_subjects
FROM teachers t
JOIN departments d ON d.id = t.dept_id
LEFT JOIN teacher_subjects ts ON ts.teacher_id = t.id
GROUP BY d.id, t.id
ORDER BY d.id, t.id;

ALTER TABLE teacher_subjects
ADD CONSTRAINT unique_teacher_subject
UNIQUE (teacher_id, subject_id);

CREATE TABLE attendance_otp_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    year_id INT NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    teacher_latitude DECIMAL(10,8) NOT NULL,
    teacher_longitude DECIMAL(11,8) NOT NULL,
    allowed_radius INT NOT NULL DEFAULT 100,
    expires_at DATETIME NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (teacher_id) REFERENCES teachers(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (year_id) REFERENCES years(id)
);

INSERT INTO attendance (student_id, subject_id, date, status) VALUES

-- =========================
-- FY (Subjects 1-6)
-- =========================

(11,1,'2026-01-05','P'),
(11,1,'2026-01-12','P'),
(11,1,'2026-01-19','A'),
(11,1,'2026-01-26','P'),
(11,1,'2026-02-02','P'),

(11,2,'2026-01-05','P'),
(11,2,'2026-01-12','P'),
(11,2,'2026-01-19','P'),
(11,2,'2026-01-26','A'),
(11,2,'2026-02-02','P'),

(11,3,'2026-01-05','P'),
(11,3,'2026-01-12','A'),
(11,3,'2026-01-19','P'),
(11,3,'2026-01-26','P'),
(11,3,'2026-02-02','P'),

(11,4,'2026-01-05','P'),
(11,4,'2026-01-12','P'),
(11,4,'2026-01-19','P'),
(11,4,'2026-01-26','P'),
(11,4,'2026-02-02','P'),

(11,5,'2026-01-05','A'),
(11,5,'2026-01-12','P'),
(11,5,'2026-01-19','P'),
(11,5,'2026-01-26','P'),
(11,5,'2026-02-02','P'),

(11,6,'2026-01-05','P'),
(11,6,'2026-01-12','P'),
(11,6,'2026-01-19','P'),
(11,6,'2026-01-26','A'),
(11,6,'2026-02-02','P'),

-- =========================
-- SY (Subjects 7-12)
-- =========================

(11,7,'2026-06-10','P'),
(11,7,'2026-06-17','P'),
(11,7,'2026-06-24','A'),
(11,7,'2026-07-01','P'),
(11,7,'2026-07-08','P'),

(11,8,'2026-06-10','P'),
(11,8,'2026-06-17','P'),
(11,8,'2026-06-24','P'),
(11,8,'2026-07-01','P'),
(11,8,'2026-07-08','A'),

(11,9,'2026-06-10','P'),
(11,9,'2026-06-17','A'),
(11,9,'2026-06-24','P'),
(11,9,'2026-07-01','P'),
(11,9,'2026-07-08','P'),

(11,10,'2026-06-10','P'),
(11,10,'2026-06-17','P'),
(11,10,'2026-06-24','P'),
(11,10,'2026-07-01','A'),
(11,10,'2026-07-08','P'),

(11,11,'2026-06-10','P'),
(11,11,'2026-06-17','P'),
(11,11,'2026-06-24','P'),
(11,11,'2026-07-01','P'),
(11,11,'2026-07-08','P'),

(11,12,'2026-06-10','P'),
(11,12,'2026-06-17','A'),
(11,12,'2026-06-24','P'),
(11,12,'2026-07-01','P'),
(11,12,'2026-07-08','P');