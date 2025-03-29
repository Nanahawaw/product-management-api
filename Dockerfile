# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install 

# Copy the entire project
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose the app port
EXPOSE 5000

# Start the app (using built JavaScript)
CMD ["/bin/bash", "-c", "node dist/seeder/adminSeeder.js && node dist/app.js"]
