#!/bin/bash
APP=$1
ARGUMENTS=$2
IMAGE=$3
# ENV=$5
# PORT=$4
# EXPOSE=$5


#echo "$arg4"

#echo "$APP"
echo "ARGUMENTS:$ARGUMENTS"
# echo "IMAGE:$IMAGE"
# echo "ENV:$ENV"
# echo "PORT:$PORT"
# echo "EXPOSE:$EXPOSE"
#echo "docker run --itd --name $APP -p 80:$PORT $IMAGE"
# echo "docker run -d --name $APP -p $EXPOSE:$PORT $IMAGE --env temp=$ENV"
docker run -d --name $APP $ARGUMENTS $IMAGE
#echo "docker run -d --name $APP $ARGUMENTS -p $EXPOSE:$PORT $IMAGE"
#docker ps -a
#docker run -itd --name docker-nginx -p 80:80 nginx
