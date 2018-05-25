# !/usr/bin/env bash
# set -euo pipefail

SOURCE=$1
APP=$2
IMAGE=$3
ARGUMENTS=$4
DSTN_host=$5
localhost="tufailm1@195.148.127.245"

echo "I am outside local"



if [ $SOURCE = $localhost ] ; then
  # localhost Machine
  echo "I am on local"
  ./migrate2.sh ${APP} ${IMAGE} "${ARGUMENTS}" ${DSTN_host}

else
  # Remote Machine
  echo "I am on remote"
  ssh ${SOURCE} "./migrate2.sh ${APP} ${IMAGE} '${ARGUMENTS}' ${DSTN_host}"
fi
