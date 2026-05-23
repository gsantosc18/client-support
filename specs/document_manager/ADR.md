# ADR-001 - Driver de Storage Local emulado para Desenvolvimento

## Contexto
Durante o desenvolvimento do gerenciador de documentos, era fundamental viabilizar o envio e modificação física de arquivos reais sem onerar ou exigir credenciais reais do AWS S3 em máquinas locais de desenvolvedores ou no ecossistema Docker offline do projeto.

---

## Decisão
Implementar uma abstração de driver (`FileStorage`) injetável em `main.go`. Sob a variável de ambiente `USE_S3=false`, o sistema instancia o driver `LocalStorage` apontado para o caminho configurado na variável de ambiente `LOCAL_STORAGE_PATH` (com fallback para `./storage`).
Para manter a paridade com o S3, o driver local:
1. Emula as tags do S3 (criando arquivos adicionais `.tag` contendo metadados JSON do arquivo correspondente).
2. Move e organiza os arquivos sob o mesmo padrão de pastas em lixeira (`/trash`) ao deletar, simulando perfeitamente o comportamento produtivo na nuvem AWS.

---

## Consequências
*   **Positivas**: Facilidade de homologação offline via `make infra`, paridade total de comportamento entre disco local e AWS S3, facilidade de cobertura por testes automatizados offline.
*   **Negativas**: Exigência de volume persistente local mapeado em `LOCAL_STORAGE_PATH` no container do docker-compose para evitar perda de uploads sob reboot.
