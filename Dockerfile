# Usa imagem oficial do Node
FROM node:18

# Define diretório da app
WORKDIR /usr/src/app

# Copia os arquivos
COPY package*.json ./
RUN npm install

COPY . .

# Porta exposta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD [ "npm", "run", "dev" ]
