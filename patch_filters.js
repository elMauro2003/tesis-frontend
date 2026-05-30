const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// Replace careerFilteredStudents -> facultyFilteredStudents and add buildingFilteredStudents
content = content.replace(
/const careerFilteredStudents = useMemo\(\(\) => \{.+?\n    \}, \[allStudents, careerId\]\);/s,
`const facultyFilteredStudents = useMemo(() => {
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
    }, [facultyFilteredStudents, buildingId, activeAssignmentsQuery.data]);`
);

// Replace locationFilteredStudents reference to careerFilteredStudents -> buildingFilteredStudents
content = content.replace(
/const locationFilteredStudents = useMemo\(\(\) => \{.+?return careerFilteredStudents\.filter.+?\}, \[careerFilteredStudents, assignedStudentIds, locationFilter\]\);/s,
`const locationFilteredStudents = useMemo(() => {
      if (locationFilter === 'all') return buildingFilteredStudents;
      return buildingFilteredStudents.filter((student) => {
        const hasRoom = typeof student.has_room === 'boolean' 
             ? student.has_room 
             : assignedStudentIds.has(student.id);
        return locationFilter === 'with_room' ? hasRoom : !hasRoom;
      });
    }, [buildingFilteredStudents, assignedStudentIds, locationFilter]);`
);

// Replace queryKeys
content = content.replace(/careerId, groupId/g, "facultyId, buildingId");

// Replace selects in UI
content = content.replace(
/<select value=\{careerId\} onChange=\{\(e\) => setCareerId\(e.target.value === 'all'\s*\?\s*'all'\s*:\s*Number\(e.target.value\)\)\}.+?<\/select>/s,
`<select value={facultyId} onChange={(e) => setFacultyId(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="appearance-none bg-surface-container-low border-none rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors focus:ring-0 outline-none">
                <option value="all">Todas las Facultades</option>
                {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>`
);

content = content.replace(
/<select value=\{groupId\}.+?<\/select>/s,
`<select value={buildingId} onChange={(e) => setBuildingId(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="appearance-none bg-surface-container-low border-none rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors focus:ring-0 outline-none">
                <option value="all">Todos los Edificios</option>
                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>`
);

// Replace icons for those selects
content = content.replace(
/<div className="absolute right-3 top-1\/2 -translate-y-1\/2 pointer-events-none text-on-surface-variant\/60">.*?<svg.*?path d="M12 14l9-5-9-5-9 5 9 5z".*?<\/svg>.*?<\/div>/s,
`<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/60">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>`
);

fs.writeFileSync('src/app/dashboard/page.tsx', content);
