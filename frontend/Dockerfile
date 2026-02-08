# --- Build Stage ---
FROM public.ecr.aws/docker/library/node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install dependencies
RUN npm install

COPY . .

# Build the React app
RUN npm run build

# --- Production Stage ---
FROM public.ecr.aws/docker/library/nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
