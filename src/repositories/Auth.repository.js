const db = require('../database/connection');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class AuthRepository {
    parseCrFile() {
        const filePath = 'c:\\xampp\\htdocs\\sis_evaluacion_investigacion\\cr.txt';
        if (!fs.existsSync(filePath)) return [];
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
        const creds = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (i === 0 && line.toLowerCase().includes('correo')) continue;
            const emailMatch = line.match(/[\w.+-]+@[^\s]+/);
            if (!emailMatch) continue;
            const email = emailMatch[0];
            const afterEmail = line.split(email)[1].trim();
            const parts = afterEmail.split(/\s+/).filter(Boolean);
            const password = parts[0] || '';
            const roleHint = parts.slice(1).join(' ').trim();
            if (email && password) {
                creds.push({ email, password, roleHint });
            }
        }
        return creds;
    }

    getCrCredentialByEmail(email) {
        const list = this.parseCrFile();
        const found = list.find(x => x.email.toLowerCase() === String(email).toLowerCase());
        return found || null;
    }

    async updatePasswordByEmail(email, newPasswordHash) {
        const sql = `UPDATE usuarios SET password = ? WHERE correo_institucional = ?`;
        await db.query(sql, [newPasswordHash, email]);
        return true;
    }

    async updateRoleByEmail(email, newRole) {
        const sql = `UPDATE usuarios SET rol = ? WHERE correo_institucional = ?`;
        await db.query(sql, [newRole, email]);
        return true;
    }
    async authenticate(email, password) {
        try {
            const sql = `
                SELECT * FROM usuarios 
                WHERE correo_institucional = ? 
                AND estado = 'Activo'
                LIMIT 1
            `;
            
            const resultado = await db.query(sql, [email]);
            const usuario = resultado.length > 0 ? resultado[0] : null;
            
            if (!usuario) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            // Verificar contraseña SHA256 (legado)
            const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
            
            if (hashedPassword !== usuario.password) {
                const crCred = this.getCrCredentialByEmail(email);
                if (!crCred) {
                    return { success: false, message: 'Contraseña incorrecta' };
                }
                if (password === crCred.password) {
                    const newHash = crypto.createHash('sha256').update(crCred.password).digest('hex');
                    await this.updatePasswordByEmail(email, newHash);
                    usuario.password = newHash;
                    if (crCred.roleHint) {
                        const hint = crCred.roleHint.toLowerCase();
                        let mappedRole = usuario.rol;
                        if (hint.includes('admin')) mappedRole = 'Administrador';
                        else if (hint.includes('jefe')) mappedRole = 'Jefe de Unidad de Investigacion';
                        else if (hint.includes('director')) mappedRole = 'Director General';
                        else if (hint.includes('comite')) mappedRole = 'Comite Editor';
                        if (mappedRole !== usuario.rol) {
                            await this.updateRoleByEmail(email, mappedRole);
                            usuario.rol = mappedRole;
                        }
                    }
                } else {
                    return { success: false, message: 'Contraseña incorrecta' };
                }
            }

            // Aplicar pista de rol aunque la contraseña ya coincida
            const crCredFinal = this.getCrCredentialByEmail(email);
            if (crCredFinal && crCredFinal.roleHint) {
                const hint = crCredFinal.roleHint.toLowerCase();
                let mappedRole = usuario.rol;
                if (hint.includes('admin')) mappedRole = 'Administrador';
                else if (hint.includes('jefe')) mappedRole = 'Jefe de Unidad de Investigacion';
                else if (hint.includes('director')) mappedRole = 'Director General';
                else if (hint.includes('comite')) mappedRole = 'Comite Editor';
                if (mappedRole !== usuario.rol) {
                    await this.updateRoleByEmail(email, mappedRole);
                    usuario.rol = mappedRole;
                }
            }

            return { 
                success: true, 
                usuario: usuario,
                message: 'Autenticación exitosa'
            };
        } catch (error) {
            console.error('Error en authenticate:', error);
            return { success: false, message: 'Error en autenticación' };
        }
    }

    async obtenerPorCorreo(correo) {
        try {
            const query = 'SELECT * FROM usuarios WHERE correo_institucional = ?';
            const resultado = await db.query(query, [correo]);
            return resultado.length > 0 ? resultado[0] : null;
        } catch (err) {
            console.error('Error en repositorio:', err);
            throw err;
        }
    }

    async obtenerPorId(id) {
        try {
            const query = 'SELECT id, nombres, apellidos, correo_institucional, rol, estado FROM usuarios WHERE id = ?';
            const resultado = await db.query(query, [id]);
            return resultado.length > 0 ? resultado[0] : null;
        } catch (err) {
            console.error('Error en repositorio:', err);
            throw err;
        }
    }
}

module.exports = new AuthRepository();
