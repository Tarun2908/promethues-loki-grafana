# LOS Application — EKS Deployment

A sample Loan Origination System (LOS) REST API built with Node.js and Express, deployed to an AWS EKS cluster in ap-south-1. Includes a CI/CD pipeline (CodePipeline + CodeBuild + ECR) and a full observability stack (Prometheus, Loki, Grafana).

## Project Structure

```
.
├── src/                        # Application source code
│   ├── app.js                  # Express app setup and middleware
│   ├── server.js               # Server entry point
│   ├── routes/
│   │   └── loans.js            # Loan CRUD route handlers
│   ├── models/
│   │   └── loanStore.js        # In-memory loan storage
│   ├── middleware/
│   │   ├── requestId.js        # UUID request ID middleware
│   │   ├── logging.js          # Structured JSON logging (pino)
│   │   └── metrics.js          # Prometheus metrics (prom-client)
│   └── validators/
│       └── loanValidator.js    # Input validation
├── k8s/                        # Kubernetes manifests
│   ├── namespace.yaml          # los-app namespace
│   ├── configmap.yaml          # Application configuration
│   ├── deployment.yaml         # Deployment (2 replicas, probes, resource limits)
│   ├── service.yaml            # ClusterIP service
│   └── ingress.yaml            # ALB ingress (app + Grafana routing)
├── infra/                      # CloudFormation templates
│   ├── ecr.yaml                # ECR repository
│   └── pipeline.yaml           # CodePipeline + CodeBuild
├── monitoring/                 # Observability stack configuration
│   ├── prometheus-values.yaml  # Prometheus Helm values
│   ├── loki-values.yaml        # Loki + Promtail Helm values
│   ├── grafana-values.yaml     # Grafana Helm values
│   └── dashboards/             # Grafana dashboard JSON files
│       ├── los-app-dashboard.json
│       └── k8s-cluster-dashboard.json
├── scripts/                    # Deployment helper scripts
│   ├── deploy-monitoring.sh    # Deploy observability stack
│   └── deploy-app.sh           # Deploy LOS application manifests
├── Dockerfile                  # Multi-stage Docker build
├── buildspec.yml               # CodeBuild build specification
└── package.json                # Node.js project configuration
```

## Prerequisites

- **Node.js** 20+ and npm
- **Docker** for building container images
- **kubectl** configured for your EKS cluster
- **Helm** 3+ for deploying monitoring charts
- **AWS CLI** v2 configured with appropriate credentials
- **EKS cluster** running in ap-south-1

## Local Development

```bash
# Install dependencies
npm install

# Start the application (default port 3000)
npm start

# Run unit and property-based tests
npm test

# Run smoke tests (infrastructure config validation)
npm run test:smoke
```

The application runs on `http://localhost:3000` by default. Set the `PORT` environment variable to change the port.

## Deployment

### 1. Deploy ECR Repository

Create the ECR repository for storing Docker images:

```bash
aws cloudformation deploy \
  --template-file infra/ecr.yaml \
  --stack-name los-app-ecr \
  --region ap-south-1
```

### 2. Deploy CI/CD Pipeline

Create the CodePipeline that builds and deploys on every push:

```bash
aws cloudformation deploy \
  --template-file infra/pipeline.yaml \
  --stack-name los-app-pipeline \
  --region ap-south-1 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    GitHubOwner=<your-github-owner> \
    GitHubRepo=<your-repo-name> \
    GitHubBranch=main \
    EKSClusterName=<your-eks-cluster-name> \
    ECRRepositoryUri=<account-id>.dkr.ecr.ap-south-1.amazonaws.com/los-app
```

After deployment, confirm the CodeStar GitHub connection in the AWS console.

### 3. Deploy Monitoring Stack

Install Prometheus, Loki, Grafana, and the AWS Load Balancer Controller:

```bash
export EKS_CLUSTER_NAME=<your-eks-cluster-name>
./scripts/deploy-monitoring.sh
```

### 4. Deploy Application

Apply the Kubernetes manifests in the correct order:

```bash
./scripts/deploy-app.sh
```

## Tests

```bash
# Unit tests + property-based tests
npm test

# Smoke tests (validates Kubernetes manifests, CloudFormation, Helm values)
npm run test:smoke
```

## API Endpoints

| Method | Path                     | Description                    |
|--------|--------------------------|--------------------------------|
| POST   | `/api/loans`             | Submit a new loan application  |
| GET    | `/api/loans`             | List all loan applications     |
| GET    | `/api/loans/:id`         | Retrieve a loan by ID          |
| PATCH  | `/api/loans/:id/status`  | Update loan status             |
| GET    | `/health`                | Health check                   |
| GET    | `/metrics`               | Prometheus metrics              |

### Example: Create a Loan

```bash
curl -X POST http://<host>/api/loans \
  -H "Content-Type: application/json" \
  -d '{"borrowerName": "Jane Doe", "loanAmount": 50000, "loanTerm": 36}'
```

### Example: Update Loan Status

```bash
curl -X PATCH http://<host>/api/loans/<id>/status \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

### Loan Statuses

`SUBMITTED` → `UNDER_REVIEW` → `APPROVED` or `REJECTED`
