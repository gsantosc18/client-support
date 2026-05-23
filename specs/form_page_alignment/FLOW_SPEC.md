# Flow Specification — Alinhamento de Páginas de Formulário

Este documento descreve os fluxos de interação do usuário ao manipular e submeter formulários no sistema.

---

## 1. Fluxo de Validação e Submissão Assíncrona

```mermaid
sequenceDiagram
    autonumber
    actor Usuario as Usuário
    participant UI as FormComponent (UI)
    participant RHF as React Hook Form
    participant Schema as Zod Schema
    participant API as Backend API

    Usuario->>UI: Insere caracteres nos Inputs
    Usuario->>UI: Clica em "Salvar"
    UI->>RHF: Aciona gatilho de submissão (handleSubmit)
    RHF->>Schema: Executa verificação do esquema
    
    alt Esquema possui Erros de Validação
        Schema-->>RHF: Retorna erros mapeados por campo
        RHF-->>UI: Injeta mensagens de erro nos wrappers de FormField
        UI-->>Usuario: Exibe feedbacks vermelhos sob os inputs
    else Esquema Válido
        Schema-->>RHF: Retorna payload limpo e sanitizado
        RHF->>UI: Executa função onSubmit(data)
        UI->>UI: Entra em estado de Loading (isLoading = true)
        UI->>UI: Desabilita todos os inputs e botões de ação
        UI->>API: Envia requisição HTTP (POST/PUT)
        
        alt API Retorna Sucesso (2xx)
            API-->>UI: Retorna payload do recurso
            UI->>Usuario: Redireciona para página de listagem (/clients ou /processes)
        else API Retorna Falha (4xx/5xx)
            API-->>UI: Retorna erro detalhado do servidor
            UI->>UI: Reverte isLoading = false
            UI->>UI: Habilita inputs e botões de ação
            UI->>UI: Exibe banner global de erro (FormContainer errorMessage)
        end
    end
```

---

## 2. Comportamento Acessível do Fluxo

- **Foco no Primeiro Erro**: Quando a validação falha no lado do cliente, o cursor do teclado (`focus`) deve se mover automaticamente para o primeiro campo de input inválido detectado, aumentando a acessibilidade por leitores de tela e navegação por teclado.
- **Prevenção de Fugas**: Durante a submissão, pressionar a tecla `Enter` ou clicar em qualquer elemento do formulário deve ser interceptado e ignorado, garantindo a atomicidade da requisição HTTP em andamento.
