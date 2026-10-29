# Wepo Informática — habilitar o catálogo administrativo

O site continua estático no GitHub Pages. **Supabase** fornece autenticação, banco de dados e armazenamento de imagens. O pacote está preparado, mas **a conexão real só funcionará depois que você configurar seu projeto Supabase**. Não é preciso instalar Node nem fazer build.

## 1. Criar projeto Supabase

1. Acesse https://supabase.com/dashboard e crie um novo projeto (ou selecione um existente que você controla).
2. No Supabase, abra **SQL Editor**, crie uma consulta e cole o conteúdo **completo** de `supabase/01_schema_e_politicas.sql`; execute. Isso cria a tabela de catálogo, a tabela de administradores, a função de autorização, as regras RLS e o bucket de imagens.
3. Se quiser começar com o mesmo conteúdo demonstrativo da versão anterior, execute **uma vez** `supabase/02_catalogo_exemplos_OPCIONAL.sql`. **Esses itens não representam estoque real.** Se preferir começar vazio, não execute o segundo SQL.
4. No Dashboard, confirme que a API/Data API está ativada e que o schema `public` está exposto (padrão em muitos projetos).

## 2. Criar administrador (somente você)

1. No Supabase, abra **Authentication → Providers → Email** e **desative o cadastro público de novos usuários (Allow new users to sign up)**. Não precisa de cadastro pelo site.
2. Em **Authentication → Users**, crie seu usuário manualmente com e-mail e senha forte usando a opção **Add user**. Se houver opção de confirmar e-mail, confirme pelo dashboard.
3. Copie o **User UID** gerado para essa conta (UUID). No **SQL Editor**, execute o comando abaixo, substituindo o exemplo pelo UUID da **sua conta**. **Não coloque seu UUID, e-mail ou senha em arquivos versionados.**

```sql
insert into public.site_admins (user_id)
values ('00000000-0000-0000-0000-000000000000')
on conflict (user_id) do nothing;
```

**ATENÇÃO:** `00000000-0000-0000-0000-000000000000` é apenas um exemplo. Execute somente após substituir pelo UUID de um usuário real do Supabase. O registro de autorização só pode ser criado no SQL Editor por quem possui acesso administrativo ao banco; o site não oferece cadastro de administradores.

## 3. Configurar o site

Edite **`assets/js/supabase-config.js`** e preencha:

```js
window.WEPO_SUPABASE_CONFIG = Object.freeze({
  url: 'https://SEU-PROJETO.supabase.co',
  publishableKey: 'sb_publishable_SUA_CHAVE_PUBLICA'
});
```

A URL e a **publishable key** podem ser obtidas em **Project Settings → API Keys** ou **Connect**. Esses dois dados são públicos, adequados ao navegador quando RLS está corretamente ativado. **NUNCA copie secret key, service_role key, senha, JWT de sessão ou string de conexão para o projeto.**

## 4. Publicar no GitHub Pages

O novo site mantém `index.html` na raiz. Copie o conteúdo deste pacote para o repositório **`Pirata2040/WepoInformaticaPages`**, preferencialmente em uma branch de atualização e revise as diferenças com o que já foi alterado online.

Exemplo **após revisar os arquivos e confirmar a branch atual**:

```powershell
git status
git switch -c feature/painel-supabase
git add .
git commit -m "feat(admin): adiciona catalogo com Supabase e painel seguro"
git push -u origin feature/painel-supabase
```

Abra um Pull Request para a `main` e faça o merge. Confira **Settings → Pages** na branch `main`, pasta `/(root)`.

O painel ficará em:

**https://pirata2040.github.io/WepoInformaticaPages/admin/**

A rota é pública como endereço, mas **o acesso a dados de gestão e as operações de escrita são protegidos no servidor pelas políticas RLS**, não por esconder a URL. A URL do site público permanece:

**https://pirata2040.github.io/WepoInformaticaPages/**

## 5. O que pode gerenciar

- Cadastrar produto ou serviço com nome, categoria, descrição e ordem.
- Adicionar preço de produto ou deixar “Sob consulta”.
- Adicionar imagem por upload ao Storage (JPG, PNG, WebP, até 3 MB), ou usar uma ilustração local `assets/img/...`.
- Editar, ocultar/publicar ou excluir permanentemente itens.
- Filtrar a lista no painel por tipo e pesquisa.

**Atualização dinâmica:** Produtos e Serviços consultam o Supabase ao carregar a página. O Contato também carrega os itens **ativos** para preencher os seletores e manter o redirecionamento ao WhatsApp. Itens ocultos não são exibidos ao público. Se o Supabase ainda não estiver configurado, as páginas públicas continuam com os **exemplos originais**; o painel mostra um aviso de configuração.

## 6. Segurança e limites

- Autenticação por e-mail e senha via Supabase Auth, sem senha cadastrada no HTML/JS.
- A tabela `site_admins` não possui políticas públicas nem permissões para o navegador cadastrar administradores.
- RLS nos itens: qualquer visitante lê somente itens publicados; **somente contas incluídas em `site_admins`** podem criar, editar e excluir.
- Storage permite envio e exclusão apenas por administradores; imagens do catálogo são **públicas** por finalidade. Nunca envie documentos de clientes nesse bucket.
- A entrada de dados é validada na interface **e novamente por restrições do PostgreSQL**. Conteúdos são renderizados via `textContent`, sem interpretar HTML de descrições.
- Mantenha MFA no acesso ao painel do Supabase, use uma senha forte e desative autoinscrição. Para MFA adicional **no login do site**, será necessária uma ampliação de autenticação/políticas.
- O projeto **não** salva pedidos, CPF/CNPJ ou endereço em seu Supabase; o formulário atual só prepara uma mensagem para revisão no WhatsApp. Não envie dados de clientes ao banco de catálogo.
- Uma compra continua sendo uma **solicitação por WhatsApp**, não um pagamento online.
- **Não há acesso real ao seu projeto Supabase neste pacote**: é necessário executar o SQL e configurá-lo com seus dados públicos para testar o fluxo real de rede e permissões.

## 7. Testes após configurar (obrigatórios)

1. Em aba anônima, confira `Produtos` e `Serviços`. Itens `Oculto` não devem aparecer.
2. Em `/admin/`, tente login com usuário não-administrador: **deve negar acesso**.
3. Entre com a conta que consta em `site_admins`, cadastre um produto, edite, oculte e exclua.
4. Abra nova aba anônima e confirme que o catálogo reflete alterações após recarregar.
5. Clique em “Solicitar compra/atendimento”, confirme o item na página de contato e revise a mensagem do WhatsApp.
6. Verifique responsividade em celular e desktop e revise permissões com SQL Editor antes do uso comercial.

## Problemas comuns

- **“Supabase não configurado”**: falta URL/chave em `assets/js/supabase-config.js`, ou biblioteca CDN bloqueada.
- **Login correto, mas “conta não autorizada”**: faltou incluir o UUID exato em `public.site_admins`.
- **Permissão negada/42501**: falta política RLS ou privilégios, ou usuário não é admin.
- **Lista vazia**: dados ainda não foram cadastrados ou estão ocultos.
- **Erro de rede no GitHub Pages**: confira URL do projeto, console do navegador e regras de CSP.
- **Imagem não carrega**: confirme bucket `catalog-images`, URL e tipo de arquivo.
