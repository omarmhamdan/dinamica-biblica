// Cria a "preference" do Checkout Pro e devolve a URL de pagamento (init_point).
// O Access Token fica seguro numa variável de ambiente — NUNCA no HTML.

export default async function handler(req, res) {
  const pacote = (req.query.pacote || 'essencial').toLowerCase();

  const itens = {
    essencial: { title: '+300 Dinâmicas Bíblicas',                       price: 9.90 },
    combo:     { title: 'Premium — Dinâmicas Bíblicas + 7 Bônus', price: 14.90 }
  };
  const item = itens[pacote] || itens.essencial;

  // URL base do próprio site (Vercel injeta o host) — usada nos redirects do MP
  const base = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;

  const preference = {
    items: [{
      title: item.title,
      quantity: 1,
      unit_price: item.price,
      currency_id: 'BRL'
    }],
    external_reference: pacote,            // guarda qual pacote foi comprado
    back_urls: {
      success: `${base}/obrigado.html`,
      pending: `${base}/obrigado.html`,
      failure: `${base}/index.html`
    },
    auto_return: 'approved',               // redireciona sozinho quando aprovado
    notification_url: `${base}/api/webhook`
  };

  try {
    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('[MP create-preference] erro', data);
      return res.status(500).json({ error: 'Falha ao criar pagamento', detalhe: data });
    }
    return res.status(200).json({ init_point: data.init_point });
  } catch (e) {
    console.error('[MP create-preference] exceção', e);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
