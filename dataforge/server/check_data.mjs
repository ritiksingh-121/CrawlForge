import sequelize from './src/config/database.js';
await sequelize.authenticate();

const projects = await sequelize.query(
  `SELECT id, name, fields, "totalRows" FROM "Projects" ORDER BY "createdAt" DESC LIMIT 5`,
  { type: 'SELECT' }
);

for (const p of projects) {
  console.log('=== Project:', p.name, '===');
  console.log('Fields:', JSON.stringify(p.fields));
  console.log('totalRows:', p.totalRows);
  
  const data = await sequelize.query(
    `SELECT id, data, "batchId", "createdAt" FROM "ScrapedData" WHERE "projectId" = $1 ORDER BY "createdAt" DESC LIMIT 3`,
    { type: 'SELECT', bind: [p.id] }
  );
  console.log('ScrapedData count:', data.length);
  for (const d of data) {
    console.log('  data:', JSON.stringify(d.data));
    console.log('  data type:', typeof d.data);
    if (typeof d.data === 'string') {
      console.log('  ** data is a STRING, not object! **');
      try {
        const parsed = JSON.parse(d.data);
        console.log('  parsed keys:', Object.keys(parsed));
      } catch(e) {
        console.log('  could not parse');
      }
    } else if (typeof d.data === 'object' && d.data !== null) {
      console.log('  keys:', Object.keys(d.data));
    }
  }
}

await sequelize.close();
