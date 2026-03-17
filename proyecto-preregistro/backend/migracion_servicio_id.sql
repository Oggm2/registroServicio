-- Migración: agregar servicio_id a asistencias_feria (C1)
-- Ejecutar en la base de datos Feria_Servicios

ALTER TABLE asistencias_feria
  ADD COLUMN IF NOT EXISTS servicio_id INTEGER
    REFERENCES servicios(id) ON DELETE SET NULL;
