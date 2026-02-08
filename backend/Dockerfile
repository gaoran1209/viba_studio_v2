FROM public.ecr.aws/docker/library/node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install all dependencies (including devDependencies for build)
RUN npm install

COPY . .

# Build the TypeScript code
RUN npm run build

# --- Production Stage ---
FROM public.ecr.aws/docker/library/node:22-alpine

WORKDIR /app

COPY package*.json ./
# Install only production dependencies
RUN npm install --only=production

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Start command
CMD ["npm", "start"]
