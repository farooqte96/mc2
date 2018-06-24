# !/usr/bin/env bash
# set -euo pipefail


container_name=$1
# container_id=$(docker ps -aqf "name=${container_name}")
# checkpoint_name="${container_name}_${container_id}"
checkpoint_name=$1
container_image=$2
checkpoint_tar=""
ARGUMENTS=$3
destination_host=$4

# echo "arguments are: $ARGUMENTS"
# echo "destination: $destination_host"

checkpoint() {
    # echo "Checkpoint running container"
    # echo "$ docker checkpoint create ${container_name} ${checkpoint_name}"
    docker checkpoint create ${container_name} ${checkpoint_name}
}

migrate() {
    # echo "Migrating container checkpoint..."

    # Migrate to which host?
   # echo -n "Enter host (IP|hostname) to migrate to: "
    #read migration_host
    # migration_host="tufailm1@195.148.127.246"
    # migration_host_ip="195.148.127.246"

    # check ping reachability
    # [[ ! $(ping -c 1 ${migration_host_ip} 2>/dev/null) ]] && { echo "Can not reach ${migration_host}"; exit 1; }

    # check ssh connectivity
    # [ ! "$(ssh -q ${destination_host} echo 'ok')" == "ok" ] && { echo "Unable to SSH to ${destination_host}"; exit 1; } &
    rsync --delete-after -avzh /tmp/${checkpoint_tar} ${destination_host}:/tmp/
    # scp /tmp/${checkpoint_tar} ${destination_host}:/tmp/

    # Attempt to copy over

}




restore(){

  # Now on destination host, we create container with same name and Image
  # echo "Starting container [${container_name}] on ${destination_host} from checkpoint [${checkpoint_name}]" &
  remote_container_id=$(ssh ${destination_host} "docker create --name ${container_name} ${ARGUMENTS} ${container_image}")
  #remote_container_id=$(docker create --name ${container_name} ${ARGUMENTS} ${container_image});
  # wait
  ssh ${destination_host} "
      remote_container_id=$(docker create --name ${container_name} ${ARGUMENTS} ${container_image});
      sudo tar -zxf /tmp/${checkpoint_tar} -C /var/lib/docker/containers/${remote_container_id}/checkpoints/;

      if !(docker start --checkpoint ${checkpoint_name} ${container_name}); then
        docker start ${container_name}

      fi
      docker checkpoint rm ${container_name} ${checkpoint_name} &
      sudo rm /tmp/${checkpoint_tar};
  "
  # ssh -t ${destination_host} "sudo tar -zxf /tmp/${checkpoint_tar} -C /var/lib/docker/containers/${remote_container_id}/checkpoints/"
  #
  # # Unpack backup
  #
  #
  # # Start container from checkpoint
  # ssh ${destination_host} "docker start --checkpoint ${checkpoint_name} ${container_name}" & ssh ${destination_host} "docker start ${container_name}" &
  # ssh ${destination_host} "docker checkpoint rm ${container_name} ${checkpoint_name}" &
  # ssh ${destination_host} "rm /tmp/${checkpoint_tar}"
  # After starting the container from checkpoint, now remove checkpoint IMAGE



}

kill_source() {
    docker rm -fv ${container_name} &
    # ssh ${migration_host} "docker rm -fv ${container_name}"
    # exit 1
    ########## Also delete the .tgz data at /tmp
    sudo rm /tmp/${checkpoint_tar} </dev/null
}



# 1. First we checkpoint the running container
checkpoint

# 2.Create Backup files
# Get container ID
container_id=$(docker inspect -f '{{.Id}}' ${container_name})
# Create backup files name
checkpoint_tar="${container_id}.${checkpoint_name}.tgz"
# Copy from checkpoint directory to /tmp as .tgz
sudo tar -zcf /tmp/${checkpoint_tar} -C /var/lib/docker/containers/${container_id}/checkpoints/ ${checkpoint_name}/


# 3.Call Migrate function
migrate
# 4.Restore at destination
restore &

# also kill the migrated container
kill_source
