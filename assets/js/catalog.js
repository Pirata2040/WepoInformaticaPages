/* Catálogo público — somente elementos DOM, sem inserção de HTML arbitrário. */
(() => {
  'use strict';
  const db = window.WepoDB;
  if (!db?.client) return; // Sem configuração: permanecem os exemplos originais.
  const kind = document.body.dataset.page === 'produtos' ? 'produto' :
    document.body.dataset.page === 'servicos' ? 'servico' : null;
  if (!kind) return;
  const grid = kind === 'produto' ? document.getElementById('product-grid') : document.querySelector('.services-grid');
  if (!grid) return;
  const info = document.createElement('p');
  info.className = 'catalog-live-status';
  info.setAttribute('role', 'status');
  info.textContent = 'Carregando catálogo atualizado...';
  grid.before(info);
  const el = (tag, cls, value) => { const n = document.createElement(tag); if (cls) n.className = cls; if (value !== undefined) n.textContent = String(value); return n; };
  function safeImage(value) {
    if (typeof value !== 'string') return '';
    if (/^assets\/img\/[a-z0-9_.-]+\.(svg|png|jpg|jpeg|webp)$/i.test(value))
      return '../' + value;
    try {
      const url = new URL(value);
      // Evita URLs javascript:, data: e de rastreamento externo: imagens somente no projeto Supabase.
      if (url.protocol === 'https:' && url.hostname === new URL(window.WEPO_SUPABASE_CONFIG.url).hostname &&
          url.pathname.startsWith('/storage/v1/object/public/catalog-images/')) return url.href;
    } catch { /* não utilizar */ }
    return '';
  }
  function product(item) {
    const card = el('article','product-card');
    card.dataset.category = item.category;
    card.dataset.title = item.title.toLocaleLowerCase('pt-BR');
    const img = el('img'); img.loading = 'lazy';
    img.src = safeImage(item.image_url) || '../assets/img/monitor.svg';
    img.alt = 'Imagem de ' + item.title;
    const body = el('div','product-content');
    body.append(el('span','product-category',item.category), el('h3','',item.title), el('p','',item.description));
    const bottom = el('div','product-bottom');
    const price = item.price === null ? 'Preço sob consulta' : new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(item.price);
    bottom.append(el('span','price-consult',price));
    const link = el('a','btn btn-small btn-dark','Solicitar compra ↗');
    link.href = '../05-contato/index.html?' + new URLSearchParams({tipo:'produto',item:item.id});
    bottom.append(link);body.append(bottom);card.append(img,body);return card;
  }
  function service(item,i) {
    const card = el('article','service-card');
    const top = el('div','service-top');
    const icon = el('span','service-icon','⚙');icon.setAttribute('aria-hidden','true');
    top.append(icon,el('span','service-number',String(i+1).padStart(2,'0')));
    card.append(top,el('h3','',item.title),el('p','',item.description));
    const link=el('a','text-link','Solicitar atendimento →');
    link.href='../05-contato/index.html?'+new URLSearchParams({tipo:'servico',item:item.id});
    card.append(link);return card;
  }
  db.catalog(kind).then(items => {
    grid.replaceChildren(...items.map((item,i)=>kind==='produto'?product(item):service(item,i)));
    if (kind==='produto') {
      const selector = document.getElementById('product-category');
      if (selector) {
        const selection = selector.value;
        selector.replaceChildren(new Option('Todas as categorias','todos'),
          ...[...new Set(items.map(x=>x.category))].sort().map(x=>new Option(x,x)));
        selector.value = [...selector.options].some(x=>x.value===selection)?selection:'todos';
        document.getElementById('product-search')?.dispatchEvent(new Event('input'));
      }
      const title = document.querySelector('.catalog-controls h2');
      if (title) title.textContent = 'Catálogo atualizado';
      const note = document.querySelector('.catalog-note');
      if (note) note.textContent = 'Consulte disponibilidade e condições com a equipe antes de confirmar a compra.';
    }
    info.textContent = items.length ? '' : 'Nenhum item disponível no momento.';
    info.hidden = items.length > 0;
  }).catch(err=>{
    console.error('Falha ao carregar catálogo',err);
    info.textContent='Não foi possível atualizar o catálogo. Os exemplos abaixo podem estar desatualizados.';
  });
})();
