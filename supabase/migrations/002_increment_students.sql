-- 002: دالة لزيادة عدّاد الطلاب بشكل ذرّي (تصحيح خطأ enroll)
-- السبب: صياغة { increment: 1 } غير مدعومة في Supabase JS وكانت تفسد القيمة.

CREATE OR REPLACE FUNCTION increment_students_count(course_id_input UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE courses
  SET students_count = COALESCE(students_count, 0) + 1
  WHERE id = course_id_input;
$$;

-- السماح بالاستدعاء من الأدوار المصرّح لها
GRANT EXECUTE ON FUNCTION increment_students_count(UUID) TO authenticated, service_role;
