// Cria um pagamento Pix direto pela API do Mercado Pago (Checkout Transparente).
// Devolve o QR Code + copia-e-cola para mostrar na NOSSA página.
// Assim controlamos o redirect: quando aprova, a gente leva pro obrigado.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'use POST' });

  // Vercel já entrega req.body como objeto; fallback caso venha string
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { pacote = 'essencial', email, nome, cpf, telefone, fbp, fbc } = body || {};

  if (!email) return res.status(400).json({ error: 'email obrigatório' });

  // Dados do navegador do comprador (este endpoint é chamado pelo browser) p/ CAPI
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const ua = String(req.headers['user-agent'] || '');

  const itens = {
    essencial: { title: '+300 Dinâmicas Bíblicas',                       price: 14.90 },
    combo:     { title: 'Pacote Completo — Dinâmicas Bíblicas + 7 Bônus', price: 19.90 }
  };
  const item = itens[pacote] || itens.essencial;
  const base = `https://${req.headers['x-forwarded-host'] || req.headers.host}`;

  const pagamento = {
    transaction_amount: item.price,
    description: item.title,
    payment_method_id: 'pix',
    external_reference: pacote,
    notification_url: `${base}/api/webhook`,
    metadata: { nome: nome || '', telefone: String(telefone || '').replace(/\D/g, ''), email: String(email || '').trim().toLowerCase(), cpf: String(cpf || '').replace(/\D/g, ''), fbp: fbp || '', fbc: fbc || '', ip: ip, ua: ua },
    payer: {
      email: email,
      first_name: nome || undefined,
      identification: cpf ? { type: 'CPF', number: String(cpf).replace(/\D/g, '') } : undefined
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
      console.error('[CRIAR-PIX] erro', data);
      return res.status(500).json({ error: 'Falha ao gerar Pix', detalhe: data });
    }
    const tx = (data.point_of_interaction && data.point_of_interaction.transaction_data) || {};
    return res.status(200).json({
      id: data.id,
      status: data.status,
      qr_code: tx.qr_code,                 // copia-e-cola
      qr_code_base64: tx.qr_code_base64,   // imagem do QR
      ticket_url: tx.ticket_url
    });
  } catch (e) {
    console.error('[CRIAR-PIX] exceção', e);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
