-- Crear usuario admin si no existe
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles 
      WHERE  rolname = 'admin') THEN
      
      CREATE ROLE admin LOGIN PASSWORD 'admin123';
   END IF;
END
$do$;

-- Asegurar que admin tenga todos los permisos
ALTER USER admin CREATEDB;
ALTER USER admin SUPERUSER;

-- Conectar a la base de datos auth_db
\c auth_db

-- Otorgar todos los permisos al usuario admin en la base de datos
GRANT ALL PRIVILEGES ON DATABASE auth_db TO admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;

-- Configuración adicional para permitir conexiones
ALTER SYSTEM SET listen_addresses = '*';
SELECT pg_reload_conf(); 