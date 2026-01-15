FROM nginx:stable-alpine

ARG DIST

WORKDIR /usr/share/nginx/html

COPY deploy/nginx.conf /etc/nginx/nginx.conf
COPY ${DIST} /usr/share/nginx/html

RUN nginx -t
RUN rm -Rf /etc/nginx/conf.d
RUN ls -lah /etc/nginx
RUN ls -lah /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]