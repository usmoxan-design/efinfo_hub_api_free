// pages/api/players.js

import axios from 'axios';
import * as cheerio from 'cheerio';

const setHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
};

export default async function handler(req, res) {
  setHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  // Query parametrlarni olish: page, url (kategoriya url'i), va boshqa filtrlar
  const { page = 1, url: customUrl, ...filters } = req.query; 

  const baseUrl = 'https://pesdb.net/efootball/';
  let targetUrl = customUrl || baseUrl;

  try {
    const uri = new URL(targetUrl);
    // Mavjud query parametrlarni olish
    const queryParams = new URLSearchParams(uri.search);

    // Yangi/mavjud parametrlarni qo'shish/o'zgartirish
    queryParams.set('page', page);
    // Boshqa filtrlar uchun:
    Object.keys(filters).forEach(key => {
        queryParams.set(key, filters[key]);
    });

    // Final URL'ni yaratish
    targetUrl = uri.origin + uri.pathname + '?' + queryParams.toString();

    const { data: html } = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);
    const players = [];

    // O'yinchilar ma'lumotlari joylashgan jadval qatorlarini qidirish
    $('tr').each((i, row) => {
      let name, id, club, nationality;
      // Har bir qatordagi 'a' teglarni qidirish
      $(row).find('a').each((j, linkEl) => {
        const href = $(linkEl).attr('href') || '';
        const text = $(linkEl).text().trim();

        if (href.includes('id=')) {
          // O'yinchi detali URL'i bo'lsa
          name = text;
          // URL'dan 'id' parametrini ajratib olish
          const idMatch = href.match(/id=(\d+)/); 
          if (idMatch) id = idMatch[1];
        } else if (href.includes('club_team=')) {
          club = text;
        } else if (href.includes('nationality=')) {
          nationality = text;
        }
      });

      if (id && name) {
        players.push({
          id: id,
          name: name,
          club: club || 'Free Agent',
          nationality: nationality || 'Unknown',
        });
      }
    });

    res.status(200).json(players);

  } catch (error) {
    console.error('Scraping error in players:', error);
    res.status(500).json({ error: 'Failed to fetch players', details: error.message });
  }
}