FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node *.js *.cjs *.css index.html ./
COPY --chown=node:node assets ./assets
USER node
ENV PORT=4387
EXPOSE 4387
CMD ["node", "server.cjs"]
