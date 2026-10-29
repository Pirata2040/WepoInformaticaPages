/* Wepo Informática — Vanilla JS, sem dependências nem armazenamento de dados pessoais. */
(() => {
  'use strict';
  let SERVICES = {
    diagnostico: 'Diagnóstico de computador', manutencao: 'Manutenção de notebook ou PC',
    limpeza: 'Limpeza preventiva', ssd: 'Instalação de SSD ou memória',
    software: 'Configuração de programas', rede: 'Configuração de rede Wi-Fi'
  };
  let PRODUCTS = {
    mouse: 'Mouse sem fio', teclado: 'Teclado USB', ssd: 'SSD SATA 480 GB',
    headset: 'Headset com microfone', monitor: 'Monitor Full HD', roteador: 'Roteador Wi-Fi'
  };
  const STATES = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
  const get = id => document.getElementById(id);
  const digits = value => String(value || '').replace(/\D/g, '');
  const clean = value => String(value || '').trim().replace(/\s+/g, ' ');

  const year = get('year'); if (year) year.textContent = String(new Date().getFullYear());
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const nav = get('primary-navigation');
  if (toggle && nav) {
    const close = () => { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menu'); header.classList.remove('menu-open'); };
    toggle.addEventListener('click', () => {
      const opening = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(opening));
      toggle.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
      header.classList.toggle('menu-open', opening);
    });
    nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    document.addEventListener('click', e => { if (header && !header.contains(e.target)) close(); });
  }
  const search = get('product-search'), category = get('product-category');
  if (search && category) {
    const update = () => {
      const term = clean(search.value).toLocaleLowerCase('pt-BR');
      let count = 0;
      document.querySelectorAll('.product-card').forEach(card => {
        const visible = (category.value === 'todos' || card.dataset.category === category.value) &&
          (card.dataset.title.includes(term) || card.textContent.toLocaleLowerCase('pt-BR').includes(term));
        card.hidden = !visible;
        if (visible) count += 1;
      });
      if (get('no-products')) get('no-products').hidden = count !== 0;
    };
    search.addEventListener('input', update); category.addEventListener('change', update);
  }
  const form = get('request-form');
  if (!form) return;
  const requestType = get('request-type'), serviceId = get('service-id'), productId = get('product-id');
  const review = get('message-review'), preview = get('message-preview'), formStatus = get('form-status');
  const serviceSection = get('service-choice'), productSection = get('product-choice'), addressSection = get('address-fields');
  const serviceDocSection = document.querySelector('.service-only'), quantitySection = document.querySelector('.product-only');
  const doc = get('client-doc'), phone = get('client-phone'), cep = get('client-cep');
  const setOptions = (select, values) => {
    Object.entries(values).forEach(([key, value]) => {
      const option = document.createElement('option'); option.value = key; option.textContent = value; select.append(option);
    });
  };
  setOptions(serviceId, SERVICES); setOptions(productId, PRODUCTS);
  const uf = get('client-state');
  STATES.forEach(value => { const option = document.createElement('option'); option.value = value; option.textContent = value; uf.append(option); });
  uf.value = 'GO';
  get('client-city').value = 'Pontalina';
  const params = new URLSearchParams(window.location.search);
  const requestedType = params.get('tipo');
  const requestedId = params.get('item');
  if (['servico', 'produto', 'contato'].includes(requestedType)) requestType.value = requestedType;
  if (requestedType === 'servico' && Object.hasOwn(SERVICES, requestedId)) serviceId.value = requestedId;
  if (requestedType === 'produto' && Object.hasOwn(PRODUCTS, requestedId)) productId.value = requestedId;

  // Quando o Supabase estiver ativo, o formulário passa a usar os itens publicados no banco.
  // Não usa cache local de dados pessoais e preserva o formulário original.
  if (window.WepoDB?.client) {
    const submitButton = form.querySelector('button[type="submit"]');
    const currentValues = {service:serviceId.value,product:productId.value};
    if (submitButton) submitButton.disabled = true;
    formStatus.hidden = false;
    formStatus.textContent = 'Carregando produtos e serviços atualizados...';
    Promise.all([window.WepoDB.catalog('servico'), window.WepoDB.catalog('produto')]).then(([services,products]) => {
      SERVICES = Object.fromEntries(services.map(item=>[item.id,item.title]));
      PRODUCTS = Object.fromEntries(products.map(item=>[item.id,item.title]));
      serviceId.replaceChildren(new Option('Selecione o serviço',''));
      productId.replaceChildren(new Option('Selecione o produto',''));
      setOptions(serviceId,SERVICES);setOptions(productId,PRODUCTS);
      const sWanted = requestedType === 'servico' ? requestedId : currentValues.service;
      const pWanted = requestedType === 'produto' ? requestedId : currentValues.product;
      if (Object.hasOwn(SERVICES,sWanted)) serviceId.value=sWanted;
      if (Object.hasOwn(PRODUCTS,pWanted)) productId.value=pWanted;
      if (submitButton) submitButton.disabled = false;
      formStatus.hidden = true;
    }).catch(err=>{
      console.error('Catálogo indisponível',err);
      // Não permitir solicitações para itens de exemplo quando o banco estiver inacessível.
      SERVICES = {};PRODUCTS = {};
      serviceId.replaceChildren(new Option('Catálogo temporariamente indisponível',''));
      productId.replaceChildren(new Option('Catálogo temporariamente indisponível',''));
      if (submitButton) submitButton.disabled = false; // Contato geral ainda pode funcionar.
      formStatus.textContent = 'Produtos e serviços temporariamente indisponíveis. Para falar com a loja, escolha Dúvida geral.';
      formStatus.hidden = false;
    });
  }


  function showType() {
    const type = requestType.value;
    serviceSection.hidden = type !== 'servico';
    productSection.hidden = type !== 'produto';
    serviceDocSection.hidden = type !== 'servico';
    addressSection.hidden = !(type === 'servico' || type === 'produto');
    quantitySection.hidden = type !== 'produto';
    doc.required = type === 'servico';
    serviceId.required = type === 'servico'; productId.required = type === 'produto';
    ['client-cep','client-street','client-number','client-neighborhood','client-city','client-state'].forEach(id => {
      get(id).required = type === 'servico' || type === 'produto';
    });
    get('product-quantity').required = type === 'produto';
    const labels = {
      servico: ['Solicitar um serviço técnico', 'Descreva o atendimento desejado e informe seus dados para continuar.'],
      produto: ['Solicitar compra de um produto', 'Preencha seus dados e confirme o produto e a quantidade.'],
      contato: ['Enviar uma dúvida', 'Escreva sua mensagem e continue pelo WhatsApp.']
    };
    const label = labels[type] || ['Como podemos ajudar?', 'Selecione o tipo de contato e preencha os campos obrigatórios.'];
    get('form-heading').textContent = label[0]; get('form-description').textContent = label[1];
    for (const el of form.querySelectorAll('input, select, textarea')) el.removeAttribute('aria-invalid');
    form.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
    formStatus.hidden = true; review.hidden = true; form.hidden = false;
  }
  requestType.addEventListener('change', showType); showType();

  function formatPhone(value) {
    const d = digits(value).slice(0,11);
    if (d.length < 3) return d;
    if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2, d.length === 11 ? 7 : 6)}-${d.slice(d.length === 11 ? 7 : 6)}`;
  }
  function formatDoc(value) {
    const d = digits(value).slice(0,14);
    if (d.length <= 11) return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
  const formatCep = value => { const d=digits(value).slice(0,8); return d.length > 5 ? d.slice(0,5)+'-'+d.slice(5) : d; };
  phone.addEventListener('input', () => { phone.value = formatPhone(phone.value); });
  doc.addEventListener('input', () => { doc.value = formatDoc(doc.value); });
  cep.addEventListener('input', () => { cep.value = formatCep(cep.value); });

  function validCPF(value) {
    const d = digits(value); if (!/^\d{11}$/.test(d) || /^(\d)\1{10}$/.test(d)) return false;
    for (let step = 9; step <= 10; step++) {
      let sum = 0;
      for (let i=0; i<step; i++) sum += Number(d[i]) * (step+1-i);
      const check = (sum * 10) % 11;
      if (Number(d[step]) !== (check === 10 ? 0 : check)) return false;
    }
    return true;
  }
  function validCNPJ(value) {
    const d = digits(value); if (!/^\d{14}$/.test(d) || /^(\d)\1{13}$/.test(d)) return false;
    const weights = [[5,4,3,2,9,8,7,6,5,4,3,2],[6,5,4,3,2,9,8,7,6,5,4,3,2]];
    for (let step = 0;step<2;step++) {
      const sum = weights[step].reduce((acc,w,i)=>acc + w*Number(d[i]),0);
      const check = sum%11 < 2 ? 0 : 11 - sum%11;
      if (Number(d[12+step])!==check) return false;
    }
    return true;
  }
  function validDocument(value) { return validCPF(value) || validCNPJ(value); }
  // Only formatting/syntax are verified, not existence, ownership, or official registration.
  function fieldError(id, message) {
    const elem = get(id), error = get('error-'+id);
    if (elem) elem.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (error) error.textContent = message;
    return Boolean(message);
  }
  function validate() {
    const type=requestType.value, service = type==='servico', product=type==='produto';
    const values = {
      name:clean(get('client-name').value), phone:digits(phone.value), doc:digits(doc.value),
      cep:digits(cep.value), street:clean(get('client-street').value), number:clean(get('client-number').value),
      neighborhood:clean(get('client-neighborhood').value),city:clean(get('client-city').value), uf:uf.value,
      message:clean(get('client-message').value), quantity: Number(get('product-quantity').value)
    };
    let invalid=false;
    const check = (id,msg)=>{if(fieldError(id,msg)) invalid=true;};
    check('request-type',!['contato','servico','produto'].includes(type)?'Escolha o tipo de solicitação.':'');
    check('service-id',service && !Object.hasOwn(SERVICES,serviceId.value)?'Selecione o serviço desejado.':'');
    check('product-id',product && !Object.hasOwn(PRODUCTS,productId.value)?'Selecione o produto desejado.':'');
    check('client-name', !/^[\p{L}][\p{L}\s'’.-]{2,89}$/u.test(values.name) || !/\p{L}/u.test(values.name) ? 'Informe um nome válido, com pelo menos 3 letras e sem números.' : '');
    check('client-phone', !/^\d{10,11}$/.test(values.phone) || Number(values.phone.slice(0,2)) < 11 ? 'Informe um telefone com DDD e 10 ou 11 dígitos.' : '');
    check('client-doc', service && !validDocument(values.doc) ? 'Informe um CPF ou CNPJ válido (dígitos verificadores).' : '');
    for (const [id,value,min,label] of [
      ['client-street',values.street,5,'logradouro'],['client-neighborhood',values.neighborhood,2,'bairro'],
      ['client-city',values.city,2,'cidade']
    ]) check(id,(service||product) && (value.length<min || !/\p{L}/u.test(value)) ? 'Informe '+label+' válido.' : '');
    check('client-cep',(service||product) && !/^\d{8}$/.test(values.cep)?'Informe um CEP com 8 dígitos.':'');
    check('client-number',(service||product) && !/^(?:\d{1,7}[\p{L}]?|S\/?N)$/iu.test(values.number)?'Informe número válido ou S/N.':'');
    check('client-state',(service||product) && !STATES.includes(values.uf)?'Selecione um estado válido.':'');
    check('product-quantity',product && (!Number.isInteger(values.quantity)||values.quantity<1||values.quantity>99)?'Informe quantidade entre 1 e 99.':'');
    check('client-message',values.message.length<10||values.message.length>600?'Descreva sua solicitação (10 a 600 caracteres).':'');
    check('client-consent',!get('client-consent').checked?'Marque a autorização para continuar.':'');
    return invalid ? null : values;
  }
  function buildMessage(values) {
    const type=requestType.value;
    const lines = ['Olá, Wepo Informática!',''];
    if (type==='servico') lines.push('*Solicitação de serviço*','Serviço: '+SERVICES[serviceId.value]);
    else if(type==='produto') lines.push('*Interesse de compra*','Produto: '+PRODUCTS[productId.value],'Quantidade: '+values.quantity,'Preço e disponibilidade: a confirmar');
    else lines.push('*Contato geral*');
    lines.push('','Nome: '+values.name,'Telefone: '+formatPhone(values.phone));
    if(type==='servico') lines.push('CPF/CNPJ: '+formatDoc(values.doc));
    if(type==='servico' || type==='produto') {
      lines.push('CEP: '+formatCep(values.cep),'Endereço: '+values.street+', '+values.number,'Bairro: '+values.neighborhood,'Cidade/UF: '+values.city+'/'+values.uf);
    }
    lines.push('','Mensagem: '+values.message,'','Aguardo retorno para confirmar os detalhes.');
    return lines.join('\n');
  }
  let pendingMessage='';
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const values=validate();
    if(!values){ formStatus.hidden=false; formStatus.textContent='Corrija os campos destacados antes de continuar.'; formStatus.classList.add('error-status');
      const first=form.querySelector('[aria-invalid="true"]'); if(first)first.focus(); return; }
    formStatus.hidden=true;
    pendingMessage=buildMessage(values);
    preview.textContent=pendingMessage; // do not inject HTML from user input
    review.hidden=false; form.hidden=true;
    review.scrollIntoView({behavior:'smooth',block:'start'});
    get('send-whatsapp').focus({preventScroll:true});
  });
  get('edit-request').addEventListener('click',()=>{
    review.hidden=true; form.hidden=false; get('client-message').focus({preventScroll:true});
    form.scrollIntoView({behavior:'smooth',block:'start'});
  });
  get('send-whatsapp').addEventListener('click',()=>{
    const number=digits(window.WEPO_CONFIG?.whatsappNumber);
    if(!/^55\d{10,11}$/.test(number)){ alert('WhatsApp da empresa não configurado corretamente. Verifique assets/js/config.js.');return; }
    if(!pendingMessage)return;
    // Navigation occurs only after explicit review and user click. No client storage.
    window.location.href='https://wa.me/'+number+'?text='+encodeURIComponent(pendingMessage);
  });
  window.WepoValidators = Object.freeze({validCPF,validCNPJ,validDocument});
})();
