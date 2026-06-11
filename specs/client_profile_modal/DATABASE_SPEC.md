# Database Spec: Client Profile Modal in Process Details

## Modelagem e Persistência
Esta feature não introduz novas tabelas ou alterações de esquema no banco de dados. Os dados exibidos na modal pertencem à tabela de clientes (`clients`) já existente.

### Tabela Utilizada: `clients`
Campos consultados na interface:
- `id` (UUID, Primary Key)
- `full_name` (VARCHAR)
- `email` (VARCHAR, Nullable)
- `phone` (VARCHAR, Nullable)
- `birth_date` (DATE, Nullable)
- `cpf` (VARCHAR, Nullable)
- `rg` (VARCHAR, Nullable)
- `cnh` (VARCHAR, Nullable)
- `company_id` (UUID, Foreign Key)
