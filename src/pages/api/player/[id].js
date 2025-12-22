/* ==========================================================
   BACKEND: pages/api/player/[id].js
   ========================================================== */
   import axios from 'axios';
   import * as cheerio from 'cheerio'; // ✅ MUHIM: import * as
   
   const BASE_URL = 'https://pesdb.net/efootball/';
   
   export default async function handler(req, res) {
     // CORS ta'minlash
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
     
     if (req.method === 'OPTIONS') return res.status(200).end();
     if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
   
     try {
       const { id, mode } = req.query;
       let url = `${BASE_URL}?id=${id}`;
       if (mode === 'max_level') url += '&mode=max_level';
   
       const { data: html } = await axios.get(url, {
         headers: { 
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
           'Referer': 'https://pesdb.net/'
         },
         timeout: 10000,
       });
   
       const $ = cheerio.load(html);
   
       // Initial state
       const stats = {};
       const info = {};
       const skills = [];
       const aiStyles = [];
       const suggestedPoints = {};
       
       let position = 'Unknown',
           height = 'Unknown',
           age = 'Unknown',
           foot = 'Unknown',
           playingStyle = 'Unknown',
           description = '',
           teamName = 'Free Agent',
           league = 'None',
           nationality = 'Unknown',
           region = 'Unknown';
   
       // 1. ASOSIY MA'LUMOTLAR VA STATLAR (table.player ichidan)
       // Bu yerda stats, team name, league va h.k. olinadi
       $('.player > tbody > tr:first-child td table tr').each((_, row) => {
         const th = $(row).find('th').text().trim().replace(':', '');
         const td = $(row).find('td');
         if (!th || td.length === 0) return;
   
         // Stats uchun toza qiymatni olish (span ichidagi sondan foydalanamiz)
         let value = td.text().trim();
         if (td.find('span').length > 0) {
           value = td.find('span').first().text().trim();
         }
   
         const key = th.toLowerCase();
         
         // Categorization logic
         if (key === 'position') position = value;
         else if (key === 'height') height = value;
         else if (key === 'age') age = value;
         else if (key === 'foot') foot = value;
         else if (key === 'team name') teamName = value;
         else if (key === 'league') league = value;
         else if (key === 'nationality') nationality = value;
         else if (key === 'region') region = value;
         else if (/\d/.test(value)) {
           stats[th] = value;
         } else {
           info[th] = value;
         }
       });
   
       // 2. SKILLLAR VA PLAYING STYLE (table.playing_styles ichidan)
       // Header va uning ostidagi itemlarni to'g'ri parse qilish
       let currentSection = '';
       $('.playing_styles tr').each((_, row) => {
         const th = $(row).find('th').text().trim();
         const td = $(row).find('td').text().trim();
   
         if (th) {
           currentSection = th.toLowerCase();
         } else if (td) {
           if (currentSection.includes('playing style') && !currentSection.includes('ai')) {
             playingStyle = td;
           } else if (currentSection.includes('player skills')) {
             skills.push(td);
           } else if (currentSection.includes('ai playing styles')) {
             aiStyles.push(td);
           }
         }
       });
   
       // 3. SUGGESTED POINTS (Progression)
       $('.player > tbody > tr:nth-child(2) td:first-child div').each((_, div) => {
         const text = $(div).text();
         if (text.includes('Suggested points')) {
           $(div).find('div').each((_, d) => {
             const line = $(d).text().trim();
             if (line.includes(':')) {
               const parts = line.split(':');
               const pKey = parts[0].replace(/[•\u2022]/g, '').trim();
               const pValStr = $(d).find('span').text().trim();
               const pVal = parseInt(pValStr);
               if (pKey && !isNaN(pVal)) suggestedPoints[pKey] = pVal;
             }
           });
         }
       });
   
       // 4. DESCRIPTION
       const bottomDesc = $('.bottom-description h2').first();
       if (bottomDesc.length) description = bottomDesc.text().trim();
   
       // Final response
       res.status(200).json({
         id,
         name: info['Player Name'] || '',
         position,
         height,
         age,
         foot,
         team_name: teamName,
         league,
         nationality,
         region,
         playing_style: playingStyle,
         stats,
         info,
         skills,
         player_skills: skills,
         ai_playing_styles: aiStyles,
         suggested_points: suggestedPoints,
         description
       });
   
     } catch (err) {
       console.error('API Error:', err.message);
       res.status(500).json({ error: 'Failed to fetch player data', details: err.message });
     }
   }