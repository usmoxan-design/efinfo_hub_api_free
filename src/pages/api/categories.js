// pages/api/categories.js

import axios from 'axios';
import * as cheerio from 'cheerio';

// CORS va boshqa xavfsizlik headerlarini sozlash uchun yordamchi funksiya
const setHeaders = (res) => {
  // Barcha domenlarga murojaat qilishga ruxsat beradi (Flutter uchun muhim)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  // API javobi JSON ekanligini belgilaymiz
  res.setHeader('Content-Type', 'application/json');
};

// Next.js API Route handleri
export default async function handler(req, res) {
  setHeaders(res);

  // OPTIONS so'rovini qabul qilish (preflight request), CORS uchun
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Faqat GET so'rovlariga ruxsat berish
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const url = 'https://pesdb.net/efootball/'; // Ma'lumot olinadigan manba

  try {
    // 1. Asl brauzerga o'xshash headerlar bilan HTTP so'rov yuborish
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 15000, // 15 soniya timeout
    });

    // 2. Cheerio yordamida HTML'ni tahlil qilish
    const $ = cheerio.load(html);
    const categories = [];

    // 'shortcuts' div ichidagi barcha 'a' teglarni topish
    $('div.shortcuts a').each((i, el) => {
      const name = $(el).text().trim();
      const href = $(el).attr('href');
      
      if (name && href) {
        categories.push({
          name: name,
          // URL'ni to'liq manzilga aylantirish (agar nisbiy bo'lsa)
          url: href.startsWith('http') ? href : new URL(href, url).toString(),
        });
      }
    });

    // 3. Natijani JSON formatida qaytarish
    res.status(200).json(categories);

  } catch (error) {
    console.error('Scraping error in categories:', error);
    // Xato bo'lganda 500 status kodi va xato xabarini qaytarish
    res.status(500).json({ error: 'Failed to fetch categories', details: error.message });
  }
}