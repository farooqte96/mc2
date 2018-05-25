#!/bin/bash
APP=$1
ARGUMENTS=$2
IMAGE=$3
DSTN_host=$4
localhost="tufailm1@195.148.127.245"



echo "I am outside local"



if [ $DSTN_host = $localhost ] ; then
  # localhost Machine
  echo "I am on local"
  docker run -itd --name $APP $ARGUMENTS $IMAGE
else
  # Remote Machine
  echo "I am on remote"
  ssh -t ${DSTN_host} "docker run -d --name ${APP} ${ARGUMENTS} ${IMAGE}"
fi
