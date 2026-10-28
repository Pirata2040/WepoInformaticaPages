# Wepo Informática — site institucional e catálogo por WhatsApp

Projeto web estático em HTML, CSS e JavaScript baseado na organização do projeto **Prisma Cursos**, com navegação, cabeçalho, rodapé, cards, páginas separadas e design responsivo. Não depende de servidor nem de serviços externos para renderizar.

## Estrutura

- `index.html` — Início
- `02-quem-somos/index.html` — informações institucionais
- `03-produtos/index.html` — produtos demonstrativos, filtros e solicitação de compra
- `04-servicos/index.html` — serviços demonstrativos e solicitação de atendimento
- `05-contato/index.html` — formulário para compra, serviço ou dúvida e revisão antes do WhatsApp
- `privacidade.html` — aviso simplificado de dados pessoais
- `assets/css/style.css` — identidade visual e responsividade
- `assets/js/app.js` — navegação, filtros, máscaras, validações e mensagem do WhatsApp
- `assets/js/config.js` — **telefone para WhatsApp**
- `assets/img/` — ilustrações vetoriais originais para produtos (não fotos nem inventário real)

## Configuração obrigatória antes da publicação

1. **Confirme o número do WhatsApp da empresa.** O contato `(64) 98401-6476` veio de listagem pública de telefone da empresa, mas **não foi possível verificar que está habilitado no WhatsApp**. Altere `whatsappNumber` em `assets/js/config.js` para o telefone comercial correto, em formato internacional com 55: `55649XXXXXXXX`. Antes disso, não compartilhe o site com clientes reais.
2. **Confirme catálogo e serviços.** Os seis produtos e seis serviços são exemplos de interface e não comprovam estoque, disponibilidade nem preços. Edite os arrays e cards no HTML e JS.
3. **Aprove os dados do cadastro.** Endereço/CNPJ foram obtidos de fontes públicas, não de comunicado oficial da loja.
4. **Privacidade/LGPD.** A exigência de CPF/CNPJ para solicitação é pedido de projeto; avalie se é de fato necessária para cada operação. Os dados são incluídos no texto da URL de WhatsApp, com possíveis reflexos em histórico/serviços externos. Para operação real, procure orientação sobre base legal, transparência, minimização e mecanismos de processamento seguro. Não há autenticação nem back-end, e a validação é só no navegador.

## Funcionamento

- Os links dos cards incluem **somente IDs predefinidos** na URL `?tipo=servico&item=...` ou `?tipo=produto&item=...`; nunca CPF ou endereço.
- A página Contato mostra o tipo e item, exige campos obrigatórios conforme o fluxo, valida CPF/CNPJ (dígitos verificadores), CEP, nome, telefone, endereço, cidade/UF, quantidade e tamanho da mensagem.
- O usuário precisa aceitar o aviso, **revisar a mensagem** e clicar explicitamente em **Abrir WhatsApp**. Só então o link `https://wa.me/` é aberto, ainda sem enviar a mensagem automaticamente.
- Não é feito upload, persistência de CPF/CNPJ, analytics nem armazenamento no `localStorage`/cookies.
- Não há pagamento, emissão de nota, controle de estoque nem confirmação automática de compra.

## Requisitos de segurança implementados

- Restrições de entrada e validação no front-end: sem formulários vazios; limites de tamanho; CPF/CNPJ por módulo 11.
- Dados de URL limitados a IDs conhecidos (não são inseridos como HTML).
- Apresentação dos dados com `textContent`, evitando injeção HTML.
- Política de Segurança de Conteúdo (CSP) via meta tag; arquivos locais de CSS/JS; sem bibliotecas remotas, sem `eval`.
- Links externos com `rel="noopener noreferrer"`.
- Dados nunca são transmitidos antes do clique consciente no WhatsApp. Para garantias fortes de segurança, é necessário um back-end.

## Publicação (GitHub Pages)

Crie um repositório separado da Prisma Cursos. Envie **o conteúdo desta pasta** para a raiz da branch `main`, depois configure `Settings > Pages > Deploy from a branch > main > /(root)`. O `index.html` inicial está na raiz. Use HTTPS disponibilizado pelo GitHub Pages.

## Fontes sobre a Wepo (consulta em outubro de 2026)

- Cadastro de empresa ativa / endereço / 2013 / CNPJ: https://www.breveia.com.br/fornecedores/empresa/18232010000118/
- Listagem de comércio local com endereço / telefone: encontrada via busca de negócios para Wepo Informática, Pontalina, GO. Confirme os dados antes de publicação.
- Não usar o antigo cadastro Wepo On Line LTDA CNPJ 05.317.580/0001-69 (baixado) como se fosse a empresa atual.
