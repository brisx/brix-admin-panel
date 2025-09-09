FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# 🔥 CLEAN INSTALL - Remove existing node_modules and do fresh install
RUN rm -rf node_modules package-lock.json
RUN npm install

# Copy source code
COPY . .

# Set build-time environment variables
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
ENV CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_ADMIN_TOKEN=${NEXT_PUBLIC_ADMIN_TOKEN}
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Now build
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
