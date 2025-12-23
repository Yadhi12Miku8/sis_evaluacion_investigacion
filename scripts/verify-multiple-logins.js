const crypto = require('crypto');
const mysql = require('mysql2/promise');

const users = [
  { email: 'lcardenasp@institutocajas.edu.pe', pass: 'Lourdes123' },
  { email: 'lrodrigom@institutocajas.edu.pe', pass: 'Lucia123' },
  { email: 'lpuentey@institutocajas.edu.pe', pass: 'Luis123' },
  { email: 'jmerlog@institutocajas.edu.pe', pass: 'Juan123' },
  { email: 'ecarhuachir@institutocajas.edu.pe', pass: 'Ceferino123' },
  { email: 'fruizy@institutocajas.edu.pe', pass: 'Fabian123' },
  { email: 'rsandovall@institutocajas.edu.pe', pass: 'Ronald123' },
  { email: 'ocastrop@institutocajas.edu.pe', pass: 'Omar123' },
  { email: 'lbaldeonb@institutocajas.edu.pe', pass: 'Luz123' },
  { email: 'kmateoc@institutocajas.edu.pe', pass: 'Kevin123' },
  { email: 'lponcem@institutocajas.edu.pe', pass: 'LuisJ123' },
  { email: 'jricaldio@institutocajas.edu.pe', pass: 'Jisenia123' },
  { email: 'rmachad@institutocajas.edu.pe', pass: 'Romario123' },
  { email: 'vgaveq@institutocajas.edu.pe', pass: 'Vilma123' },
  { email: 'hhuamanp@institutocajas.edu.pe', pass: 'Hercules123' },
  { email: 'avilchezm@institutocajas.edu.pe', pass: 'Arturo123' },
  { email: 'lserranop@institutocajas.edu.pe', pass: 'Lizbeth123' },
  { email: 'emontess@institutocajas.edu.pe', pass: 'Edgard123' },
  { email: 'mmendozal@institutocajas.edu.pe', pass: 'Miguel123' },
  { email: 'mperezz@institutocajas.edu.pe', pass: 'Mesias123' },
  { email: 'pvitorr@institutocajas.edu.pe', pass: 'Pedro123' },
  { email: 'rvelascoc@institutocajas.edu.pe', pass: 'Roberto123' },
  { email: 'jsorianov@institutocajas.edu.pe', pass: 'Jose123' },
  { email: 'mvillasanal@institutocajas.edu.pe', pass: 'Marco123' },
  { email: 'jochoat@institutocajas.edu.pe', pass: 'JuanA123' },
  { email: 'rcanchucajav@institutocajas.edu.pe', pass: 'Rosalinda123' },
  { email: 'eparragao@institutocajas.edu.pe', pass: 'Elvis123' },
  { email: 'lbranese@institutocajas.edu.pe', pass: 'Lily123' },
  { email: 'eacunao@institutocajas.edu.pe', pass: 'Enrique123' },
  { email: 'azamudiom@institutocajas.edu.pe', pass: 'Anthony123' },
  { email: 'rcastilloq@institutocajas.edu.pe', pass: 'Rocio123' },
  { email: 'hegoavilv@institutocajas.edu.pe', pass: 'Heber123' },
  { email: 'ccunyasa@institutocajas.edu.pe', pass: 'ChristianE123' },
  { email: 'dlimasl@institutocajas.edu.pe', pass: 'Dafni123' },
  { email: 'lseguram@institutocajas.edu.pe', pass: 'LuisA123' },
  { email: 'acozr@institutocajas.edu.pe', pass: 'Alberto123' },
  { email: 'yfloress@institutocajas.edu.pe', pass: 'Yver123' },
  { email: 'ebarahonat@institutocajas.edu.pe', pass: 'Esther123' },
  { email: 'abravog@institutocajas.edu.pe', pass: 'Adolfo123' },
  { email: 'faldanal@institutocajas.edu.pe', pass: 'Franklin123' },
  { email: 'cricsep@institutocajas.edu.pe', pass: 'ChristianR123' },
  { email: 'cperezc@institutocajas.edu.pe', pass: 'Carlos123' },
  { email: 'cquinchor@institutocajas.edu.pe', pass: 'Celia123' }
];

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistema_investigacion_innovacion',
    waitForConnections: true,
    connectionLimit: 5
  });

  const results = [];

  for (const u of users) {
    try {
      const conn = await pool.getConnection();
      const [rows] = await conn.query('SELECT id, correo_institucional, password, rol, estado FROM usuarios WHERE correo_institucional = ?', [u.email]);
      conn.release();

      if (rows.length === 0) {
        results.push({ email: u.email, ok: false, reason: 'Usuario no encontrado' });
        continue;
      }

      const user = rows[0];
      const hash = crypto.createHash('sha256').update(u.pass).digest('hex');
      const passMatch = hash === user.password;
      results.push({ email: u.email, ok: passMatch, role: user.rol, estado: user.estado, hashGiven: hash, hashDb: user.password.substring(0, 10) });
    } catch (err) {
      results.push({ email: u.email, ok: false, reason: String(err) });
    }
  }

  console.log('\n=== INFORME DE VERIFICACIÓN ===\n');
  results.forEach(r => console.log(JSON.stringify(r)));

  // Close pool
  await pool.end();

  // Save report to file
  const fs = require('fs');
  fs.writeFileSync('scripts/verify-multiple-logins-report.json', JSON.stringify(results, null, 2));

  console.log('\nReporte guardado en scripts/verify-multiple-logins-report.json');

  process.exit(0);
})();