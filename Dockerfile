FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# 🔥 CRITICAL: Pass Railway environment variables as build arguments
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ADMIN_TOKEN

# Set them as environment variables for the build
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ADMIN_TOKEN=$NEXT_PUBLIC_ADMIN_TOKEN

# Optional: Set default Clerk URLs if not already set
ENV NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
ENV NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
ENV NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/




# Add this before the build command to debug
RUN echo "Checking environment variables..."
RUN echo "CLERK_PUBLISHABLE: $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
RUN echo "API_URL: $NEXT_PUBLIC_API_URL"

# Now build with all required environment variables
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
