FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .


# 🔥 DISABLE TURBOPACK - Use standard Webpack build
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
