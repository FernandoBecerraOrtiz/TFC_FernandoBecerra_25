FROM mysql:8.0

# Copiamos el init.sql para que MySQL lo ejecute en el primer arranque
COPY init.sql /docker-entrypoint-initdb.d/init.sql
