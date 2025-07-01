# Dockerfile: สำหรับ dataset server
FROM nginx:alpine

# ✅ Copy ไฟล์ Geo-data เข้า nginx
COPY ./public/Geo-data /usr/share/nginx/html/Geo-data

# ✅ ใช้ custom nginx.conf ที่รองรับ CORS
COPY ./public/Geo-data/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

