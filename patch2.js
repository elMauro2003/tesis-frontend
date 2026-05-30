const fs = require('fs');
let s = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const t1 = s.indexOf('const careerFilteredStudents = useMemo(() => {');
const t2 = s.indexOf('const totalPages = Math.max');

if (t1 !== -1 && t2 !== -1) {
  const newBlock = `const facultyFilteredStudents = useMemo(() => {
      if (facultyId === 'all') return allStudents;
      return allStudents.filter((student) => {
        const g = resolveStudentGroup(student);
        if (!g?.career_year) return false;
        let cId = null;
        if (typeof g.career_year.career === 'object' && g.career_year.career) {
          cId = g.career_year.career.id;
        } else if (typeof g.career_year.career === 'number') {
          cId = g.career_year.career;
        }
        if (cId === null) return false;
        const careerObj = careers.find(c => c.id === cId);
        const fId = careerObj ? careerObj.faculty : null;
        const actualFId = typeof fId === 'object' && fId !== null ? fId.id : fId;
        return actualFId === facultyId;
      });
    }, [allStudents, facultyId, careers, groups]);

    const buildingFilteredStudents = useMemo(() => {
      if (buildingId === 'all') return facultyFilteredStudents;
      return facultyFilteredStudents.filter((student) => {
         const assignments = activeAssignmentsQuery.data || [];
         const assign = assignments.find(a => getAssignmentStudentId(a) === student.id);
         if (!assign || !assign.room) return false;
         
         const roomObj = typeof assign.room === 'object' ? assign.room : null;
         if (roomObj && typeof roomObj.wing === 'object') {
             const b = typeof roomObj.wing.building === 'object' ? roomObj.wing.building.id : roomObj.wing.building;
             return b === buildingId;
         }
         return false;
      });
    }, [facultyFilteredStudents, buildingId, activeAssignmentsQuery.data]);

    const locationFilteredStudents = useMemo(() => {
      if (locationFilter === 'all') return buildingFilteredStudents;
      return buildingFilteredStudents.filter((student: any) => {
        const hasRoom = typeof student.has_room === 'boolean' 
             ? student.has_room 
             : assignedStudentIds.has(student.id);
        return locationFilter === 'with_room' ? hasRoom : !hasRoom;
      });
    }, [buildingFilteredStudents, assignedStudentIds, locationFilter]);\n\n    `;
  s = s.substring(0, t1) + newBlock + s.substring(t2);
}

fs.writeFileSync('src/app/dashboard/page.tsx', s);
