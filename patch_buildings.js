const fs = require('fs');
let s = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

s = s.replace(
/fetchClient\('\/api\/v1\/grupos\/'\)\s*\.then\(\(res: any\) => \{ if \(!mounted\) return; setGroups\(res\.results \|\| res\); \}\)\s*\.catch\(\(\) => \{\}\)\s*;/s,
`fetchClient('/api/v1/grupos/')
      .then((res: any) => { if (!mounted) return; setGroups(res.results || res); })
      .catch(() => {})
    ;

    fetchClient('/api/v1/edificios/')
      .then((res: any) => { if (!mounted) return; setBuildings(res.results || res); })
      .catch(() => {})
    ;`
);

fs.writeFileSync('src/app/dashboard/page.tsx', s);
