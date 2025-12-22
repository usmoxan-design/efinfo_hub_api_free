// ✅ TO'G'RI import
import axios from 'axios';
import * as cheerio from 'cheerio';  // ← Bu muhim!

const BASE_URL = 'https://pesdb.net/efootball/';

export default async function handler(req, res) {
  // Headers qo'shish
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { id } = req.query;
    const { mode } = req.query;

    let url = `${BASE_URL}?id=${id}`;
    if (mode === 'max_level') url += '&mode=max_level';

    console.log('Fetching URL:', url);

    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 15000,
    });

    const $ = cheerio.load(data);  // ← Bu yerda 'load' metodi ishlatiladi

    let position = 'Unknown',
      height = 'Unknown',
      age = 'Unknown',
      foot = 'Unknown',
      playingStyle = 'Unknown',
      description = '';

    const stats = {};
    const info = {};
    const skills = [];
    const suggestedPoints = {};

    $('tr').each((_, row) => {
      const th = $(row).find('th').text().trim().replace(':', '');
      const td = $(row).find('td');
      const tdText = td.text().trim();
      if (!th || !tdText) return;

      const key = th.toLowerCase();
      
      if (key === 'position') position = tdText;
      else if (key === 'height') height = tdText;
      else if (key === 'age') age = tdText;
      else if (key === 'foot') foot = tdText;
      else if (key === 'playing styles') playingStyle = tdText;
      else if (key === 'player skills') {
        // ✅ FIXED: Properly handle <br> tags
        const tdHtml = td.html() || '';
        const skillsText = tdHtml.replace(/<br\s*\/?>/gi, '\n');
        const $temp = cheerio.load(skillsText);
        const cleanText = $temp.text().trim();
        
        cleanText.split('\n').forEach(s => {
          const trimmed = s.trim();
          if (trimmed && !trimmed.includes('<')) {
            skills.push(trimmed);
          }
        });
      }
      else if (/\d/.test(tdText)) stats[th] = tdText;
      else info[th] = tdText;
    });

    // Suggested points parsing
    $('div').each((_, div) => {
      const text = $(div).text();
      if (text.includes('Suggested points') && text.length < 150) {
        $(div).parent().find('div').each((_, d) => {
          const childText = $(d).text();
          if (childText.includes(':')) {
            const parts = childText.split(':');
            if (parts.length >= 2) {
              const key = parts[0].replace(/[•\u2022]/g, '').trim();
              const val = parseInt($(d).find('span').text());
              if (key && !isNaN(val)) suggestedPoints[key] = val;
            }
          }
        });
      }
    });

    const bottom = $('.bottom-description h2').first();
    if (bottom.length) description = bottom.text().trim();

    console.log('Parsed skills:', skills);

    res.status(200).json({
      id,
      position,
      height,
      age,
      foot,
      playingStyle,
      playing_style: playingStyle,
      stats,
      info,
      skills,
      player_skills: skills,
      suggestedPoints,
      suggested_points: suggestedPoints,
      description,
    });
  } catch (err) {
    console.error('Error in player detail API:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
}