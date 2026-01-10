// src/pages/api/categories.js
const apicache = require('apicache');
const { BASE_URL, fetchHtml } = require('./_utils');

// 5 daqiqalik kesh (serverga yuk tushmasligi uchun). Next.js API Routes'da apicache'ni
// middleware sifatida to'g'ridan-to'g'ri ishlatish mumkin emas, shuning uchun uni qo'lda tekshiramiz.
let cache = apicache.middleware('5 minutes');

export default async function handler(req, res) {
  // Faqat GET so'rovlariga ruxsat berish
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed', message: `Only GET requests are allowed for /api/categories. Received: ${req.method}` });
  }

  // apicache'ni qo'lda ishga tushirish. Agar keshdan qaytarilgan bo'lsa, true qaytaradi.
  const cached = cache(req, res);
  if (cached) {
    // Agar keshdan javob qaytarilgan bo'lsa, funksiyani tugatamiz.
    return;
  }

  try {
    const $ = await fetchHtml(BASE_URL);
    const categories = [];

    // 'div.shortcuts' ichidagi 'a' teglarni topish va ularni ma'lumot qilib olish.
    // Selektorning aniqligini oshirish.
    $('div.shortcuts a').each((i, el) => {
      const name = $(el).text().trim();
      const href = $(el).attr('href');
      
      if (name && href) {
        categories.push({
          name: name,
          // URL'ni to'liq manzilga aylantirish (agar nisbiy bo'lsa), URL konstruktoridan foydalanish yanada mustahkam.
          url: href.startsWith('http') ? href : new URL(href, BASE_URL).toString()
        });
      }
    });
    res.status(200).json(categories);
  } catch (err) {
    console.error("ERROR fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories", details: err.message });
  }
}
