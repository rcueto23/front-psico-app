# Etapa 1: Dependencias
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci

# Etapa 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar node_modules desde deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variable de entorno para Next.js
ENV NEXT_TELEMETRY_DISABLED=1

# Construir la aplicación
RUN npm run build

# Etapa 3: Producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Exponer puerto
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
