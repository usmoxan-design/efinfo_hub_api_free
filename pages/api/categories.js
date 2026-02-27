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

      // Haqiqiy havola (href) mavjudligini tekshirish
      if (name && href) {
        categories.push({ name, href });
      }
    });

    // Hech qanday kategoriya topilmasa ham 200 OK statusini qaytarish, lekin bo'sh massiv bilan
    if (categories.length === 0) {
      console.warn('No categories found for BASE_URL:', BASE_URL); // Vercel loglarida ko'rinadi
      return res.status(200).json({ message: 'No categories found', categories: [] });
    }

    // Natijani qaytarish
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error); // Xatoning to'liq ma'lumotini logga yozish
    // Vercel loglarida ko'rinadigan aniqroq xato xabarini qaytarish
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch categories.',
      details: error.message, // Xatoning xabarini klientga qaytarish (ishlab chiqarish muhitida ehtiyot bo'lish kerak)
      // stack: process.env.NODE_ENV === 'development' ? error.stack : undefined // Faqat developmentda stackni ko'rsatish
    });
  }
}
