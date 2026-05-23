# Padrão Oficial — Página de Listagem

Todas as páginas de listagem do sistema DEVEM seguir obrigatoriamente a estrutura abaixo.

---

## Estrutura Obrigatória

A página deve conter:

1. Cabeçalho da página
2. Área de ações principais
3. Área de filtros
4. Tabela de registros
5. Linha inferior de paginação e resumo

---

## Ordem Visual Obrigatória

┌─────────────────────────────┐
│ Título da Página            │
│ Subtítulo opcional          │
├─────────────────────────────┤
│ Botão Criar Registro        │
├─────────────────────────────┤
│ Filtros e Busca             │
├─────────────────────────────┤
│ Tabela de Registros         │
├─────────────────────────────┤
│ Quantidade + Paginação      │
└─────────────────────────────┘

---

## Regras do Cabeçalho

O topo da página deve conter:
- título
- descrição opcional
- alinhamento horizontal
- espaçamento consistente

Exemplo:
- Clientes
- Gerencie os clientes cadastrados no sistema

---

## Regras do Botão Principal

A página deve possuir:
- um CTA principal
- alinhado à direita
- acima da tabela
- utilizando variante primária
- Texto deve seguir o seguinte padrão "+ Novo + [Nome do Recurso]", por exemplo, "+ Novo Cliente".
    - O "+" deve ser sempre em formato de ícone.

---

## Regras do Filtro e Busca

- Deve ser um botão com icone de funil.
- Deve ser alinhado à esquerda, acima da tabela.
- Deve abrir um modal para seleção de filtros.
- Os filtros devem ser aplicados assim que o usuário clicar em "Aplicar Filtros" ou pressionar Enter em algum campo.
- O modal deve possuir:
    - Um botão "Aplicar Filtros"
    - Um botão "Limpar Filtros"
- Deve haver uma área acima da tabela para exibir os filtros aplicados.
    - Esta área deve possuir um botão para remover todos os filtros.
    - Esta área deve possuir um botão para remover cada filtro individualmente.

---

## Regras da Tabela

A tabela deve:
- ocupar largura total
- possuir cabeçalho destacado
- utilizar zebra opcional
- possuir hover em linhas
- possuir estado vazio
- possuir loading state
- Em cada coluna deve haver um ícone de ordenação.
- Ao clicar no cabeçalho de uma coluna, a tabela deve ser ordenada por aquela coluna.
    - Se já estiver ordenada por aquela coluna, deve ser ordenada em ordem decrescente.
    - Se não estiver ordenada por aquela coluna, deve ser ordenada em ordem crescente.
- Em cada linha deve haver uma coluna de ações na ultima coluna
    - O botão de visualização deve ter um icone de olho azul
    - O botão de edição deve ter um icone de lapis verde
    - O botão de exclusão deve ter um icone de lixeira vermelha
    - Ao clicar no botão de exclusão deve abrir uma modal para o usuário digitar "delete" para confirmar a exclusão. Se o usuário digitar a palavra corretamente, o registro deve ser excluído.

---

## Regras da Paginação

A linha inferior deve conter:

Esquerda:
- quantidade total de registros
- faixa atual paginada

Direita:
- controles de paginação

Exemplo:
"Mostrando 1–10 de 120 registros"

---

## Responsividade

Mobile:
- tabela deve permitir scroll horizontal
- ações secundárias devem colapsar
- paginação simplificada

Desktop:
- layout expandido
- filtros horizontais

---

## Estados Obrigatórios

A página deve possuir:
- Carregando
- Estado vazio
- Estado de erro
- Nenhum resultado encontrado

---

## Restrições

Nunca:
- colocar botão de criação abaixo da tabela
- misturar paginação no topo
- criar tabelas sem estado vazio
- utilizar múltiplos CTAs primários
- alterar ordem estrutural da página

---

## Exemplo de Estrutura React

<PageLayout>
  <PageHeader />
  <PageActions />
  <PageFilters />
  <DataTable />
  <PaginationFooter />
</PageLayout>