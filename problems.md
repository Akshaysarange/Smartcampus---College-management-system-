SMARTCAMPUS – SOFTWARE CHANGE & IMPROVEMENT

1. LOGIN PAGE

Problems

1. No Forgot Password option is available.
2. No Remember Me option is available.
3. No option is provided for a user who has forgotten their username.
4. There is no visible account-lock/security mechanism after repeated failed login attempts.
5. Login provides no additional authentication such as OTP or two-factor authentication.

New Features

1. Forgot Password option
2. Two-factor authentication.
3. Login activity/history.
4. Account lockout after multiple failed attempts.

Old Feature but New Change

1. Existing Password field → add a clearer show/hide password button.

Database Changes

- Add email/recovery contact to the user table if Forgot Password is introduced.
- Add OTP/reset-token table if OTP/password recovery is introduced.
- Add login-attempt/security-log table if login monitoring is introduced.

2. ADMIN – FIND TEACHER/STUDENT

Problems

1. Teacher and student searching are combined, which can become confusing with a large number of users.
2. Search should provide sufficient filtering options.
3. No department filter is available.
4. No year filter is available.
5. Sensitive user information should not be exposed through search results.

New Features

1. Separate Teacher/Student filter.
2. Department filter.
3. FY/SY/TY filter.
4. Sort by name, roll number or department.

Old Feature but New Change

1. Existing Search → add filter buttons.
2. Existing search results → display them in a structured table.
3. Existing Search → add a Clear Search button.
4. Existing user information → display only information necessary for Admin's task.

Database Changes

- Add indexes on username, roll number, department and year if search performance becomes an issue.

3. ADMIN – TEACHER MANAGEMENT

Problems

1. Teacher can be added or removed, but there is no proper Edit Teacher functionality.
2. Teacher assignment is difficult when many subjects are available.
3. Permanent removal is risky for academic records.

New Features

1. Edit Teacher.
2. Teacher timetable.
3. Teacher leave management.

Old Feature but New Change

1. Existing Add Teacher → add Edit option.
2. Existing subject selection → add Select All/Clear All.
3. Existing teacher list → display assigned subjects and years.

Database Changes

- Existing "teachers" table can store basic teacher information.
- For timetable → add "timetable" table.
- For teacher status → add "status" column to users/teachers.
- For leave management → add "teacher_leave" table.

4. ADMIN – STUDENT MANAGEMENT

Problems

1. Student can be added/removed but not properly edited.
2. Removing a student is risky.
3. No student photo/profile document facility.

New Features

1. Edit Student.
2. Student promotion from FY → SY → TY.
3. Student ID-card generation.
4. Student photo upload.

Old Feature but New Change

1. Existing Add Student → add email and additional academic information.
2. Existing Remove Student → introduce Archive/Deactivate.
3. Existing Student search → add department/year filters.

Database Changes

- Add "email" if possible.
- Add "profile_photo" if possible.

5. ADMIN – PROFILE

Problems

1. Admin cannot conveniently edit profile information.
2. Limited personal information is displayed.
3. No profile photo.
4. No last-login information.

New Features

1. Edit Profile.
2. Profile photo.
3. Email address.
4. Last-login information.

Old Feature but New Change

1. Existing Profile → add Edit Profile button.
2. Existing Phone Number → allow controlled editing.

Database Changes

- Login history requires a new "login_history" table.

6. ADMIN – CHANGE PASSWORD

Problems

1. Password requirements should be addded.
2. Password confirmation should be made explicit.
3. No password history is available.
4. No indication of password-change date.

New Features

1. Confirm New Password field.
2. Password history.

Old Feature but New Change

1. Existing New Password → show password strength.
2. Existing password fields → show requirements.

Database Changes

- Password history requires a "password_history" table.
- Password-change date can be stored in the user table.

7. TEACHER – FIND STUDENTS

Problems

1. Search functionality is limited.
2. No advanced filters.
3. No sorting facility.
4. Teacher cannot easily see all relevant academic information from the search result.

New Features

1. Filter by FY/SY/TY.
2. Search by roll number/name/username.
3. Sort students.

Old Feature but New Change

1. Existing Search → add filters.
2. Existing search result → display roll number, name, department and year together.

Database Changes

-no change in db

8. TEACHER – ATTENDANCE

Problems

1. Teacher has to select year, subject and date before taking attendance.
2. There is no convenient attendance calendar.
3. No complete attendance correction/history interface.

New Features

1. Mark All Present.
2. Mark All Absent.
4. Attendance calendar.

Old Feature but New Change

1. Existing Submit Attendance → show class, subject and date in confirmation.

Database Changes
no change in db

9. TEACHER – OTP ATTENDANCE

Problems

1. No strong visible protection against repeated OTP attempts.

New Features

1. OTP attempt limit.

