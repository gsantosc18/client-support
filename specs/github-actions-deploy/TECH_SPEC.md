# Tech Spec: GitHub Actions SSH Deployment

## CI/CD Workflow Modifications

In `.github/workflows/docker-build-push.yml`, we will introduce a new job:

```yaml
  deploy:
    name: Deploy Stack via SSH
    runs-on: ubuntu-latest
    needs: [build-backend, build-frontend]
    steps:
      - name: Deploy to Docker Swarm via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          port: ${{ secrets.SSH_PORT || 22 }}
          script: |
            cd /root/workdir
            docker stack deploy --with-registry-auth -c client-suport.yaml client-support
```
