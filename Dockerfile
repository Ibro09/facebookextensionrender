# Use the Puppeteer base image with Chromium pre-installed
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Environment variables to configure Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \

# Copy package files to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy application code to the container
COPY . .

# Verify Chromium installation (optional)
RUN google-chrome-stable --version

# Expose any application port if required (e.g., 3000 for web server)
EXPOSE 3000

# Command to run the Node.js application
CMD ["node", "index.js"]


