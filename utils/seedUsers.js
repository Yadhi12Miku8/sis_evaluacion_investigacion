const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const db = require('../models/db');

const workbook = xlsx.readFile('./database/InformacionGeneral_Investigacion.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

const dashboards = ['docente', 'jefe', 'director', 'editor'];
let index = 0;

async function seedUsers() {
  for (const row of data) {
    const correo = row['Correo electrónico'];
    const nombres = row['Nombre'];
    const dni = String(row['ID']).padStart(8, '0');
    const programa = row['programa de estudios'] || 'Sin programa';
    const password = String(Math.floor(10000000 + Math.random() * 90000000)); // 8 dígitos

    const [existing] = await db.execute(
      'SELECT id FROM usuarios WHERE correo_institucional = ?',
      [correo]
    );

    if (existing.length === 0) {
      const hash = bcrypt.hashSync(password, 10);
      const [res] = await db.execute(
        `INSERT INTO usuarios (dni, nombres, apellidos, correo_institucional, programa_estudios, password_hash, estado)
         VALUES (?, ?, ?, ?, ?, ?, 'APROBADO')`,
        [dni, nombres, '', correo, programa, hash]
      );

      const rol = index < 4 ? 
        ['DOCENTE_INVESTIGADOR', 'JEFE_INVESTIGACION', 'DIRECTOR_GENERAL', 'COMITE_EDITOR'][index] :
        'DOCENTE_INVESTIGADOR';

      await db.execute(
        'INSERT INTO roles_usuario (usuario_id, rol) VALUES (?, ?)',
        [res.insertId, rol]
      );

      console.log(`✅ ${correo} → ${password} → ${rol}`);
      index++;
    }
  }
  console.log('✅ Todos los usuarios cargados');
  process.exit();
}

seedUsers();