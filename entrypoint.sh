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

set -e

source /i9mlib-1.2.sh

getCurNodeId
curNode=$RET_VAL
storeAndGet "curNode" $curNode
prevNode=$RET_VAL

echo "[IMAGENARIUM]: curNode: $curNode, prevNode: $prevNode"

if [ -z "${prevNode}" ]; then
  if [ "${NEW_DB}" == "true" ]; then
    echo "[IMAGENARIUM]: First run. Remove stale data directory."
    rm -rf /opt/nausd40/data/*
  fi
fi

/usr/local/tomcat/bin/catalina.sh run
