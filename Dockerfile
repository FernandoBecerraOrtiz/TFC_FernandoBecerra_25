# Imagen oficial de PHP con Apache
FROM php:8.2-apache

# Directorio de trabajo dentro del contenedor
WORKDIR /var/www/html

# Copiamos el código de la app al contenedor
COPY . /var/www/html

# Instalamos extensiones de PHP necesarias para MySQL
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Activar mod_rewrite para usar .htaccess y hacer las URLs amigables
RUN a2enmod rewrite && \
    sed -i 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf

# Exponemos el puerto 80 (Apache)
EXPOSE 80
