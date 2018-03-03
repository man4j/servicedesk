#!/bin/bash

function storeAndGet {
  if [[ ! "${STORAGE_SERVICE}" ]]; then
    echo >&2 "[IMAGENARIUM]: You need to specify STORAGE_SERVICE"
    exit 0
  fi

  while true; do
    echo "[IMAGENARIUM]: Try to connect to storage service: ${STORAGE_SERVICE}"

    RET_VAL=$(curl -XGET http://$STORAGE_SERVICE:8080/put/${SERVICE_NAME}/$1?value=$2 &>/dev/null)

    status=$?

    if [ $status -ne 0 ]; then
      echo "[IMAGENARIUM]: Can't connect to storage service..."
    else
      echo "[IMAGENARIUM]: Response from storage service: $RET_VAL"
      break
    fi

    sleep 3
  done
}

function getCurNodeId {
  RET_VAL=$(curl --unix-socket /var/run/docker.sock -sX GET http://1.32/info | jq -r '.Swarm.NodeID')
}

function mount {
  mnt_path=$1
  mnt_server=$2

  while true; do
    echo "[IMAGENARIUM]: Trying to mount file storage NFS directory ${mnt_path} from ${mnt_server}"

    [ -d ${mnt_path} ] || mkdir -p ${mnt_path}

    mount -v -o vers=4,loud,sync,retrans=0 ${mnt_server}:/ ${mnt_path}

    status=$?

    if [ "${status}" == "0" ]; then
      echo "[IMAGENARIUM]: Mount successful"
      break
    fi

    sleep 3
  done
}

function findIp {
  while true; do
    echo "[IMAGENARIUM]: try to resolve current ip address in $1..."

    ip=$(curl --unix-socket /var/run/docker.sock -g -sX GET "http:/v1.32/containers/json?filters={\"name\":[\"^/${HOSTNAME}$\"]}" | jq .[0].NetworkSettings.Networks.\"$1\".IPAddress | tr -d '"')

    if [[ $ip != "null" ]]; then
      echo "[IMAGENARIUM]: Found ip address in $1: ${ip}"
      RET_VAL=$ip
      break
    fi

    sleep 1
  done
}

function findInterfaceByIp {
  RET_VAL=$(ip addr show | grep "inet $1" | awk '{print $NF}')
}

function addMulticastRoute {
  route add -net 224.0.0.0 netmask 240.0.0.0 $1
  echo "[IMAGENARIUM]: Route successfully added: $(route | grep 224.0.0.0)"
}