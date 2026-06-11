# Security Spec: GitHub Actions SSH Deployment

- **Authentication**: Access to the remote server will be authenticated using a private SSH Key stored in GitHub repository Secrets.
- **Secrets Management**:
  - `SSH_HOST`: IP/domain of the swarm manager.
  - `SSH_USERNAME`: SSH user name (e.g. `root`).
  - `SSH_KEY`: Private key (e.g. `id_rsa` or `id_ed25519`). Do not use passwords where possible.
  - `SSH_PORT`: The SSH port (typically 22).
- **Least Privilege**: The deployment targets `/root/workdir` and executes `docker stack deploy` on the target Docker Swarm cluster.
