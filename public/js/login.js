document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const correo = document.getElementById('correo').value;
  const password = document.getElementById('password').value;

 fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ correo_institucional: correo, password })
});

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem('token', data.token);

    switch (data.rol) {
      case 'DOCENTE_INVESTIGADOR':
        window.location.href = '/dashboard/docente.html';
        break;
      case 'JEFE_INVESTIGACION':
        window.location.href = '/dashboard/jefe.html';
        break;
      case 'DIRECTOR_GENERAL':
        window.location.href = '/dashboard/director.html';
        break;
      case 'COMITE_EDITOR':
        window.location.href = '/dashboard/editor.html';
        break;
      default:
        alert('Rol no reconocido');
    }
  } else {
    alert(data.message);
  }
});