// src/pages/index.js (Misol uchun)
import { useState, useEffect } from 'react';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorPlayers, setErrorPlayers] = useState(null);

  // Kategoriyalarni yuklash
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Agar API "message: 'No categories found'" bilan bo'sh massiv qaytarsa
        if (data.categories) {
            setCategories(data.categories);
        } else {
            setCategories(data); // To'g'ridan-to'g'ri massiv qaytarsa
        }

      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setErrorCategories(error.message);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  // O'yinchilarni yuklash
  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/players');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Agar API "message: 'No players found'" bilan bo'sh massiv qaytarsa
        if (data.players) {
            setPlayers(data.players);
        } else {
            setPlayers(data); // To'g'ridan-to'g'ri massiv qaytarsa
        }
      } catch (error) {
        console.error("Failed to fetch players:", error);
        setErrorPlayers(error.message);
      } finally {
        setLoadingPlayers(false);
      }
    }
    fetchPlayers();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Ma'lumotlar ro'yxati</h1>

      <section>
        <h2>Kategoriyalar</h2>
        {loadingCategories && <p>Kategoriyalar yuklanmoqda...</p>}
        {errorCategories && <p style={{ color: 'red' }}>Kategoriyalarni yuklashda xato yuz berdi: {errorCategories}</p>}
        {!loadingCategories && categories.length === 0 && <p>Kategoriyalar topilmadi.</p>}
        {!loadingCategories && categories.length > 0 && (
          <ul>
            {categories.map((category, index) => (
              <li key={index}>
                <a href={category.href} target="_blank" rel="noopener noreferrer">
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>O'yinchilar ro'yxati</h2>
        {loadingPlayers && <p>O'yinchilar yuklanmoqda...</p>}
        {errorPlayers && <p style={{ color: 'red' }}>O'yinchilarni yuklashda xato yuz berdi: {errorPlayers}</p>}
        {!loadingPlayers && players.length === 0 && <p>O'yinchilar topilmadi.</p>}
        {!loadingPlayers && players.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={tableHeaderStyle}>Ism</th>
                <th style={tableHeaderStyle}>Jamoa</th>
                <th style={tableHeaderStyle}>Reyting</th>
                <th style={tableHeaderStyle}>Klub</th>
                <th style={tableHeaderStyle}>Millat</th>
                <th style={tableHeaderStyle}>O'yin uslubi</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={index} style={index % 2 === 0 ? {} : { backgroundColor: '#f9f9f9' }}>
                  <td style={tableCellStyle}>{player.name}</td>
                  <td style={tableCellStyle}>{player.team}</td>
                  <td style={tableCellStyle}>{player.rating}</td>
                  <td style={tableCellStyle}>{player.club}</td>
                  <td style={tableCellStyle}>{player.nationality}</td>
                  <td style={tableCellStyle}>{player.playing_style}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const tableHeaderStyle = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
};

const tableCellStyle = {
    border: '1px solid #ddd',
    padding: '8px',
};
