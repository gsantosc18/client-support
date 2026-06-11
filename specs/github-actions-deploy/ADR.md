# ADR-001: Deployment Execution via SSH Action

## Context
We need to automate deployments of the client-support Docker stack onto a remote Docker Swarm manager after building the container images.

## Decisão
Use the GitHub Action `appleboy/ssh-action` to connect to the remote swarm manager node via SSH and run `docker stack deploy` directly on the server under the path `/root/workdir`.

## Consequências
- Safe remote execution using secure repository secrets.
- Automatic zero-downtime rolling updates if Swarm configurations are correct.
- Dependecy on host connectivity and correct secret configuration.
