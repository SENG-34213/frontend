FROM node:22-alpine AS dependencies

WORKDIR /workspace/admin
COPY admin/package.json admin/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder

WORKDIR /workspace/admin
COPY --from=dependencies /workspace/admin/node_modules ./node_modules
COPY admin/ ./
COPY shared/ /workspace/shared/

ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_APP_BASE_PATH=/admin
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_APP_BASE_PATH=${NEXT_PUBLIC_APP_BASE_PATH}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /workspace/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/admin/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
