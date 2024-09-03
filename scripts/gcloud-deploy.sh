#!/bin/bash
# exit when any command fails
set -e

# keep track of the last executed command
trap 'last_command=$current_command; current_command=$BASH_COMMAND' DEBUG
# echo an error message before exiting
trap 'echo "\"${last_command}\" command filed with exit code $?."' EXIT

if [[ -z "$GCLOUD_SERVICE_KEY_BASE64" ]]; then
    echo "Must provide GCLOUD_SERVICE_KEY_BASE64 in environment" 1>&2
    exit 1
fi

publish_image () {
    local google_project=$1
    local image_name=$2
    local travis_commit=$3
    docker tag $image_name gcr.io/$google_project/$image_name:latest
    docker push gcr.io/$google_project/$image_name:latest
    docker tag gcr.io/$google_project/$image_name:latest gcr.io/$google_project/$image_name:$travis_commit
    docker push gcr.io/$google_project/$image_name:$travis_commit
}

update_deployment () {
    local google_project=$1
    local image_name=$2
    local travis_commit=$3

    kubectl -f k8s/$image_name-deployment.yaml apply
    kubectl set image deployment/$image_name-deployment $image_name=gcr.io/$google_project/$image_name:$travis_commit
    kubectl rollout status deployment/$image_name-deployment
}

google_project="beta-websays"

if [ "$TRAVIS_BRANCH" = "master" ]; then
    google_project="wapi-websays"
    echo $MASTER_GCLOUD_SERVICE_KEY_BASE64 | base64 --decode -i > ${HOME}/gcloud-service-key.json
else
    echo $GCLOUD_SERVICE_KEY_BASE64 | base64 --decode -i > ${HOME}/gcloud-service-key.json
fi

docker login -u _json_key --password-stdin https://gcr.io < ${HOME}/gcloud-service-key.json
publish_image $google_project igsearch $TRAVIS_COMMIT


gcloud auth activate-service-account --key-file ${HOME}/gcloud-service-key.json
gcloud config set project $google_project
gcloud config set compute/zone europe-west1-b
gcloud container clusters get-credentials $google_project-k8s

update_deployment $google_project igsearch $TRAVIS_COMMIT
