const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;
const LEADS_FILE = path.join(__dirname, 'leads.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')))

// ---- Lead storage helpers ----
function loadLeads() {
  if (!fs.existsSync(LEADS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(LEADS_FILE, 'utf8')); } catch { return []; }
}
function saveLeads(leads) {
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}

// ---- POST /api/leads  (email capture) ----
app.post('/api/leads', (req, res) => {
  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Invalid email address.' });
  }
  const leads = loadLeads();
  if (leads.some(l => l.email === email)) {
    return res.json({ ok: true, message: 'Already subscribed.' });
  }
  leads.push({ email, source: 'acrepilot', createdAt: new Date().toISOString() });
  saveLeads(leads);
  res.json({ ok: true, message: 'Lead captured.' });
});

// ---- POST /api/score  (server-side scoring) ----
app.post('/api/score', (req, res) => {
  const {
    address, price = 0, lotSize, zoning, buyer,
    road, power, water, sewer, flood, mls, wildlife,
  } = req.body || {};

  let score = 100;
  const flags = [];
  const wins  = [];

  if (!address?.trim())           { score -= 10; flags.push('Missing property address.'); } else wins.push('Address provided.');
  if (zoning !== 'residential')   { score -= 25; flags.push('Zoning not confirmed residential.'); } else wins.push('Residential zoning confirmed.');
  if (!road)                      { score -= 25; flags.push('Road access not confirmed.'); } else wins.push('Road access available.');
  if (!power)                     { score -= 15; flags.push('Power not confirmed.'); } else wins.push('Power confirmed.');
  if (!water)                     { score -= 8;  flags.push('Water not confirmed.'); } else wins.push('Water confirmed.');
  if (!sewer)                     { score -= 8;  flags.push('Sewer not confirmed.'); } else wins.push('Sewer confirmed.');
  if (flood === 'ae')             { score -= 18; flags.push('Zone AE — high flood risk.'); }
  else if (flood === 'verify')    { score -= 8;  flags.push('Flood zone unverified.'); }
  else wins.push('Zone X — low flood risk.');
  if (mls === 'listed')           { score -= 15; flags.push('MLS-listed property.'); }
  else if (mls === 'offmarket')   wins.push('Off-market deal.');
  if (wildlife === 'owl')         { score -= 10; flags.push('Owl activity flag.'); }
  else if (wildlife === 'tortoise') { score -= 18; flags.push('Tortoise issue — significant risk.'); }
  else if (wildlife === 'none')   wins.push('No wildlife flags.');
  if (Number(price) > 40000 && buyer === 'Quick-Flip Lot Buyers') {
    score -= 18; flags.push('Price too high for quick-flip buyer.');
  }

  score = Math.max(0, Math.min(100, score));
  const verdict = score >= 78 ? 'Buyer-Ready' : score >= 58 ? 'Needs Review' : 'High Risk';

  res.json({ ok: true, score, verdict, flags, wins });
});

// ---- GET /api/leads  (admin view) ----
app.get('/api/leads', (req, res) => {
  const leads = loadLeads();
  res.json({ ok: true, count: leads.length, leads });
});

// ---- GET /api/health ----
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, uptime: Math.round(process.uptime()) });
});

app.listen(PORT, () => console.log(`AcrePilot API → http://localhost:${PORT}`));
