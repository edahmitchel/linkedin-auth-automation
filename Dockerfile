# Use an official Node runtime as a parent image
FROM node:18

# Puppeteer dependencies
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable

# Set the working directory in the container
WORKDIR /usr/src/app
# Install PM2 globally
RUN npm install pm2 -g

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Make port 3001 available to the world outside this container
EXPOSE 3001

# Run app.js with PM2 when the container launches
CMD ["npm", "start", "index.js"]