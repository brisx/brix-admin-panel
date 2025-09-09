FROM node:18-alpine

# Set working directory INSIDE container
WORKDIR /app

# First copy package files
COPY package*.json ./

# Install dependencies INSIDE container
RUN npm install

# Then copy everything else
COPY . .

# Now build (node_modules exist in /app/node_modules inside container)
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
