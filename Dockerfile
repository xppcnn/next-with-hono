# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set build args as environment variables
ARG RESEND_API_KEY
ARG RESEND_FROM_EMAIL
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV RESEND_FROM_EMAIL=${RESEND_FROM_EMAIL}

# Build Next.js
RUN pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder
COPY --from=builder /app/.next ./.next

# Expose port
EXPOSE 3000

# Start application
CMD ["pnpm", "start"]
