-- Fase 2: agregar duracion_minutos a servicios existentes (Supabase)
-- Ejecutar si ya corriste seed_catalogo_stylefactory.sql antes de esta columna.

ALTER TABLE servicios
ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER NOT NULL DEFAULT 60;

UPDATE servicios SET duracion_minutos = 45  WHERE id_servicio = 1;
UPDATE servicios SET duracion_minutos = 120 WHERE id_servicio = 2;
UPDATE servicios SET duracion_minutos = 150 WHERE id_servicio = 3;
UPDATE servicios SET duracion_minutos = 30  WHERE id_servicio = 4;
UPDATE servicios SET duracion_minutos = 90  WHERE id_servicio = 5;
UPDATE servicios SET duracion_minutos = 120 WHERE id_servicio = 6;
UPDATE servicios SET duracion_minutos = 60  WHERE id_servicio = 7;
UPDATE servicios SET duracion_minutos = 150 WHERE id_servicio = 8;
UPDATE servicios SET duracion_minutos = 60  WHERE id_servicio = 9;
UPDATE servicios SET duracion_minutos = 45  WHERE id_servicio = 10;
