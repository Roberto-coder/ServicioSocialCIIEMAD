# ---- Etapa 1: Builder ----
# Construye la aplicación
FROM node:20-alpine AS builder
WORKDIR /app

# Copia solo package.json y package-lock.json
COPY package*.json ./

# Instala TODAS las dependencias (incluyendo devDependencies para 'astro build')
RUN npm ci

# Copia el resto del código fuente
COPY . .

# Ejecuta el build
RUN npm run build

# ---- Etapa 2: Runner ----
# Crea la imagen final de producción
FROM node:20-alpine AS runner
WORKDIR /app

# Copiamos AMBOS archivos de package para poder usar 'npm ci'
COPY package.json ./
COPY package-lock.json ./  
# <--- CRÍTICO para 'npm ci'

# Instalamos SOLO las dependencias de producción
# Esto instalará 'clsx' y otras sub-dependencias necesarias
RUN npm ci --only=production

# Copia solo la app construida desde la etapa 'builder'
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV HOST=0.0.0.0

# El comando para iniciar el servidor de Node
CMD [ "npm", "start" ]