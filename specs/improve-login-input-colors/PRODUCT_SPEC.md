# PRODUCT SPEC: Cores Claras nos Inputs de Autenticação

## Objetivos da Feature / Bug Fix
- Ajustar os campos de entrada de dados (`Input`) para exibir sempre um plano de fundo claro com texto digitado escuro, eliminando qualquer contraste reverso ou texto invisível causado por preferências de Dark Mode do sistema ou do navegador.

## Requisitos Funcionais
- O campo de input deve renderizar fundo claro (ex: `bg-white`) e texto escuro (ex: `text-slate-900`) independentemente do tema do sistema operacional ou do navegador.

## Regras de Negócio
- Garantir excelente acessibilidade visual e contraste conforme a diretriz de design do projeto (fundo claro e fonte escura).

## Critérios de Aceite
- Ao digitar dados nos campos de Login, Senha, E-mail ou Confirmação de Senha, o texto inserido deve estar em tom escuro (`text-slate-900`) sobre o fundo claro (`bg-white`).
