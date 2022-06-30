FROM node:16-alpine
WORKDIR /app
RUN apk update && apk upgrade && apk add bash
COPY .eslintrc.js ./
COPY package.json ./
COPY tsconfig.json ./
RUN npm install
COPY src ./src
RUN npm run build
CMD ["node", "dist"]
