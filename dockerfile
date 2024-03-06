FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
# Install app dependencies


ENV COLLECTION = mongodb+srv://umaiz:abc123456@cluster0.yqttf.mongodb.net/Henri
ENV TOKEN_KEY = sdadsdasdasdaeert
ENV DB_NAME = henri
ENV PORT = 5000


RUN npm install && npm install pm2 -g


# Bundle your app source code into the container
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Define the command to run your app
CMD ["pm2-runtime", "start", "index.js"]