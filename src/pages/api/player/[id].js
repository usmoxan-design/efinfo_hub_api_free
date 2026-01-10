// src/pages/api/player/[id].js
const apicache = require('apicache');
const { BASE_URL, fetchHtml } = require('../_utils'); // Yo'l o'zgartirildi


let cache = apicache.middleware('5 minutes');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed', message: `Only GET requests are allowed for /api/player/:id. Received: ${req.method}` });
  }

  const cached = cache(req, res);
  if (cached) {
    return;
  }

  try {
    const { id } = req.query; // Next.js da dinamik route parametrlari req.query orqali keladi
    const { mode } = req.query; // 'max_level' or empty
    
    if (!id) {
      return res.status(400).json({ error: "Player ID is required." });
    }

    const url = `${BASE_URL}?id=${id}${mode === 'max_level' ? '&mode=max_level' : ''}`;
    const $ = await fetchHtml(url);

    const result = {
      id,
      name: '',
      info: {},
      stats: {},
      skills: [],
      playing_styles: [],
      suggested_points: {}
    };

    // O'yinchi nomi (H1 tegidan olinadi)
    result.name = $('h1').first().text().trim();
    if (result.name.includes(' - ')) {
        result.name = result.name.split(' - ')[0].trim();
    }

    // Asosiy ma'lumotlar va stats (table.player ichidan)
    $('table.player tr').each((i, el) => {
      const th = $(el).find('th').text().trim().replace(/:/g, '').toLowerCase();
      let value = $(el).find('td').text().trim();

      if (!th || !value) return; // Bo'sh qatorlarni o'tkazib yuborish

      // Ma'lumotlarni turiga qarab ajratish
      if (th === 'player name') {
        // Nomi yuqorida olindi, bu qatorni o'tkazamiz
      } else if (th === 'position') {
        result.info.position = value;
      } else if (th === 'playing styles') {
        // Playing styles'ni HTML ichidan ajratib olish (br teglariga qarab)
        result.playing_styles = $(el).find('td').html().split('<br>').map(s => $(s).text().trim()).filter(s => s);
      } else if (th === 'player skills') {
        // Skills'ni HTML ichidan ajratib olish
        result.skills = $(el).find('td').html().split('<br>').map(s => $(s).text().trim()).filter(s => s);
      } else if (value.match(/^\d+$/) && th !== 'id') { // Raqamli qiymatlar stats bo'lishi mumkin
        result.stats[th.replace(/\s+/g, '_')] = parseInt(value, 10);
      } else {
        result.info[th.replace(/\s+/g, '_')] = value;
      }
    });

    // Suggested Points (Tahminiy rivojlantirish)
    // Bu qism sayt strukturasi o'zgarishiga juda sezgir!
    // "Suggested points allocation" yozuvi bilan boshlanadigan sectionni topamiz.
    const suggestedPointsSection = $('b:contains("Suggested points allocation")').closest('div');
    if (suggestedPointsSection.length > 0) {
        suggestedPointsSection.find('table tr').each((i, el) => {
            const cells = $(el).find('td');
            if (cells.length === 2) {
                const category = cells.eq(0).text().trim().replace(':', '');
                const points = parseInt(cells.eq(1).text().trim(), 10);
                if (category && !isNaN(points)) {
                    result.suggested_points[category.replace(/\s+/g, '_').toLowerCase()] = points;
                }
            }
        });
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(`ERROR fetching player details for ID ${req.query.id}:`, err);
    res.status(500).json({ error: "Failed to fetch player details", details: err.message });
  }
}
