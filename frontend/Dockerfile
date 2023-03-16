# Frontend UI running in NGINX
FROM node AS builder
LABEL description="KubeScrub-Web" \
      maintainer="Casey Wylie casewylie@gmail.com"
# Set working directory
WORKDIR /app
# Copy all files from current directory to working dir in image
COPY . .
# install node modules and build assets
RUN npm i && npm run build 

# nginx state for serving content
# FROM nginx
FROM nginx
# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build .
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]