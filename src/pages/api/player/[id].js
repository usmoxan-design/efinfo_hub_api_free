// pages/api/player/[id].js

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

  // 1. Dinamik route'dan 'id'ni olish
  const { id } = req.query; 
  // 2. Query'dan 'mode'ni olish (max_level yoki level1)
  const { mode = 'level1' } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Player ID is required' });
  }

  // 'mode' parametriga qarab URL'ni sozlash
  let url = `https://pesdb.net/efootball/?id=${id}`;
  if (mode === 'max_level') {
    url += '&mode=max_level';
  }

  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(html);
    const details = {
      id: id,
      position: 'Unknown',
      height: 'Unknown',
      age: 'Unknown',
      foot: 'Unknown',
      playingStyle: 'Unknown',
      stats: {},
      skills: [],
      info: {},
      suggestedPoints: {},
      description: '',
    };

    // 1. Barcha jadval qatorlaridan umumiy ma'lumot va stat'larni olish
    $('tr').each((i, row) => {
        const th = $(row).find('th').first();
        const td = $(row).find('td').first();

        if (th.length === 0 || td.length === 0) return;

        const originalHeader = th.text().trim().replace(/:$/, '').trim();
        const header = originalHeader.toLowerCase();
        let value = td.text().trim();

        if (header === 'position') details.position = value;
        else if (header === 'height') details.height = value;
        else if (header === 'age') details.age = value;
        else if (header === 'foot') details.foot = value;
        else if (header === 'playing styles') details.playingStyle = value;
        else if (header === 'player skills') {
            details.skills = value
                .split('\n')
                .map(s => s.trim())
                .filter(s => s.length > 0);
        } else {
            // Stat'lar raqamdan iborat bo'lsa 'stats'ga, aks holda 'info'ga qo'shamiz
            if (/\d/.test(value)) {
                details.stats[originalHeader] = value;
            } else {
                details.info[originalHeader] = value;
            }
        }
    });

    // 2. Tavsiya etilgan ballarni (suggested points) olish (murakkabroq scraping)
    $('div').each((i, el) => {
        const text = $(el).text().trim();
        if (text.includes('Suggested points for Level')) {
            // Parent elementni topish va bolalari bo'ylab yurish
            $(el).parent().children().each((j, child) => {
                if (child.tagName === 'div' && $(child).text().includes(':')) {
                    const key = $(child).text().split(':')[0].replace(/•/g, '').trim();
                    const valText = $(child).find('span').text().trim();
                    const val = parseInt(valText, 10);
                    if (!isNaN(val)) {
                        details.suggestedPoints[key] = val;
                    }
                }
            });
            // Kerakli joyni topgandan so'ng tsiklni to'xtatish
            return false; 
        }
    });

    // 3. Pastki tavsifni olish
    const descriptionEl = $('.bottom-description h2').first();
    if (descriptionEl.length) {
        details.description = descriptionEl.text().trim();
    }
    
    // Natijani qaytarish
    res.status(200).json(details);

  } catch (error) {
    console.error(`Scraping error for player ${id}:`, error);
    res.status(500).json({ error: `Failed to fetch player details for ID ${id}`, details: error.message });
  }
}