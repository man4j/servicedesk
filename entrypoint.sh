#!/bin/bash

cd /opt/nausd40/conf
sed -e "s,\${BASE_URL},${BASE_URL}," dbaccess.properties > replaced
mv -f replaced dbaccess.properties

sed -e "s,\${ORACLE_HOSTNAME},${ORACLE_HOSTNAME}," dbaccess.properties > replaced
mv -f replaced dbaccess.properties

sed -e "s,\${ORACLE_SID},${ORACLE_SID}," dbaccess.properties > replaced
mv -f replaced dbaccess.properties

sed -e "s,\${ORACLE_USER},${ORACLE_USER}," dbaccess.properties > replaced
mv -f replaced dbaccess.properties

sed -e "s,\${ORACLE_PASSWORD},${ORACLE_PASSWORD}," dbaccess.properties > replaced
mv -f replaced dbaccess.properties


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

curNode=$(curl --unix-socket /var/run/docker.sock -sX GET http://1.32/info | jq -r '.Swarm.NodeID')
put $SERVICE_NAME "curNode" $curNode
prevNode=$response
echo "[IMAGENARIUM]: curNode: $curNode, prevNode: $prevNode"

if [ -z "${prevNode}" ]; then
  if [ "${NEW_DB}" == "true" ]; then
    echo "[IMAGENARIUM]: First run. Remove stale data directory."
    rm -rf /opt/nausd40/data/*
  fi
fi

set -e

/usr/local/tomcat/bin/catalina.sh run
