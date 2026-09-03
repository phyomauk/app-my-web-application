# Use official NGINX image from aws public ecr
FROM public.ecr.aws/docker/library/nginx:alpine

# Remove default NGINX website
RUN rm -rf /usr/share/nginx/html/*

# Copy your static website into NGINX html directory
COPY ./app /usr/share/nginx/html

#  appends the charset rule globally into the Nginx configuration (to display emoji characters)
COPY charset.conf /etc/nginx/conf.d/charset.conf

# Override the default Nginx server block with your proxy config
COPY ./default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the frontend
EXPOSE 80
