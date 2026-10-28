# Requisitos — Wepo Informática (versão inicial)

Este documento adapta os requisitos do projeto anterior Prisma Cursos a uma loja de informática. É uma **especificação proposta** que precisa ser validada com a empresa antes da implantação comercial.

## Requisitos funcionais (RF)

| ID | Requisito | Critério de aceite | Status na demonstração |
|---|---|---|---|
| RF01 | Navegação fixa | Cabeçalho com Início, Quem Somos, Produtos, Serviços, Contato, sem links internos quebrados | Implementado |
| RF02 | Responsividade | Menu recolhível em tablet e celular, com `aria-expanded` | Implementado |
| RF03 | Página inicial | Apresentação da loja, destaques e CTAs para produtos/serviços | Implementado |
| RF04 | Quem Somos | Informações públicas verificáveis, endereço e atividade econômica | Implementado, sujeito à aprovação da empresa |
| RF05 | Catálogo de produtos | Lista de itens com categoria, descrição e opção de compra por mensagem | Implementado com produtos ilustrativos |
| RF06 | Serviços e solicitações | Lista de opções, CTA leva à página Contato com serviço identificado | Implementado; serviços a validar com a loja |
| RF07 | Contato | Telefone, endereço, localização e formulário com tipo de solicitação | Implementado; confirmar WhatsApp |
| RF08 | Campos obrigatórios | Nome, telefone e descrição; serviço também CPF/CNPJ e endereço; produto também endereço e quantidade | Implementado |
| RF09 | Validação CPF/CNPJ | Máscara e validação algorítmica dos dígitos verificadores, bloqueando números inválidos | Implementado |
| RF10 | Validação endereço | CEP (8 dígitos), logradouro, número ou S/N, bairro, cidade e UF exigidos | Implementado; não valida existência física |
| RF11 | Consulta de compra | Produto e quantidade enviados na mensagem de interesse via WhatsApp | Implementado; não é checkout/pagamento |
| RF12 | Solicitação de serviço | Dados do serviço + dados pessoais exibidos para revisão antes do WhatsApp | Implementado |
| RF13 | Contato geral | Mensagem livre com preenchimento e validação | Implementado |
| RF14 | Revisão e consentimento | Exige aceite do aviso e exibe mensagem antes de abrir WhatsApp | Implementado |

## Requisitos não funcionais (RNF)

| ID | Categoria | Requisito | Situação |
|---|---|---|---|
| RNF01 | Implementação | HTML5, CSS3 e JavaScript sem dependências obrigatórias | Implementado |
| RNF02 | Confiabilidade | Links e referências locais válidos; rotas de item usam IDs predefinidos | Testado estaticamente |
| RNF03 | Desempenho | Navegação simples sem bibliotecas remotas ou grandes imagens raster | Implementado; validar em rede real |
| RNF04 | Responsividade | Desktop 1920×1080, tablet 768×1024 e mobile 360×800 | Testado em renderização local |
| RNF05 | UI/UX | Paleta consistente, tipografia e componentes reutilizados | Implementado |
| RNF06 | Versionamento | GitHub, branches por funcionalidade, Conventional Commits | Preparado para o usuário versionar |
| RNF07 | Organização | Separação de HTML/CSS/JS/recursos, nomes e funções claros | Implementado |
| RNF08 | Publicação | Hospedagem estática HTTPS pelo GitHub Pages | Pronto para publicação; não foi publicado |
| RNF09 | Segurança (entrada) | Campos requeridos, tamanhos máximos, máscara e validação de dados | Implementado no cliente; servidor necessário para garantia forte |
| RNF10 | Segurança (XSS) | Não inserir valores do usuário via `innerHTML`, restringir item de URL a listas confiáveis | Implementado |
| RNF11 | Segurança (CSP) | Política de Conteúdo para limitar scripts, estilos e imagens | Meta CSP implementada; avaliar políticas por cabeçalho em produção |
| RNF12 | Privacidade | Não persistir CPF/CNPJ/endereço em cookies, storage ou banco local | Implementado |
| RNF13 | Transparência | Exibir finalidade de envio ao WhatsApp e exigir confirmação consciente | Implementado; política final requer aprovação da empresa |
| RNF14 | Segurança operacional | Confirmar número comercial antes do atendimento; evitar dados financeiros e senhas | Avisos presentes; validação humana pendente |

### Limites importantes

- A validação de CPF/CNPJ confirma apenas estrutura e dígitos verificadores; não comprova titularidade ou regularidade.
- A validação de CEP/endereço confirma apenas o formato; não consulta banco de endereços.
- A mensagem de WhatsApp inclui o CPF/CNPJ (quando serviço) **na URL do serviço WhatsApp**, o que exige especial cuidado com privacidade, especialmente em computadores compartilhados. Para um ambiente comercial, considere reduzir os dados compartilhados e usar um fluxo seguro com backend.
- A solicitação de compra gera um pedido de atendimento, sem transação financeira. Estoque, preços, entrega e condições precisam ser confirmados.
- Números, catálogo e serviços devem ser aprovados pela Wepo antes de divulgar a página para clientes reais.
