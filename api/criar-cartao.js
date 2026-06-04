// Cria um pagamento com CARTÃO de crédito à vista (Checkout Transparente).
// O cartão é tokenizado no navegador pelo SDK do Mercado Pago (PCI-safe);
// aqui só recebemos o token e finalizamos o pagamento.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'use POST' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const {
    token, payment_method_id, issuer_id,
    email, identificationType = 'CPF', identificationNumber,
    pacote = 'essencial', nome, telefone
  } = body || {};

  if (!token || !email || !payment_method_id) {
    return res.status(400).json({ error: 'dados do cartão incompletos' });
  }

  const itens = {
    essencial: { title: '+300 Dinâmicas Bíblicas',                       price: 14.90 },
    combo:     { title: 'Pacote Completo — Dinâmicas Bíblicas + 7 Bônus', price: 19.90 }
  };
  const item = itens[pacote] || itens.essencial;
  const base = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;

  const pagamento = {
    transaction_amount: item.price,
    token: token,
    installments: 1,                 // sempre à vista
    payment_method_id: payment_method_id,
    issuer_id: issuer_id,
    description: item.title,
    external_reference: pacote,
    notification_url: `${base}/api/webhook`,
    metadata: { nome: nome || '', telefone: String(telefone || '').replace(/\D/g, ''), email: String(email || '').trim().toLowerCase() },
    payer: {
      email: email,
      identification: { type: identificationType, number: String(identificationNumber || '').replace(/\D/g, '') }
    }
  };

  try {
    const r = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `${pacote}-${email}-${Date.now()}`
      },
      body: JSON.stringify(pagamento)
    });
    const data = await r.json();
    if (!r.ok) {
      console.error('[CARTAO] erro', data);
      return res.status(500).json({ error: 'Falha no pagamento', detalhe: data });
    }
    return res.status(200).json({ id: data.id, status: data.status, status_detail: data.status_detail });
  } catch (e) {
    console.error('[CARTAO] exceção', e);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
