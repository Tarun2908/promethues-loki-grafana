#!/bin/bash
set -euo pipefail

# deploy-monitoring.sh
# Deploys the full observability stack (Prometheus, Loki, Grafana) and
# the AWS Load Balancer Controller to the EKS cluster.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== Adding Helm repositories ==="
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add eks https://aws.github.io/eks-charts
helm repo update

echo "=== Creating monitoring namespace ==="
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

echo "=== Creating Grafana dashboard ConfigMap ==="
kubectl create configmap los-app-dashboards \
  --namespace monitoring \
  --from-file="$PROJECT_ROOT/monitoring/dashboards/" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "=== Installing/upgrading Prometheus ==="
helm upgrade --install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  -f "$PROJECT_ROOT/monitoring/prometheus-values.yaml" \
  --wait

echo "=== Installing/upgrading Loki ==="
helm upgrade --install loki grafana/loki-stack \
  --namespace monitoring \
  -f "$PROJECT_ROOT/monitoring/loki-values.yaml" \
  --wait

echo "=== Installing/upgrading Grafana ==="
helm upgrade --install grafana grafana/grafana \
  --namespace monitoring \
  -f "$PROJECT_ROOT/monitoring/grafana-values.yaml" \
  --wait

echo "=== Deploying AWS Load Balancer Controller ==="
helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  --namespace kube-system \
  --set clusterName="${EKS_CLUSTER_NAME:?EKS_CLUSTER_NAME environment variable must be set}" \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller \
  --wait

echo "=== Monitoring stack deployment complete ==="
