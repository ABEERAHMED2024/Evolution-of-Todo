# Use an official Node runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the frontend application code into the container
COPY frontend/ .

# Build the Next.js application for production
RUN npm run build

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Run the command to start the frontend application
CMD ["npm", "start"]