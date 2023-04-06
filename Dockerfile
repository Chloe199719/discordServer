FROM node:19-alpine3.16

COPY . ./app
WORKDIR /app
RUN npm install
RUN npx prisma generate
ENTRYPOINT [ "/bin/sh" ]
CMD ["startApp.sh"]
