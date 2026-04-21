#!/bin/bash
set -euo pipefail

# deploy-app.sh
# Applies Kubernetes manifests for the LOS application in the correct order.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
K8S_DIR="$PROJECT_ROOT/k8s"

echo "=== Deploying LOS application to Kubernetes ==="

echo "--- Applying namespace ---"
kubectl apply -f "$K8S_DIR/namespace.yaml"

echo "--- Applying configmap ---"
kubectl apply -f "$K8S_DIR/configmap.yaml"

echo "--- Applying deployment ---"
kubectl apply -f "$K8S_DIR/deployment.yaml"

echo "--- Applying service ---"
kubectl apply -f "$K8S_DIR/service.yaml"

echo "--- Applying ingress ---"
kubectl apply -f "$K8S_DIR/ingress.yaml"

echo "=== LOS application deployment complete ==="
echo "Waiting for rollout to finish..."
kubectl rollout status deployment/los-app -n los-app --timeout=120s

echo "=== Deployment ready ==="
