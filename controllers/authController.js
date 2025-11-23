exports.login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    const [rows] = await db.execute(
      `SELECT u.*, r.rol 
       FROM usuarios u 
       JOIN roles_usuario r ON u.id = r.usuario_id 
       WHERE u.correo_institucional = ? AND u.estado = 'APROBADO' AND r.activo = 1`,
      [correo]
    );

    if (rows.length === 0) {
      return res.redirect('/?error=Usuario no autorizado');
    }

    const user = rows[0];
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.redirect('/?error=Credenciales incorrectas');
    }

    req.session.user = { id: user.id, rol: user.rol };

    // ✅ Redirige a HTML según rol
    switch (user.rol) {
      case 'DOCENTE_INVESTIGADOR':
        return res.redirect('/dashboard/docente.html');
      case 'JEFE_INVESTIGACION':
        return res.redirect('/dashboard/jefe.html');
      case 'DIRECTOR_GENERAL':
        return res.redirect('/dashboard/director.html');
      case 'COMITE_EDITOR':
        return res.redirect('/dashboard/editor.html');
      default:
        return res.redirect('/dashboard/docente.html');
    }
  } catch (err) {
    console.error(err);
    res.redirect('/?error=Error del servidor');
  }
};