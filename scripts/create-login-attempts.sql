CREATE TABLE IF NOT EXISTS login_attempts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  correo_institucional VARCHAR(150) NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address VARCHAR(45),
  fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_correo (correo_institucional),
  INDEX idx_fecha (fecha_intento)
);