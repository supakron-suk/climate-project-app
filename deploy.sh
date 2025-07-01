#!/bin/bash

echo "[1/4] Building Docker image for React WebApp..."
docker build -t climate-webapp-page:latest -f Dockerfile .

echo "[2/4] Building Docker image for Dataset Server..."
docker build -t dataset-server:latest -f public/Geo-data/Dockerfile .

echo "[3/4] Applying Kubernetes deployments..."
kubectl apply -f kube_file/webapp-deployment.yaml
kubectl apply -f kube_file/dataset-deployment.yaml

echo "[4/4] Deployment complete!"
