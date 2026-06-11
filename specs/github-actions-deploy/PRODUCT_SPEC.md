# Product Spec: GitHub Actions SSH Deployment

## Feature Goal
Enable continuous deployment to the remote Docker Swarm server automatically when a new release is published and the backend/frontend build images are successfully built and pushed.

## Requirements
- Triggered after `build-backend` and `build-frontend` complete successfully.
- Authenticate via SSH using repository secrets.
- Navigate to `/root/workdir` on the remote server.
- Run `docker stack deploy --with-registry-auth -c client-suport.yaml client-support`.
