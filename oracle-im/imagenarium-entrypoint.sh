#!/bin/bash

sysctl -w net.ipv4.ip_local_port_range="9000 65500"
sysctl -w fs.file-max=6815744
sysctl -w kernel.shmall=10523004
sysctl -w kernel.shmmax=6465333657
sysctl -w kernel.shmmni=4096
sysctl -w kernel.sem="250 32000 100 128"
sysctl -w fs.aio-max-nr=1048576

#Issue in setting --sysctl net.core parameter with docker container.
#https://github.com/moby/moby/issues/30778
#sysctl -w net.core.rmem_default=262144
#sysctl -w net.core.wmem_default=262144
#sysctl -w net.core.rmem_max=4194304
#sysctl -w net.core.wmem_max=1048576

set +e

function put {
  while true; do
    echo "[IMAGENARIUM]: Try to connect to storage service..."

    response=$(curl -XGET http://$STORAGE_SERVICE:8080/put/$1/$2?value=$3 2>/dev/null)

    status=$?

    if [ $status -ne 0 ]; then
      echo "[IMAGENARIUM]: Can't connect to storage service..."
    else
      echo "[IMAGENARIUM]: Response from storage service: $response"
      break
    fi

    sleep 5
  done
}

result=$(printf 'GET http://1.32/info HTTP/1.0\r\n\r\n' | nc -U /var/run/docker.sock)

from=${result#*NodeID\":\"}
curNode=${from%%\"*}

put $SERVICE_NAME "curNode" $curNode
prevNode=$response
echo "[IMAGENARIUM]: curNode: $curNode, prevNode: $prevNode"

if [ -z "${prevNode}" ]; then
  if [ "${NEW_DB}" == "true" ]; then
    echo "[IMAGENARIUM]: First run. Remove stale data directory."
    rm -rf /opt/oracle/*
    echo "[IMAGENARIUM]: Move data snapshot to /opt/oracle. Please wait..."
    mv -f /prepared_data/{*,.*} /opt/oracle/ | true
  fi
fi

set -e

/assets/entrypoint.sh

