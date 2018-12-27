
# Use an official node runtime as a parent image
FROM node

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app


EXPOSE 3000

CMD ["node", "/app/lib/index"]