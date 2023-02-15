#!/bin/bash
#se realiza el build con direccion al confichero local
docker build -t loteria:v1 .
#se asocia el puerto del docker con el local
docker run -p 3000:3000 loteria:v1 entrypoint.sh