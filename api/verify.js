// Confirma o pagamento DE VERDADE consultando o Mercado Pago.
// Só devolve o link do Drive se o pagamento estiver "approved".
// Assim o link do produto fica no servidor (env), nunca exposto no HTML.

export default async function handler(req, res) {
  const id = req.query.payment_id || req.query.collection_id;
  if (!id) return res.status(400).json({ approved: false, error: 'sem payment_id' });

  try {
    const r = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { 'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    const p = await r.json();

    if (p.status !== 'approved') {
      return res.status(403).json({ approved: false, status: p.status });
    }

    const links = {
      essencial: process.env.DRIVE_URL_ESSENCIAL,
      combo:     process.env.DRIVE_URL_COMBO
    };
    const url = links[p.external_reference] || links.essencial;

    return res.status(200).json({ approved: true, url });
  } catch (e) {
    console.error('[MP verify] exceção', e);
    return res.status(500).json({ approved: false, error: 'Erro interno' });
  }
}
