// src/pages/api/featured-options.js
const apicache = require('apicache');
const { BASE_URL, fetchHtml } = require('./_utils');

let cache = apicache.middleware('5 minutes');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed', message: `Only GET requests are allowed for /api/featured-options. Received: ${req.method}` });
  }

  const cached = cache(req, res);
  if (cached) {
    return;
  }

  try {
    const $ = await fetchHtml(BASE_URL);
    const options = [];

    // 'select[name="featured"]' ichidagi 'option' teglarni topish.
    $('select[name="featured"] option').each((i, el) => {
      const name = $(el).text().trim();
      const value = $(el).attr('value');
      // "0" qiymati odatda "barchasi" yoki "tanlanmagan" degan ma'noni anglatadi, uni o'tkazib yuboramiz.
      if (name && value && value !== "0") {
        options.push({ name: name, id: value });
      }
    });
    res.status(200).json(options);
  } catch (err) {
    console.error("ERROR fetching featured options:", err);
    res.status(500).json({ error: "Failed to fetch featured options", details: err.message });
  }
}
