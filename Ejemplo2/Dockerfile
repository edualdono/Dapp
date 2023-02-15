# Image base
FROM node:18.12.1

#directorio de trabajo
WORKDIR /usr/src/app

#Copia del codigo dentro del contenedor
COPY . .

#instalacion de los modulos
RUN npm install package.json
RUN npm install -g truffle@5.5.9

#Exposcicion de un puerto de contenedor
EXPOSE 3000

# Entrypoint para la ejecucion de la DApp
ENTRYPOINT [ "sh" ]