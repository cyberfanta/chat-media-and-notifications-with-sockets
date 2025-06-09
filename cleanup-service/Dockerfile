FROM node:18-alpine

# Instalar wget para healthchecks
RUN apk add --no-cache wget

# Crear usuario no root para seguridad ANTES de crear archivos
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Crear y configurar directorio de trabajo
RUN mkdir -p /app && chown nestjs:nodejs /app
WORKDIR /app

# Crear directorios de logs con ownership correcto
RUN mkdir -p /app/logs && chown nestjs:nodejs /app/logs

# Cambiar a usuario no-root ANTES de copiar archivos
USER nestjs

# Copiar archivos de dependencias
COPY --chown=nestjs:nodejs package*.json ./
COPY --chown=nestjs:nodejs tsconfig.json ./
COPY --chown=nestjs:nodejs nest-cli.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente con ownership correcto
COPY --chown=nestjs:nodejs src/ ./src/

# Limpiar directorio dist si existe para desarrollo
RUN rm -rf dist

# Exponer puerto
EXPOSE 5905

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5905

# Comando de inicio
CMD ["npm", "run", "start:dev"] 