# Terraform Deployment UI (Multi‑Studio)

This project provides a **Dockerized UI + API** to deploy/destroy **six studios** via Terraform:
**Office, Photo, Audio, 3D, Video, Avatar**.

## Structure
```
terraform-deployment-ui/
├── frontend/            # React + Vite UI
├── backend/             # Flask API + Terraform runner
│   └── terraform/       # Put your per-studio Terraform here
│       ├── office/
│       ├── photo/
│       ├── audio/
│       ├── 3d/
│       ├── video/
│       └── avatar/
└── docker-compose.yml
```

## Quick Start (Local with Docker Compose)

1. Paste your Terraform files:
   - Put each studio's `main.tf` (and related files) inside:
     - `backend/terraform/office/`
     - `backend/terraform/photo/`
     - `backend/terraform/audio/`
     - `backend/terraform/3d/`
     - `backend/terraform/video/`
     - `backend/terraform/avatar/`

2. (Optional for LOCAL testing) Ensure AWS credentials available to the backend:
   - EITHER run on an EC2 with an IAM role (recommended in production)
   - OR on your laptop, create `~/.aws/credentials` and `~/.aws/config`
   - In `docker-compose.yml`, uncomment the `~/.aws` volume mapping under `backend`

3. Build & run:
   ```bash
   docker compose up --build
   ```
   Open **http://localhost** for the UI. Backend runs at **http://localhost:5000**.

## Build & Push the Frontend Image to Docker Hub

```bash
cd frontend
docker build -t <your_dockerhub>/terraform-deploy-ui:v1 .
docker push <your_dockerhub>/terraform-deploy-ui:v1
```

## Deploy the UI to EC2 with Terraform (example)

Minimal example for **your own separate** Terraform (not included here):

```hcl
resource "aws_instance" "deploy_ui" {
  ami                    = "ami-xxxxxxxx"        # Ubuntu 22.04+ in your region
  instance_type          = "t3.small"
  associate_public_ip_address = true
  user_data = <<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y docker.io docker-compose-plugin
    docker run -d -p 80:80 {"<your_dockerhub>"}/terraform-deploy-ui:v1
  EOF
}
```

> In production, prefer deploying **both frontend & backend** via `docker compose` on EC2, and grant the EC2 an **IAM role** with Terraform permissions to create your infrastructure.

## Notes
- The backend container installs Terraform and runs `terraform init/apply/destroy` inside each studio folder.
- For **EKS** or complex setups, include all necessary `.tf` files and modules in each studio folder.
- For state, you may configure remote state (e.g., S3 backend) in your `main.tf` to avoid local state issues.
