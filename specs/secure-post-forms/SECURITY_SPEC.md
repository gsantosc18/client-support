# SECURITY SPEC: Utilização de Método POST Explícito nos Formulários de Autenticação

- **Mitigação de Exposição**: Definir explicitamente `method="post"` impede que dados confidenciais (endereços de e-mail e senhas em texto puro) sejam expostos e guardados nos logs do servidor, logs do provedor de acesso, ou histórico do navegador na barra de endereços (o que aconteceria caso uma falha na interrupção do envio nativo executasse a submissão via `GET`).
- **Autofill de Senhas**: Melhora a integridade da comunicação com o gerenciador de chaves do navegador, promovendo maior segurança geral.
