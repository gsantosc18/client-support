# Database Specification: Landing Page

Este documento define os impactos ou modificações no banco de dados.

---

## 1. Modificações de Esquema

Esta funcionalidade trata-se exclusivamente de uma mudança visual e de fluxos de navegação no frontend. **Não há qualquer necessidade de alteração de tabelas, índices ou constraints no banco de dados.**

A persistência do estado de autenticação continua a ser feita no cliente via Web Storages (`localStorage`/`sessionStorage`).
