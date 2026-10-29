/* Administração Wepo — autenticação Supabase + RLS (não há senha no JavaScript). */
(() => {
  'use strict';
  const db = window.WepoDB;
  const $ = id => document.getElementById(id);
  const status = $('admin-status');
  const login = $('login-panel');
  const dashboard = $('dashboard');
  const editor = $('editor');
  const form = $('item-form');
  const list = $('admin-list');
  const saveButton = $('save-item');
  const client = db?.client;
  let records = [], currentId = null, saving = false;
  const say = (msg, error = false) => {
    status.textContent = msg;
    status.classList.toggle('admin-error', error);
  };
  const errorText = err => {
    console.error('Operação do catálogo', err);
    return 'Não foi possível concluir a operação. Verifique conexão, permissões e configuração do Supabase.';
  };
  const el = (tag, className, value) => {
    const elem=document.createElement(tag);
    if (className) elem.className=className;
    if (value!==undefined) elem.textContent=String(value);
    return elem;
  };
  const safeImage = value => {
    const txt=String(value||'').trim();
    if (!txt) return null;
    if (/^assets\/img\/[a-z0-9_.-]+\.(svg|png|jpg|jpeg|webp)$/i.test(txt)) return txt;
    try {
      const url = new URL(txt);
      if (url.protocol === 'https:' && url.hostname === new URL(window.WEPO_SUPABASE_CONFIG.url).hostname &&
        url.pathname.startsWith('/storage/v1/object/public/catalog-images/')) return url.href;
    } catch { /* URL inválida */ }
    return null;
  };
  if (!client) {
    login.hidden=true;
    say('É necessário configurar a URL e a chave publicável do Supabase em assets/js/supabase-config.js.',true);
    return;
  }
  function showLogin() {
    login.hidden=false;dashboard.hidden=true;$('sign-out').hidden=true;
  }
  function showDashboard() {
    login.hidden=true;dashboard.hidden=false;$('sign-out').hidden=false;
  }
  async function isAuthorized() {
    const {data:{user},error:userError}=await client.auth.getUser();
    if(userError || !user) return false;
    const {data,error}=await client.rpc('is_site_admin');
    if(error) throw error;
    return data === true;
  }
  async function initial() {
    say('Verificando sessão e permissões...');
    try {
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        showLogin();say('Informe seu e-mail e senha para entrar.');return;
      }
      if (!(await isAuthorized())) {
        await client.auth.signOut();showLogin();say('Esta conta não está autorizada como administradora.',true);return;
      }
      showDashboard();await load();say('Painel pronto. As alterações serão salvas no Supabase.');
    } catch (err) {
      showLogin();say(errorText(err),true);
    }
  }
  $('login-form').addEventListener('submit',async event=>{
    event.preventDefault();
    const email=$('login-email').value.trim(), password=$('login-password').value;
    if (!email || !password) {say('Preencha e-mail e senha.',true);return;}
    const button=event.currentTarget.querySelector('button[type=submit]');
    button.disabled=true;say('Validando credenciais...');
    try {
      const {error}=await client.auth.signInWithPassword({email,password});
      if(error) throw error;
      $('login-password').value='';
      if(!(await isAuthorized())) {
        await client.auth.signOut();showLogin();say('A conta existe, mas não foi cadastrada como administradora.',true);return;
      }
      showDashboard();await load();say('Login realizado. Bem-vindo ao painel.');
    } catch(err) {console.error('Falha no login',err);say('Login não autorizado. Confira suas credenciais e acesso de administrador.',true);}
    finally {button.disabled=false;}
  });
  $('sign-out').addEventListener('click',async()=>{
    await client.auth.signOut();records=[];list.replaceChildren();resetEditor();showLogin();say('Você saiu do painel.');
  });
  async function load() {
    const {data,error}=await client.from('catalog_items')
      .select('id,kind,title,description,category,price,image_url,active,sort_order,created_at')
      .order('sort_order', { ascending:true }).order('title');
    if(error) throw error;
    records=data||[];render();
  }
  function render() {
    const type=$('filter-kind').value;
    const q=$('filter-search').value.trim().toLocaleLowerCase('pt-BR');
    const filtered=records.filter(item => (type==='todos'||type===item.kind) &&
      (!q || (item.title+' '+item.category+' '+item.description).toLocaleLowerCase('pt-BR').includes(q)));
    list.replaceChildren();
    if(!filtered.length) {list.append(el('p','admin-empty','Nenhum item encontrado.'));return;}
    for (const item of filtered) {
      const card=el('article','admin-item');
      const data=el('div','admin-item-body');
      const tags=el('div','admin-item-tags');
      tags.append(el('span','admin-tag',item.kind==='produto'?'Produto':'Serviço'),
        el('span','admin-tag '+(item.active?'admin-published':'admin-draft'),item.active?'Publicado':'Oculto'));
      data.append(tags,el('h3','',item.title),el('p','',item.category+' · '+(item.price===null?'Sob consulta':new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(item.price))));
      const actions=el('div','admin-item-actions');
      const edit=el('button','btn btn-small btn-secondary','Editar'); edit.type='button';
      edit.addEventListener('click',()=>editItem(item.id));
      const remove=el('button','btn btn-small admin-delete','Excluir');remove.type='button';
      remove.addEventListener('click',()=>deleteItem(item.id));
      actions.append(edit,remove);card.append(data,actions);list.append(card);
    }
  }
  $('filter-kind').addEventListener('change',render);
  $('filter-search').addEventListener('input',render);
  function updateKind() {
    const product=$('item-kind').value==='produto';
    $('price-field').hidden=!product;
    if(!product) $('item-price').value='';
  }
  $('item-kind').addEventListener('change',updateKind);
  function resetEditor() {
    currentId=null;editor.hidden=true;form.reset();$('item-image-url').value='';$('item-remove-image').checked=false;
    $('item-kind').disabled=false;updateKind();
  }
  function beginEditor(item) {
    currentId=item?.id||null;
    $('editor-title').textContent=item?'Editar item':'Cadastrar item';
    form.reset();
    $('item-kind').value=item?.kind||'produto';
    $('item-kind').disabled=Boolean(item); // Não mudar tipo de um item já cadastrado.
    $('item-title').value=item?.title||'';
    $('item-category').value=item?.category||'';
    $('item-description').value=item?.description||'';
    $('item-price').value=item?.price===null || item?.price===undefined?'':String(item.price).replace('.',',');
    $('item-order').value=item?.sort_order??0;
    $('item-active').checked=item?.active??true;
    $('item-image-url').value=item?.image_url||'';
    $('item-photo').value='';$('item-remove-image').checked=false;
    editor.hidden=false;updateKind();
    editor.scrollIntoView({behavior:'smooth',block:'start'});
    $('item-title').focus({preventScroll:true});
  }
  $('new-item').addEventListener('click',()=>beginEditor(null));
  $('cancel-item').addEventListener('click',resetEditor);
  function editItem(id) { const item=records.find(x=>x.id===id);if(item)beginEditor(item); }
  async function deleteItem(id) {
    const item=records.find(x=>x.id===id);if(!item)return;
    if (!window.confirm('Excluir permanentemente “'+item.title+'”? Esta ação não poderá ser desfeita.')) return;
    say('Excluindo item...');
    try {
      const {data,error}=await client.from('catalog_items').delete().eq('id',id).select('id');
      if(error) throw error;
      if(!data?.length) throw new Error('Nenhum item foi excluído.');
      if(currentId===id)resetEditor();
      await load();say('Item excluído do catálogo.');
    }catch(err){say(errorText(err),true);}
  }
  async function upload(photo,kind) {
    const allowed={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
    const ext=allowed[photo.type];
    if(!ext || photo.size>3*1024*1024 || photo.size===0) throw new Error('Imagem inválida. Envie PNG, JPG ou WebP com até 3 MB.');
    const path=kind+'/'+crypto.randomUUID()+'.'+ext;
    const {error}=await client.storage.from('catalog-images').upload(path,photo,{contentType:photo.type,upsert:false,cacheControl:'3600'});
    if(error)throw error;
    const {data}=client.storage.from('catalog-images').getPublicUrl(path);
    return data.publicUrl;
  }
  form.addEventListener('submit',async(event)=>{
    event.preventDefault();if(saving)return;
    const kind=$('item-kind').value;
    const title=$('item-title').value.trim().replace(/\s+/g,' ');
    const category=$('item-category').value.trim().replace(/\s+/g,' ');
    const description=$('item-description').value.trim();
    const priceRaw=$('item-price').value.trim().replace(',','.');
    const price=kind==='produto' && priceRaw!==''?Number(priceRaw):null;
    const order=Number($('item-order').value);
    const photo=$('item-photo').files[0];
    const removeImage=$('item-remove-image').checked;
    let imageURL=$('item-image-url').value.trim();
    if(!['produto','servico'].includes(kind) || title.length<3||title.length>100||
      category.length<2||category.length>60||description.length<10||description.length>1200||
      !Number.isInteger(order)||order<0||order>9999||
      (price!==null&&(!Number.isFinite(price)||price<0||price>9999999999.99||!/^\d{1,10}(?:[.,]\d{1,2})?$/.test($('item-price').value.trim())))) {
      say('Corrija nome, descrição, categoria, preço e ordem. Nenhum campo obrigatório pode ficar vazio.',true);return;
    }
    if(photo && (photo.size>3*1024*1024||!['image/png','image/jpeg','image/webp'].includes(photo.type))) {
      say('Imagem inválida: use JPG, PNG ou WebP com até 3 MB.',true);return;
    }
    if(imageURL && !safeImage(imageURL)) {say('URL de imagem inválida. Use assets/img/... ou uma imagem do Storage deste Supabase.',true);return;}
    if(removeImage) imageURL='';
    saving=true;saveButton.disabled=true;say('Salvando item no banco de dados...');
    try {
      if(photo) imageURL=await upload(photo,kind);
      const payload={kind,title,category,description,price,sort_order:order,active:$('item-active').checked,image_url:imageURL||null};
      const action=currentId ? client.from('catalog_items').update(payload).eq('id',currentId).select('id') :
        client.from('catalog_items').insert(payload).select('id');
      const {data,error}=await action;
      if(error) throw error;
      if(!data?.length) throw new Error('Salvamento não confirmou nenhuma alteração.');
      resetEditor();await load();say('Item salvo! A vitrine pública será atualizada no próximo carregamento.');
    } catch(err) {
      console.error('Falha ao salvar item',err);
      say(err.message?.startsWith('Imagem inválida')?err.message:errorText(err),true);
    } finally {saving=false;saveButton.disabled=false;}
  });
  initial();
})();
