# 1. Definição de Domínio

Esse documento define o domínio do sistema de suporte ao cliente. O sistema será composto por quatro pilares principais:

## 1.1. Empresa

A empresa é o vinculo que o cliente tera com a plataforma. Esse vinculo será feito através de um código único (Company ID) que será gerado no momento do cadastro da empresa.

Estrutura da empresa:
- id: UUID (código da empresa, gerado no momento do cadastro)
- name: string (nome da empresa)
- status: string (ativo, inativo, suspenso)
- created_at: timestamp (data de criação)
- updated_at: timestamp (data de atualização)

## 1.2. Usuário

O usuário é a pessoa que irá utilizar o sistema. Cada usuário estará vinculado a uma empresa.

Estrutura do usuário:
- id: UUID (código do usuário, gerado no momento do cadastro)
- company_id: UUID (código da empresa, gerado no momento do cadastro)
- name: string (nome do usuário)
- last_name: string (sobrenome do usuário)
- email: string (email do usuário)
- phone: string (telefone do usuário)
- password: string (senha do usuário criptografada)
- birth_date: date (data de nascimento do usuário)
- status: string (ativo, inativo, suspenso)
- created_at: timestamp (data de criação)
- updated_at: timestamp (data de atualização)

## 1.3. Cliente

O cliente é para quem a empresa presta serviço.

Estrutura do cliente:
- id: UUID (código do cliente, gerado no momento do cadastro)
- company_id: UUID (código da empresa, gerado no momento do cadastro)
- full_name: string (nome completo do cliente)
- email: string (email do cliente) (opcional e único por empresa)
- phone: string (telefone do cliente) (opcional)
- birth_date: date (data de nascimento do cliente) (opcional)
- cpf: string (cpf do cliente) (opcional e único por empresa)
- rg: string (rg do cliente) (opcional e único por empresa)
- cnh: string (cnh do cliente) (opcional e único por empresa)
- status: string (ativo, inativo, suspenso)
- created_at: timestamp (data de criação)
- updated_at: timestamp (data de atualização)

## 1.4. Processo

O processo é o registro criado junto a plataformas externas pela empresa em nome do cliente, para atendimento de uma demanda.

Estrutura do processo:
- id: UUID (código do processo, gerado no momento do cadastro)
- company_id: UUID (código da empresa, gerado no momento do cadastro)
- client_id: UUID (código do cliente)
- user_id: UUID (código do usuário)
- external_id: string (código do processo na plataforma externa)
- status: string (iniciado, pendente, em andamento, concluído, cancelado)
- created_at: timestamp (data de criação)
- updated_at: timestamp (data de atualização)

# Regras de Negócio

- O status inicial de todos os registros será 'ativo'
- O status inicial do processo será 'iniciado'

# Informações técnicas

- A geração do id será feita pelo sistema em formato UUID
- Todos os campos de status no backend serão enums, e serão retornados como string para o front exibir na interface.
- O CRUD de empresa não será feito pelo usuário, somente pelo administrador (será definido futuramente).
- Ao persistir o campo status no banco, ele deve ser convertido para string.
- Ao persistir o campo status no banco, ele deve ser convertido para string em maiúsculo.
- A senha do usuário deve ser criptografada no backend utilizando o algoritmo BCrypt com um fator de custo adequado (mínimo 10).
- As datas devem ser persistidas no formato UTC.
