FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD echo "\n=========================================" && \
    echo "✅ NGINX SERVICE STARTED ON PORT 80 (Internal)" && \
    echo "=========================================\n" && \
    nginx -g 'daemon off;'
