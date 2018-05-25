#!/bin/bash
APP=$1
PORT=$2
IMAGE=$3
DSTN_host=$4
localhost="root@195.148.127.245"



echo "I am outside local"



if [ $DSTN_host = $localhost ] ; then
  # localhost Machine
  echo "I am on local"
  docker run -d --name $APP -p 80:$PORT $IMAGE
else
  # Remote Machine
  echo "I am on remote"
  ssh -t ${DSTN_host} "docker run -d --name ${APP} -p 80:${PORT} ${IMAGE}"
fi
