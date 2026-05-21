# API Specification: Client Delete

Este documento detalha o contrato da API HTTP para a feature de exclusão de clientes.

---

## 1. Endpoints de Clientes

### 1.1. DELETE `/api/v1/clients/:id`

Realiza a exclusão física do cliente e arquivamento correspondente se não houver vínculos ativos.

* **Método**: `DELETE`
* **Autenticação**: Requer cabeçalho `Authorization: Bearer <JWT_TOKEN>`
* **Parâmetros de Path**:
  * `id` (string, UUID, obrigatório): O ID do cliente a ser excluído.

#### Resposta de Sucesso: `200 OK`
Retornado quando o cliente é excluído e arquivado com sucesso.

* **Content-Type**: `application/json`
* **Exemplo de Body**:
  ```json
  {
    "message": "Cliente excluído e arquivado com sucesso.",
    "id": "a4d8c7c9-43c2-40f4-90ab-15ef61a0b3c2"
  }
  ```

#### Respostas de Erro:

##### `400 Bad Request`
Retornado se o ID for inválido ou se o cliente possuir processos associados.

* **Exemplo de Body (Processos Associados)**:
  ```json
  {
    "error": "O cliente está vinculado a um processo e não pode ser removido."
  }
  ```

##### `404 Not Found`
Retornado se o cliente não existir ou não pertencer à empresa do usuário logado.

* **Exemplo de Body**:
  ```json
  {
    "error": "cliente não encontrado"
  }
  ```

##### `412 Precondition Failed`
Retornado caso ocorram falhas de validação de pré-condição adicionais.
