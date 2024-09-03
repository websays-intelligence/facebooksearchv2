#!/bin/bash
# exit when any command fails
set -e

# keep track of the last executed command
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
# echo an error message before exiting
trap 'echo "\"${last_command}\" command filed with exit code $?."' EXIT

generate_image () {
    local image_name=$1

    docker build --build-arg ENV=$TRAVIS_BRANCH -t $image_name -f Dockerfile .
}


generate_image igsearch
