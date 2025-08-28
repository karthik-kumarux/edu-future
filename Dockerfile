FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Install TypeScript type declarations
RUN npm install --save-dev @types/nodemailer @types/uuid @types/cors

# Build the application
RUN npm run build

# Set environment variables if needed
# ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "start"]
