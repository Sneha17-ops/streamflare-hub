
 STAGE 1: INSTALL DEPENDENCIES

FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps


 STAGE 2: BUILD APP

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Turn off next telemetry during builds
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


 STAGE 3: RUNNER

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

 Expose port 3000 for server
EXPOSE 3000

 Copy compiled public assets and builds
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "run", "start"]