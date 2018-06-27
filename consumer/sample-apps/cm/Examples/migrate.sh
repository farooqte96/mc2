#!/usr/bin/env bash
set -euo pipefail
container_name=$1
checkpoint_name=$1
container_image=$2
checkpoint_tar=""
destination_host=$3

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
restore




checkpoint() {
    echo "Checkpoint running container"
    # echo "$ docker checkpoint create ${container_name} ${checkpoint_name}"
    docker checkpoint create ${container_name} ${checkpoint_name}
}

migrate() {
    echo "Migrating container checkpoint..."

    # Migrate to which host?
   # echo -n "Enter host (IP|hostname) to migrate to: "
    #read migration_host
    # migration_host="tufailm1@195.148.127.246"
    # migration_host_ip="195.148.127.246"

    # check ping reachability
    # [[ ! $(ping -c 1 ${migration_host_ip} 2>/dev/null) ]] && { echo "Can not reach ${migration_host}"; exit 1; }

    # check ssh connectivity
    [ ! "$(ssh -q ${destination_host} echo 'ok')" == "ok" ] && { echo "Unable to SSH to ${destination_host}"; exit 1; }

    # Attempt to copy over
    scp /tmp/${checkpoint_tar} ${destination_host}:/tmp/
}




restore(){
  # Now on destination host, we create container with same name and Image
  remote_container_id=$(ssh ${destination_host} "docker create --name ${container_name} ${container_image}")

  # Unpack backup
  ssh -t ${destination_host} "sudo tar -zxf /tmp/${checkpoint_tar} -C /var/lib/docker/containers/${remote_container_id}/checkpoints/"

  # Start container from checkpoint
  ssh ${destination_host} "docker start --checkpoint ${checkpoint_name} ${container_name}"
}
