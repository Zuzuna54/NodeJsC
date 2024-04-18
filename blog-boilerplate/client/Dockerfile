# Spcify base image for node applications 
FROM node:alpine
# Specify the working directory
WORKDIR /usr/app/post
# Copy the package.json file to the working directory
COPY ./package.json ./
# Install dependencies
RUN npm install
# Copy the rest of the files to the working directory
COPY ./ ./
# Default command
CMD ["npm", "start"]