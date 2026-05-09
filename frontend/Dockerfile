FROM node:20-alpine

WORKDIR /app

# Install deps first for better caching
COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
