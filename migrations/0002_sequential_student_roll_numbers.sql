ALTER TABLE students DROP INDEX roll_no;

ALTER TABLE students ADD UNIQUE KEY unique_roll (dept_id, year_id, roll_no);

SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 1 AND year_id = 1 ORDER BY id;
SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 1 AND year_id = 2 ORDER BY id;
SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 1 AND year_id = 3 ORDER BY id;
SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 2 AND year_id = 1 ORDER BY id;
SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 2 AND year_id = 2 ORDER BY id;
SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 2 AND year_id = 3 ORDER BY id;
SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 3 AND year_id = 1 ORDER BY id;
SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 3 AND year_id = 2 ORDER BY id;
SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 3 AND year_id = 3 ORDER BY id;
SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 4 AND year_id = 1 ORDER BY id;
SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 4 AND year_id = 2 ORDER BY id;
SET @r := 0;
UPDATE students SET roll_no = (@r := @r + 1) WHERE dept_id = 4 AND year_id = 3 ORDER BY id;