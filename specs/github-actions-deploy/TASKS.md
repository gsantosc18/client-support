# CI/CD Deployment Step

- [ ] Add the `deploy` job to `.github/workflows/docker-build-push.yml`
- [ ] Configure the `deploy` job to require both `build-backend` and `build-frontend`
- [ ] Implement remote connection via SSH using `appleboy/ssh-action`
- [ ] Execute `docker stack deploy` command in the directory `/root/workdir`
