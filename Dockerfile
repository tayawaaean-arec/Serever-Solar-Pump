# Use Node.js LTS as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files first for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose a port (optional for debugging purposes)
EXPOSE 3000

# Run the application
CMD ["node", "api/index.js"]
