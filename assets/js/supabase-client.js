/* Cliente compartilhado para GitHub Pages. A autorização acontece no RLS do banco. */
(() => {
  'use strict';
  const cfg = window.WEPO_SUPABASE_CONFIG || {};
  const valid = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(cfg.url || '')
    && typeof cfg.publishableKey === 'string' && cfg.publishableKey.trim().length > 16;
  let client = null;
  if (valid && window.supabase && typeof window.supabase.createClient === 'function') {
    client = window.supabase.createClient(cfg.url.replace(/\/$/, ''), cfg.publishableKey, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: false }
    });
  }
  window.WepoDB = Object.freeze({
    client,
    configured: valid,
    async catalog(kind) {
      if (!client) throw new Error('Supabase não configurado ou biblioteca não carregada.');
      const { data, error } = await client.from('catalog_items')
        .select('id,kind,title,description,category,price,image_url,sort_order,active')
        .eq('kind', kind).eq('active', true).order('sort_order', { ascending: true }).order('title');
      if (error) throw error;
      return data || [];
    }
  });
})();
