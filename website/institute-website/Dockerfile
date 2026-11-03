FROM node:22-alpine AS dependencies

WORKDIR /workspace/website/institute-website
COPY website/institute-website/package.json website/institute-website/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder

WORKDIR /workspace/website/institute-website
COPY --from=dependencies /workspace/website/institute-website/node_modules ./node_modules
COPY website/institute-website/ ./

ARG NEXT_PUBLIC_STUDENT_PORTAL_URL=/student/
ARG NEXT_PUBLIC_TEACHER_PORTAL_URL=/teacher/
ARG NEXT_PUBLIC_ADMIN_PORTAL_URL=/admin/
ENV NEXT_PUBLIC_STUDENT_PORTAL_URL=${NEXT_PUBLIC_STUDENT_PORTAL_URL}
ENV NEXT_PUBLIC_TEACHER_PORTAL_URL=${NEXT_PUBLIC_TEACHER_PORTAL_URL}
ENV NEXT_PUBLIC_ADMIN_PORTAL_URL=${NEXT_PUBLIC_ADMIN_PORTAL_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /workspace/website/institute-website/.next/standalone/ ./
COPY --from=builder --chown=nextjs:nodejs /workspace/website/institute-website/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /workspace/website/institute-website/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
