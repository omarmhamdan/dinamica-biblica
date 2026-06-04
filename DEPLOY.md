# Guia de Publicação — Dinâmicas Bíblicas (sem terminal, só cliques)

Objetivo: colocar o site no ar de graça (`algo.vercel.app`), com checkout do Mercado Pago
(Pix + Cartão), entrega automática por e-mail, Pixel + API de Conversões da Meta e Clarity.

Você vai usar 2 sites gratuitos: **GitHub** (guarda os arquivos) e **Vercel** (publica).
Tempo: ~20 minutos.

---

## PARTE 1 — Google Drive (2 min)

Para cada pasta (Essencial e Combo):
1. Botão direito na pasta → **Compartilhar**
2. Em "Acesso geral", troque para **"Qualquer pessoa com o link"**
3. Permissão: **Leitor (Visualizador)**

Os links já estão no `.env.example`:
- Essencial: `1eXe-aUJbitkEg7iCcyBwPReE1HvKkmiw`
- Combo: `1858h9bFBQc4ij9OFBmTUIfvyOrXPpIpV`

---

## PARTE 2 — Subir no GitHub (8 min)

1. Crie conta em https://github.com
2. **+** → **New repository** → nome `dinamica-biblica` → **Public** → **Create repository**
3. **Add file → Upload files**
4. Arraste TODOS os arquivos de `/Users/omar/Desktop/dinamica_biblica` + a pasta `api`.
   - Confira: `index.html`, `checkout.html`, `obrigado.html`, `package.json`, pasta `api` (5 arquivos).
   - O `.env` NÃO sobe (está no .gitignore) — os segredos vão direto na Vercel.
5. **Commit changes**

---

## PARTE 3 — Publicar na Vercel (8 min)

1. https://vercel.com → **Sign Up** → **Continue with GitHub**
2. **Add New… → Project** → importe `dinamica-biblica` → **Import**
3. ANTES de publicar, abra **Environment Variables** e adicione:

   | Name | Value |
   |---|---|
   | `MP_ACCESS_TOKEN` | Access Token do Mercado Pago (`APP_USR-...`) — o MESMO do figurinhas |
   | `DRIVE_URL_ESSENCIAL` | link da pasta Drive do pacote R$ 14,90 |
   | `DRIVE_URL_COMBO` | link da pasta Drive do pacote R$ 19,90 |
   | `BREVO_API_KEY` | sua chave Brevo (a mesma do figurinhas) |
   | `SENDER_EMAIL` | e-mail remetente verificado no Brevo |
   | `META_CAPI_TOKEN` | token da API de Conversões da Meta |
   | `SITE_URL` | (preencha depois do 1º deploy) ex: `https://dinamica-biblica.vercel.app` |

4. **Deploy** → no fim, **Visit** → anote o endereço `.vercel.app`.
5. Volte em Environment Variables, preencha `SITE_URL` com o endereço e faça **Redeploy**.

---

## PARTE 4 — Webhook do Mercado Pago (3 min)

1. https://www.mercadopago.com.br/developers → Suas integrações → sua aplicação
2. **Webhooks** → URL: `https://SEU-ENDERECO.vercel.app/api/webhook`
3. Marque o evento **Pagamentos** e salve.

---

## PARTE 5 — Microsoft Clarity (2 min)

1. https://clarity.microsoft.com → New project → cole o domínio `.vercel.app`
2. Copie o **ID da tag** (string tipo `abc123xyz`).
3. No GitHub, em `index.html`, `checkout.html` e `obrigado.html`, troque `SEU_CLARITY_ID`
   pelo ID. Commit → a Vercel republica sozinha.

---

## PARTE 6 — Vídeo Vimeo (1 min)

No GitHub, abra `index.html` e troque `SEU_VIMEO_ID` pelo número do vídeo vertical.
Ex: `https://player.vimeo.com/video/1234567890`.

---

## Pixel + CAPI (já configurado)

- Pixel ID `993385946435032` já está nos 3 HTML (browser) e no `api/webhook.js` (CAPI server-side).
- Dedup: o navegador e o servidor enviam o MESMO `event_id` (`purchase_<id>`), então a Meta
  não conta a venda duas vezes.
- Para validar: setar `META_CAPI_TEST_CODE` na Vercel, fazer uma compra teste, conferir na aba
  "Eventos de teste" do Gerenciador, depois remover a variável.

---

## Testar

1. Abra o site → clique em **Garantir por R$ 14,90** → checkout abre.
2. Pague via Pix (valor baixo real) ou cartão de teste do MP.
3. Após aprovar, vai pro `obrigado.html` com o botão do material + e-mail enviado.

---

## Segurança

- Tokens só ficam na Vercel (Parte 3), nunca nos arquivos.
- O `META_CAPI_TOKEN` foi compartilhado em texto puro no chat → recomendável gerar um token NOVO
  no Gerenciador da Meta e usar o novo.
