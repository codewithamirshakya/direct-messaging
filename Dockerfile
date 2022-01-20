FROM node:16-stretch


WORKDIR /app

ENV NODE_ENV production

COPY  . .


EXPOSE 9001
CMD ["npm","start"]
