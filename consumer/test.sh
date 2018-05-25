#!/bin/bash
APP=$1
ARGUMENTS=$2
IMAGE=$3
# ENV=$5
# PORT=$4
# EXPOSE=$5



# docker run -d --name $APP $ARGUMENTS -p $EXPOSE:$PORT $IMAGE
docker run -d --name $APP $ARGUMENTS $IMAGE
