import axios from 'axios';
import cheerio from 'cheerio';

const BASE_URL = 'https://pesdb.net/efootball/';

export default async function handler(req, res) {
  try {
    const { id } = req.query;
    const { mode } = req.query;

    let url = `${BASE_URL}?id=${id}`;
    if (mode === 'max_level') url += '&mode=max_level';

    const { data } = await axios.get(url, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
    });

    const $ = cheerio.load(data);

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

    res.status(200).json({
      id,
      position,
      height,
      age,
      foot,
      playingStyle,
      playing_style: playingStyle, // Alias for compatibility
      stats,
      info,
      skills,
      player_skills: skills, // Alias for compatibility
      suggestedPoints,
      suggested_points: suggestedPoints, // Alias for compatibility
      description,
    });
  } catch (err) {
    console.error('Error in player detail API:', err);
    res.status(500).json({ error: err.message });
  }
}