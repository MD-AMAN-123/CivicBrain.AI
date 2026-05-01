FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy all files (including pre-built dist)
COPY . .

# Expose port and start the server
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "start"]
