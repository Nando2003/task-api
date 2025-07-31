#!/bin/sh
echo "Iniciando entrypoint"

while ! nc -z $DB_HOST $DB_PORT; do
  echo "Banco de dados não está pronto ainda. Aguardando..."
  sleep 2
done
echo "Banco de dados está pronto!"

echo "Executando migrações do banco de dados..."
node ace migration:run --force

if [ $? -ne 0 ]; then
  echo "Falha na migração do banco de dados! Encerrando o contêiner."
  exit 1
fi

echo "Iniciando aplicação AdonisJS..."

if [ "$NODE_ENV" = "development" ]; then
  exec npm run dev -- --poll
  
else
  node ace test

  if [ $? -ne 0 ]; then
    echo "Falha nos testes! Encerrando o contêiner."
    exit 1
  fi

  npm run build

  if node build/ace docs:generate || node ace docs:generate; then

    if [ -f swagger.yaml ]; then 
      mv swagger.yaml swagger.yml; 
    fi

    cp swagger.yml build/swagger.yml

  else
    echo "ATENÇÃO: não foi possível gerar swagger.yml. /docs vai quebrar."
  fi
  
  exec node build/bin/server.js
fi