Old Feature but New Change

Database Changes

-no change in db

10. TEACHER – DEFAULTER LIST

Problems

1. No subject-wise filter.
2. No date/semester filter.
3. No direct communication facility for defaulters. one to one connect

New Features

1. Subject-wise defaulter list.
2. Semester/month filter.
3. Export defaulter list.

Old Feature but New Change

2. Existing year selection → add subject selection.
3. Existing defaulter list → show exact attendance percentage and classes missed.

Database Changes

- Notifications require a notification table.

11. TEACHER – MARKS

Problems

1. No clear examination-type separation. regular or at-kt
2. No convenient preview before submission.
3. Re-entering marks if marks is updated.

New Features

1. examination types.
2. Marks editing.
3. Marks history.
4. Automatic grade calculation.
5. Export marks.

Old Feature but New Change

1. Existing Submit Marks → add confirmation.
2. Existing Subject selection → show only subjects assigned to the logged-in teacher.

Database Changes

- Existing marks table can continue storing student/subject marks.
- Add examination/exam-type table.
- Add "updated_at" for modification tracking.

12. TEACHER – PROFILE

Problems

1. Profile is primarily view-only.
2. Limited personal information.
3. No profile photo.
4. Assigned subjects are not prominently displayed.
5. No last-login information.

New Features

1. Edit Profile.
2. Profile photo.
3. Email.
4. Assigned-subject display.
5. Last-login information.

Old Feature but New Change

1. Existing Profile → add Edit Profile.
2. Existing Department → display assigned subjects/year.

Database Changes

- Email/profile photo require user fields if introduced.
- Login history requires a separate table.

13. TEACHER – CHANGE PASSWORD

Problems

1. No strong password guidance.
3. Password confirmation should be explicit.

New Features

1. Confirm password.
2. Password history.

Old Feature but New Change

1. Existing New Password → show requirements.

Database Changes

- Password history requires a separate table.

14. STUDENT – ATTENDANCE

Problems

1. No convenient subject/date/month filtering.

New Features

1. Attendance calendar.
2. Subject-wise attendance.
3. Attendance shortage warning.
4. Notification when attendance falls below threshold.(75%)

Old Feature but New Change

1. Existing Attendance History → add View All/Pagination.
2. Filtering in attendance history

Database Changes

- Notification table required for automated warnings.

15. STUDENT – RESULT

Problems

1. Result is mainly view-only.
2. No PDF download.
3. No print option.
4. SGPA/CGPA calculation should follow the college's or university official credit/grade rules.

New Features

1. Download Result as PDF.
2. Print Result.
3. Semester-wise result.
4. Grade and grade-point display.
5. Academic performance graph.
6. Result notifications.
7. Comparison between semesters.

Old Feature but New Change

1. Existing Year selection → automatically open latest available result.
2. Existing SGPA/CGPA → calculate according to official academic rules.
3. Existing marks table → show maximum marks, obtained marks, grade and grade point.
4. Existing result status → provide clearer subject-wise status.

Database Changes

- Performance graphs can be generated from existing marks without schema changes.

16. STUDENT – PROFILE

Problems

1. Profile is mainly view-only.
2. Limited personal information.
3. No profile photo.
4. No email shown.
5. No emergency contact information.

New Features

1. Edit Profile.
2. Profile photo.
3. Email.
4. Emergency contact.
5. Student ID-card details.

Old Feature but New Change

1. Existing Profile → add Edit Profile.
2. Existing Phone → allow controlled editing.

Database Changes

- Add email if required.
- Add profile photo field if required.
- Add emergency contact field.
- Student ID-card generation may reuse existing student information.

17. STUDENT – CHANGE PASSWORD

Problems

1. Password requirements are not clearly communicated. letters or numbs
2. Password confirmation should be explicit.
3. No password history.

New Features
1. log out button should be placed at top.
2. Confirm password.
3. Forgot-password.

Old Feature but New Change

1. Existing New Password → display password requirements.

Database Changes

- Password history requires a new table.
- Password reset requires reset-token/OTP storage.

18. GENERAL NAVIGATION / COMMON UI

Problems

1. Some navigation labels are not very user-friendly.
2. "Teacher Add/Remove" could be clearer.
3. "Student Add/Remove" could be clearer.
4. "Result Upload" can be confusing because the page is mainly for marks entry.

New Features

1. Dashboard/Home button, log out button at proper place.
2. Notifications.
3. Help/FAQ.

Old Feature but New Change

1. Existing "Teacher Add/Remove" → rename to "Manage Teachers."
2. Existing "Student Add/Remove" → rename to "Manage Students."
3. Existing "Result Upload" → rename to "Marks Management."
4. Existing Logout → add confirmation where appropriate.

Database Changes

- Notifications require a "notifications" table.

