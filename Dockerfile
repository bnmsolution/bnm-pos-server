
# Use an official node runtime as a parent image
FROM node

# Set the working directory to /app
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

COPY .env ./app/src



# Copy the current directory contents into the container at /app
COPY lib /app


EXPOSE 3000

CMD ["node", "/lib/src"]