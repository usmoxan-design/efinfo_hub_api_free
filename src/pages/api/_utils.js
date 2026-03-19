// src/pages/api/_utils.js
const axios = require('axios');
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

// Sozlamalar
const BASE_URL = 'https://www.pesmaster.com/efootball-2024/';
// USER_AGENT'ni tez-tez o'zgartirish scrapingni barqaror qilishga yordam berishi mumkin.
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

/**
 * Berilgan URL'dan HTML sahifasini olib, Cheerio obyektini qaytaradi.
 * Cookie va User-Agent sozlamalari bilan redirect xatolarini oldini oladi.
 * Ma'lumotlarni siqish (gzip) orqali tarmoq samaradorligini oshiradi.
 * @param {string} url - HTML olinadigan URL.
 * @param {object} [params={}] - Axios so'rovi uchun qo'shimcha parametrlar.
 * @returns {Promise<cheerio.Root>} Cheerio root obyektini qaytaradi.
 * @throws {Error} HTML olishda yoki parsingda xato yuz bersa.
 */
async function fetchHtml(url, params = {}) {
  try {
    const response = await client.get(url, {
      params,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Referer': BASE_URL,
        'Connection': 'keep-alive',
        'Accept-Encoding': 'gzip, deflate, br' // Ma'lumotlarni siqish orqali tezlikni oshirish
      },
      maxRedirects: 5, // Redirect xatosini oldini olish
      timeout: 15000   // 15 sekund timeout. Tarmoq muammolarida kutishni kamaytirish.
    });
    return cheerio.load(response.data);
  } catch (error) {
    console.error(`ERROR fetching ${url}:`, error.message);
    // Axios xatosi bo'lsa, status kodni va javob datani ham qaytarish
    if (error.response) {
      throw new Error(`Failed to fetch ${url} with status ${error.response.status}. Response data: ${error.response.data}`);
    }
    throw error; // Boshqa turdagi xatolar
  }
}

module.exports = {
  BASE_URL,
  fetchHtml,
};
