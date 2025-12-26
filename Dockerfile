FROM node:20-alpine

WORKDIR /app

COPY package.json yarn.lock* ./
COPY .yarnrc.yml ./

RUN corepack enable && yarn install --immutable || yarn install

COPY . .

RUN yarn build

EXPOSE 8080

CMD ["sh", "-c", "yarn sequelize-cli db:migrate && node dist/index.js"]

