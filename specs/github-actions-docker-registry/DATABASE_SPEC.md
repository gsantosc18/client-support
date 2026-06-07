# Database Specification: GitHub Actions para Build e Push de Imagens Docker

Este documento descreve as implicações e interações do banco de dados no pipeline de compilação.

---

## 1. Banco de Dados no Build Time

O processo de build das imagens Docker do frontend e backend é **independente de conexões ativas com o banco de dados**. 
Nenhum container de banco de dados (PostgreSQL ou Redis) é inicializado durante a execução do workflow do GitHub Actions.

---

## 2. Empacotamento de Artefatos de Banco de Dados

A imagem compilada do backend inclui componentes críticos para o ciclo de vida do banco de dados que serão executados apenas no runtime:
* **Executável Goose**: Incluído na imagem final de runtime do backend para gerenciar a execução de migrations.
* **Arquivos de Migração (`migrations/`)**: Copiados para dentro da imagem de produção para que o comando `goose up` possa ser executado imediatamente antes de subir o servidor web.

A Action garante que estes arquivos sejam incluídos sem modificações e sem expor credenciais de desenvolvimento locais.
