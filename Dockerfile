FROM node:16-stretch


WORKDIR /app

ENV NODE_ENV production

RUN addgroup -g 1001 -S node
RUN adduser -S node -u 1001

COPY --chown=node:node . .

USER node

EXPOSE 9001
CMD ["npm","start"]