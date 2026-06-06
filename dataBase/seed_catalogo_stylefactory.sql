-- =============================================================================
-- Style Factory — Seed catálogo (estilistas + servicios)
-- Alineado con el frontend: empleadoId 1-6 y servicio id 1-10
-- Ejecutar en Supabase → SQL Editor (PostgreSQL)
-- =============================================================================
-- IMPORTANTE:
-- 1. Revisa si ya tienes reservas/clientes que dependan de empleados viejos.
-- 2. Las tablas deben coincidir con Hibernate (Spring Boot en Render).
-- 3. Contraseña de estilistas (solo si algún día inician sesión): "password"
--    (hash BCrypt estándar de Spring Security).
-- =============================================================================

BEGIN;

-- Opcional: limpiar reservas de prueba que apunten a empleados/servicios viejos
-- DELETE FROM reservas;

-- -----------------------------------------------------------------------------
-- USUARIOS ESTILISTAS (rol EMPLEADO = enum JPA en mayúsculas)
-- -----------------------------------------------------------------------------
INSERT INTO usuarios (nombre, correo, telefono, contrasena, rol, estado) VALUES
('Ana García',       'ana.garcia@stylefactory.local',       '3001110001', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLEADO', true),
('Laura Martínez',   'laura.martinez@stylefactory.local',   '3001110002', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLEADO', true),
('Camila Rodríguez', 'camila.rodriguez@stylefactory.local', '3001110003', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLEADO', true),
('Valentina López',  'valentina.lopez@stylefactory.local',  '3001110004', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLEADO', true),
('Daniel Herrera',   'daniel.herrera@stylefactory.local',   '3001110005', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLEADO', true),
('Santiago Ruiz',    'santiago.ruiz@stylefactory.local',      '3001110006', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EMPLEADO', true)
ON CONFLICT (correo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  telefono = EXCLUDED.telefono,
  rol = EXCLUDED.rol,
  estado = EXCLUDED.estado;

-- -----------------------------------------------------------------------------
-- EMPLEADOS (id 1-6 = empleadoId en reservations.js)
-- Columna PK: "id" (Hibernate). FK: usuario_id → usuarios.id_usuario
-- -----------------------------------------------------------------------------
INSERT INTO empleados (id, usuario_id, especialidad, estado, url) VALUES
(1, (SELECT id_usuario FROM usuarios WHERE correo = 'ana.garcia@stylefactory.local'),       'Colorimetría',                          true, 'https://enithv.github.io/stylefactory/assets/images/empleados/sty1.png'),
(2, (SELECT id_usuario FROM usuarios WHERE correo = 'laura.martinez@stylefactory.local'),   'Cortes y peinados',                     true, 'https://enithv.github.io/stylefactory/assets/images/empleados/sty2.png'),
(3, (SELECT id_usuario FROM usuarios WHERE correo = 'camila.rodriguez@stylefactory.local'), 'Tratamientos capilares',                true, 'https://enithv.github.io/stylefactory/assets/images/empleados/sty3.png'),
(4, (SELECT id_usuario FROM usuarios WHERE correo = 'valentina.lopez@stylefactory.local'),  'Alisados y keratina',                   true, 'https://enithv.github.io/stylefactory/assets/images/empleados/sty4.png'),
(5, (SELECT id_usuario FROM usuarios WHERE correo = 'daniel.herrera@stylefactory.local'),   'Corte caballero y barba',               true, 'https://enithv.github.io/stylefactory/assets/images/empleados/sty5.png'),
(6, (SELECT id_usuario FROM usuarios WHERE correo = 'santiago.ruiz@stylefactory.local'),    'Barbería clásica y perfilado de barba', true, 'https://enithv.github.io/stylefactory/assets/images/empleados/sty6.png')
ON CONFLICT (id) DO UPDATE SET
  usuario_id = EXCLUDED.usuario_id,
  especialidad = EXCLUDED.especialidad,
  estado = EXCLUDED.estado,
  url = EXCLUDED.url;

-- -----------------------------------------------------------------------------
-- SERVICIOS (id_servicio 1-10 = id en catalogoServicios.js)
-- duracion_minutos: tiempo estimado para reservas (Fase 2)
-- -----------------------------------------------------------------------------
INSERT INTO servicios (id_servicio, nombre, descripcion, url_imagen, estado, precio, tipo, duracion_minutos) VALUES
(1,  'Corte de Cabello Premium', 'Corte moderno con técnicas personalizadas según tu tipo de cabello.', 'https://enithv.github.io/stylefactory/assets/images/servicios/corte-premium.png', true, 45000,  'Corte',       45),
(2,  'Tinte y Coloración',       'Coloración de alta calidad con marcas premium. Resultados duraderos.', 'https://enithv.github.io/stylefactory/assets/images/servicios/tinte-coloracion.png', true, 120000, 'Color',       120),
(3,  'Tratamiento de Keratina',  'Alisado profundo que elimina el frizz y deja el cabello sedoso.',       'https://enithv.github.io/stylefactory/assets/images/servicios/keratina.png', true, 180000, 'Tratamiento', 150),
(4,  'Barba y Afeitado',         'Servicio completo de perfilado de barba y afeitado clásico.',           'https://enithv.github.io/stylefactory/assets/images/servicios/barba-afeitado.png', true, 35000,  'Barbería',    30),
(5,  'Peinado para Eventos',     'Peinados profesionales para bodas, graduaciones y eventos especiales.', 'https://enithv.github.io/stylefactory/assets/images/servicios/peinado-eventos.png', true, 80000,  'Peinado',     90),
(6,  'Mechas y Reflejos',        'Técnicas de mechas californianas, babylights y reflejos.',              'https://enithv.github.io/stylefactory/assets/images/servicios/mechas-reflejos.png', true, 150000, 'Color',       120),
(7,  'Tratamiento Capilar',      'Hidratación y nutrición profunda para cabello maltratado.',             'https://enithv.github.io/stylefactory/assets/images/servicios/tratamiento-capilar.png', true, 65000,  'Tratamiento', 60),
(8,  'Cepillado Brasileño',      'Alisado progresivo que reduce el volumen y da brillo.',                 'https://enithv.github.io/stylefactory/assets/images/servicios/cepillado-brasileno.png', true, 160000, 'Tratamiento', 150),
(9,  'Maquillaje Profesional',   'Maquillaje para ocasiones especiales con productos de alta calidad.',   'https://enithv.github.io/stylefactory/assets/images/servicios/maquillaje-profesional.png', true, 90000,  'Estética',    60),
(10, 'Limpieza Facial',          'Tratamiento facial profundo para eliminar impurezas y revitalizar.',    'https://enithv.github.io/stylefactory/assets/images/servicios/limpieza-facial.png', true, 70000,  'Estética',    45)
ON CONFLICT (id_servicio) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_imagen = EXCLUDED.url_imagen,
  estado = EXCLUDED.estado,
  precio = EXCLUDED.precio,
  tipo = EXCLUDED.tipo,
  duracion_minutos = EXCLUDED.duracion_minutos;

-- Ajustar secuencias SERIAL para futuros INSERT sin chocar IDs
SELECT setval(pg_get_serial_sequence('usuarios', 'id_usuario'), (SELECT COALESCE(MAX(id_usuario), 1) FROM usuarios));
SELECT setval(pg_get_serial_sequence('empleados', 'id'), (SELECT COALESCE(MAX(id), 1) FROM empleados));
SELECT setval(pg_get_serial_sequence('servicios', 'id_servicio'), (SELECT COALESCE(MAX(id_servicio), 1) FROM servicios));

COMMIT;

-- Verificación rápida:
-- SELECT id, especialidad FROM empleados ORDER BY id;
-- SELECT id_servicio, nombre, precio FROM servicios ORDER BY id_servicio;
