const fs = require('fs');
let s = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

s = s.replace(/type CareerOption = \{ id: number; name: string \};/, 'type CareerOption = { id: number; name: string; faculty?: any };');

s = s.replace(
  /const assignments = activeAssignmentsQuery\.data \|\| \[\];/,
  `// handle paginated response or array
         const rawData = activeAssignmentsQuery.data;
         const assignments = Array.isArray(rawData) ? rawData : (rawData?.results || []);`
);

s = s.replace(
  /const assign = assignments\.find\(a => getAssignmentStudentId\(a\) === student\.id\);/,
  `const assign = assignments.find((a: any) => getAssignmentStudentId(a) === student.id);`
);

fs.writeFileSync('src/app/dashboard/page.tsx', s);
