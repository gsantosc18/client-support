ADR-003
Caching de Empresa e Centralização do Header

Contexto
Atualmente, o nome da aplicação na barra superior está fixado como "SuporteCliente" em formato de código de interface duplicado (presente tanto em ClientListPage.tsx quanto em ProcessListPage.tsx). 
Para prover uma experiência de marca premium para cada inquilino (tenant) cadastrado no sistema, é necessário buscar o nome da empresa correspondente no backend. No entanto, fazer uma requisição de rede para buscar os dados da empresa a cada renderização de página aumentaria de forma expressiva o tráfego de rede e a latência percebida pelo usuário. 
Por isso, precisamos adotar um padrão de cache de múltiplos níveis tanto no frontend quanto no backend, além de refatorar o código do cabeçalho de navegação para evitar duplicação.

Decisão
1. Backend: Implementaremos um repositório decorador em Redis (CachedCompanyRepository ou redis.CompanyRepository) no backend Golang que envolve o repositório MariaDB (postgres.CompanyRepository) e cacheia o resultado da consulta da empresa por 24 horas.
2. Frontend: Extenderemos o estado global Redux (authSlice) e o Web Storage para carregar e armazenar em cache o nome da empresa após o login. Criaremos o hook customizado useCompany que gerencia esse cache, executando a chamada de rede à API /api/company somente na ausência do cache local.
3. Componentização: Refatoraremos a barra de navegação repetida em ClientListPage.tsx e ProcessListPage.tsx extraindo-a para um único componente reaproveitável Header.tsx localizado na pasta app/src/components/. O Header utilizará o hook useCompany para carregar o nome da empresa e o logo correspondente e usePathname para iluminar o link da página ativa.

Consequências
* Positivas:
  * Performance Excelente: Redução de quase 100% de chamadas redundantes de rede para dados de empresa no frontend durante a navegação normal.
  * Baixa Latência de Banco: Redução de queries repetitivas à tabela de empresas no banco relacional MariaDB por meio do cache em Redis.
  * Manutenibilidade: Facilidade para expandir a barra superior ou adicionar links e novos dados do perfil da empresa em apenas um local (Header.tsx).
  * DRY (Don't Repeat Yourself): Eliminação de código HTML/CSS idêntico em múltiplas páginas.
* Negativas / Desafios:
  * Caso o nome da empresa seja modificado no backend, a alteração pode demorar até 24 horas para ser refletida para usuários logados devido ao cache no Redis e no Web Storage, a menos que ocorra um logout/login ou limpeza forçada de cache. Isso é aceitável, dado que a alteração do nome de uma empresa é uma operação extremamente infrequente.
