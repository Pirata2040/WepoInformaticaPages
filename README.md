# Wepo Informática — site + painel administrativo

Site institucional responsivo em HTML/CSS/JavaScript, preparado para GitHub Pages, com catálogo de produtos e serviços armazenado no Supabase.

## Pastas

- `index.html`: página inicial.
- `02-quem-somos/`: apresentação da empresa.
- `03-produtos/`: catálogo dinâmico de produtos.
- `04-servicos/`: catálogo dinâmico de serviços.
- `05-contato/`: formulário de solicitações e abertura do WhatsApp.
- `admin/`: login e painel para cadastrar, editar, ocultar ou excluir itens.
- `assets/js/supabase-config.js`: URL e **chave publicável** do projeto Supabase.
- `supabase/`: SQL para criar tabelas, RLS, Storage e opcionalmente itens demonstrativos.

**Comece por [COMO_ATIVAR_SUPABASE.md](COMO_ATIVAR_SUPABASE.md).** Sem criar o projeto, executar o SQL e inserir a URL/chave pública, o painel ainda não se conecta ao banco.

**Importante:** nunca inclua senha, secret key ou service_role do Supabase neste repositório. O site público mantém formulários com validação de CPF/CNPJ e informações de contato, mas não realiza pagamento nem armazena pedidos no banco.
