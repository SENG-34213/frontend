FROM node:22-alpine AS dependencies

WORKDIR /workspace/teacher
COPY teacher/package.json teacher/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder

WORKDIR /workspace/teacher
COPY --from=dependencies /workspace/teacher/node_modules ./node_modules
COPY teacher/ ./
COPY shared/ /workspace/shared/
COPY admin/ /workspace/admin/

ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_WS_BASE_URL=/api/ws
ARG NEXT_PUBLIC_APP_BASE_PATH=/teacher
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_WS_BASE_URL=${NEXT_PUBLIC_WS_BASE_URL}
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
COPY --from=builder --chown=nextjs:nodejs /workspace/teacher/.next/standalone/teacher/ ./
COPY --from=builder --chown=nextjs:nodejs /workspace/teacher/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
