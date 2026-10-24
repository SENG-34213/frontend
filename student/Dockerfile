FROM node:22-alpine AS dependencies

WORKDIR /workspace/student
COPY student/package.json student/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder

WORKDIR /workspace/student
COPY --from=dependencies /workspace/student/node_modules ./node_modules
COPY student/ ./
COPY shared/ /workspace/shared/

ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_WS_BASE_URL=/api/ws
ARG NEXT_PUBLIC_APP_BASE_PATH=/student
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
COPY --from=builder --chown=nextjs:nodejs /workspace/student/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/student/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /workspace/student/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
