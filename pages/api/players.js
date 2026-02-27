// src/pages/api/players.js
const apicache = require('apicache');
const { BASE_URL, fetchHtml } = require('./_utils');

let cache = apicache.middleware('5 minutes');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed', message: `Only GET requests are allowed for /api/players. Received: ${req.method}` });
  }

  const cached = cache(req, res);
  if (cached) {
    return;
  }

  try {
    const { page = 1, url, ...filters } = req.query;
    let targetUrl = url || BASE_URL; // Agar maxsus URL berilmagan bo'lsa, asosiy URL'ni ishlatamiz.
    
    // Filterlarni URL parametrlariga aylantiramiz
    const queryParams = { ...filters };
    if (page > 1) queryParams.page = page;

    // fetchHtml funksiyasiga yuboriladigan URL va parametrlar
    const $ = await fetchHtml(targetUrl, Object.keys(queryParams).length > 0 ? queryParams : {});
    const players = [];

    // O'yinchilar jadvalidagi har bir qatorni (headerdan tashqari) ajratib olish
    $('table.players tr').each((i, el) => {
      if (i === 0) return; // Header qatorini o'tkazib yuborish
      const tds = $(el).find('td');
      if (tds.length === 0) return; // Bo'sh qatorlarni o'tkazib yuborish

      const link = tds.eq(1).find('a');
      const href = link.attr('href') || '';

      // O'yinchi ID'sini href atributidan ajratib olish
      const idMatch = href.match(/id=(\d+)/);
      const id = idMatch ? idMatch[1] : null;

      if (id) {
        players.push({
          id: id,
          name: link.text().trim(),
          position: tds.eq(0).text().trim(),
          team: tds.eq(2).text().trim(), 
          rating: $(el).find('td').last().text().trim(), // Odatda reyting oxirgi ustunda joylashgan
          club: $(el).find('a[href*="club_team"]').text().trim() || "Free Agent", // Klub nomi
          nationality: $(el).find('a[href*="nationality"]').text().trim() || "Unknown", // Millat
          playing_style: tds.eq(3).text().trim() // O'yin uslubi
        });
      }
    });
    res.status(200).json(players);
  } catch (err) {
    console.error("ERROR fetching players list:", err);
    res.status(500).json({ error: "Failed to fetch players list", details: err.message });
  }
}
