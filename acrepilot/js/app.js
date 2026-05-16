// ===== MOBILE MENU =====
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const iconOpen = document.getElementById('icon-open');
const iconClose = document.getElementById('icon-close');

menuBtn.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  iconOpen.classList.toggle('hidden', open);
  iconClose.classList.toggle('hidden', !open);
});

document.querySelectorAll('.ml-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
  });
});

// ===== KIT ITEMS =====
const kitItems = [
  { icon: '🚩', title: 'FL Red Flag Checklist',      desc: 'Flood, access, zoning, utilities, wildlife — all 12 deal-killers in one sheet.' },
  { icon: '🎯', title: 'Buyer Buy Box Matching',      desc: 'Match each lot to the right buyer profile before you ever pitch it.' },
  { icon: '📞', title: 'Seller Call + Text Scripts',  desc: 'Exactly what to say to motivated land sellers at every stage.' },
  { icon: '✉️', title: 'Deal Submission Templates',   desc: 'Buyer emails that are short, clean, and scannable in 10 seconds.' },
  { icon: '📊', title: 'Mini Comp Framework',         desc: 'Quick method to validate pricing without full MLS access.' },
  { icon: '📄', title: 'Builder-Ready Deal Memo',     desc: 'One-page memo template that builders and developers actually read.' },
  { icon: '🤖', title: 'AI Prompt Pack',              desc: 'Tested prompts for Claude and ChatGPT to generate polished memos fast.' },
  { icon: '💬', title: 'Price Cut + Objection Scripts', desc: 'Handle buyer price pushback and objections with confidence.' },
];

document.getElementById('kitGrid').innerHTML = kitItems.map(item => `
  <div class="glass rounded-3xl p-5 hover-lift flex gap-4 items-start">
    <div class="text-2xl flex-shrink-0">${item.icon}</div>
    <div>
      <p class="font-bold text-sm mb-1">${item.title}</p>
      <p class="text-xs leading-5 text-white/45">${item.desc}</p>
    </div>
  </div>
`).join('');

// ===== FAQ =====
const faqs = [
  { q: 'Who is AcrePilot built for?',
    a: 'Land wholesalers, deal finders, and builder scouts who need a faster, more accurate way to evaluate vacant lots before submitting to buyers or sellers.' },
  { q: 'Do I need real estate experience to use this?',
    a: 'No. The scorecard and checklist walk you through every factor that matters. If you can read an address and look up a county record, you can use this system.' },
  { q: 'Is the scorecard really free with no signup?',
    a: 'Yes — completely free, no login required. Score as many lots as you want. The scorecard is designed to be genuinely useful on its own, with the kits as an optional upgrade.' },
  { q: 'What’s the difference between the Starter Kit and the Operator Vault?',
    a: 'The Starter Kit ($47) gives you the core tools to find, filter, and submit deals. The Operator Vault ($197) adds the full AI prompt pack, deal analyzer spreadsheet, buyer matching worksheet, and a submission pack for working at scale.' },
  { q: 'Does this work outside of Florida?',
    a: 'The core scorecard and buyer matching system works in any state. Some checklist items (wildlife flags, utility patterns) are Florida-specific, but the framework adapts to any market.' },
  { q: 'Is there a refund policy?',
    a: '7-day refund on both the Starter Kit and Operator Vault, no questions asked. If the tools don’t help you evaluate deals better, we don’t want your money.' },
];

document.getElementById('faqList').innerHTML = faqs.map((faq, i) => `
  <div class="faq-item glass rounded-2xl overflow-hidden cursor-pointer" onclick="toggleFaq(${i})">
    <div class="flex items-center justify-between p-5">
      <p class="font-semibold text-sm pr-4">${faq.q}</p>
      <span class="faq-icon text-white/40 text-xl flex-shrink-0 leading-none select-none">+</span>
    </div>
    <div class="faq-answer px-5 pb-5 text-sm leading-7 text-white/55">${faq.a}</div>
  </div>
`).join('');

function toggleFaq(i) {
  const items = document.querySelectorAll('.faq-item');
  const isOpen = items[i].classList.contains('open');
  items.forEach(el => el.classList.remove('open'));
  if (!isOpen) items[i].classList.add('open');
}

// ===== SCORING =====
function scoreDeal() {
  const address  = document.getElementById('address').value.trim();
  const price    = Number(document.getElementById('price').value || 0);
  const lotSize  = document.getElementById('lotSize').value;
  const zoning   = document.getElementById('zoning').value;
  const buyer    = document.getElementById('buyer').value;
  const road     = document.getElementById('road').checked;
  const power    = document.getElementById('power').checked;
  const water    = document.getElementById('water').checked;
  const sewer    = document.getElementById('sewer').checked;
  const flood    = document.getElementById('flood').value;
  const mls      = document.getElementById('mls').value;
  const wildlife = document.getElementById('wildlife').value;

  let score = 100;
  const flags = [];
  const wins  = [];

  if (!address) { score -= 10; flags.push('Missing full property address.'); }
  else wins.push('Full property address included.');

  if (zoning !== 'residential') { score -= 25; flags.push('Zoning not confirmed residential — major risk.'); }
  else wins.push('Residential zoning confirmed.');

  if (!road) { score -= 25; flags.push('Road access not confirmed — deal-killer for most buyers.'); }
  else wins.push('Road access available.');

  if (!power) { score -= 15; flags.push('Power at street not confirmed.'); }
  else wins.push('Power availability confirmed.');

  if (!water) { score -= 8; flags.push('Water not confirmed — price may need a discount.'); }
  else wins.push('Water available.');

  if (!sewer) { score -= 8; flags.push('Sewer not confirmed — verify septic feasibility.'); }
  else wins.push('Sewer available.');

  if (flood === 'ae') { score -= 18; flags.push('Zone AE — high flood risk, needs stronger discount.'); }
  else if (flood === 'verify') { score -= 8; flags.push('Flood zone unverified — check FEMA map before submitting.'); }
  else wins.push('Zone X — lowest flood risk.');

  if (mls === 'listed') { score -= 15; flags.push('MLS-listed — may not fit off-market buyer criteria.'); }
  else if (mls === 'offmarket') wins.push('Off-market deal — buyer preferred.');

  if (wildlife === 'owl')      { score -= 10; flags.push('Owl activity can delay or reduce buyer appetite.'); }
  else if (wildlife === 'tortoise') { score -= 18; flags.push('Tortoise issue may require a major price reduction.'); }
  else if (wildlife === 'none') wins.push('No known wildlife flags.');

  if (price > 40000 && buyer === 'Quick-Flip Lot Buyers') {
    score -= 18;
    flags.push('Price may be too close to retail for a quick-flip buyer.');
  }

  score = Math.max(0, Math.min(100, score));

  let verdict = 'Buyer-Ready';
  if (score < 78) verdict = 'Needs Review';
  if (score < 58) verdict = 'High Risk';

  const barColor  = score >= 78 ? 'bg-green-500' : score >= 58 ? 'bg-yellow-500' : 'bg-red-500';
  const heroColor = score >= 78 ? 'bg-green-400' : score >= 58 ? 'bg-yellow-400' : 'bg-red-400';
  const badgeCls  = score >= 78
    ? 'rounded-full bg-green-500/15 px-3 py-1 text-xs font-bold text-green-200'
    : score >= 58
    ? 'rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-bold text-yellow-200'
    : 'rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-200';

  document.getElementById('score').textContent = score;
  document.getElementById('verdict').textContent = verdict;

  const bar = document.getElementById('bar');
  bar.style.width = score + '%';
  bar.className = 'h-full rounded-full bar-fill ' + barColor;

  const heroBar = document.getElementById('hero-bar');
  heroBar.style.width = score + '%';
  heroBar.className = 'h-full rounded-full bar-fill ' + heroColor;

  const heroBadge = document.getElementById('hero-badge');
  heroBadge.textContent = verdict;
  heroBadge.className = badgeCls;

  document.getElementById('hero-score-txt').textContent = score + ' / 100';

  document.getElementById('wins').innerHTML = wins
    .map(w => `<p class="flex gap-2"><span class="text-green-500 flex-shrink-0">&#10003;</span><span>${w}</span></p>`)
    .join('');

  const flagHtml = flags.length
    ? flags.map(f => `<p class="flex gap-2"><span class="text-red-400 flex-shrink-0">&#9888;</span><span>${f}</span></p>`).join('')
    : '<p class="flex gap-2"><span class="text-green-500">&#10003;</span><span>No major flags from current inputs.</span></p>';
  document.getElementById('flags').innerHTML = flagHtml;

  const nextStep = score >= 78
    ? 'Package the lot into a clean buyer email and request buyer confirmation.'
    : score >= 58
    ? 'Verify risk items before submitting, or negotiate a stronger discount.'
    : 'Do not submit yet. Re-check buildability, buyer criteria, and pricing.';

  document.getElementById('memo').textContent =
`AcrePilot Deal Memo
${'━'.repeat(33)}
Property:     ${address || 'Address needed'}
Asking Price: $${price.toLocaleString()}
Lot Size:     ${lotSize || 'Unknown'} sqft
Target Buyer: ${buyer}
Score:        ${score}/100 — ${verdict}
${'━'.repeat(33)}

STRONG POINTS
${wins.map(w => '• ' + w).join('\n') || '• None from current inputs.'}

RISK FLAGS
${flags.length ? flags.map(f => '• ' + f).join('\n') : '• No major flags.'}

SUGGESTED NEXT STEP
${nextStep}
${'━'.repeat(33)}
Generated by AcrePilot.com`;

  if (window.innerWidth < 1024) {
    document.getElementById('output-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ===== COPY MEMO =====
function copyMemo() {
  const memo = document.getElementById('memo').textContent;
  if (!memo.trim()) { showToast('Score a deal first.'); return; }
  navigator.clipboard.writeText(memo)
    .then(() => showToast('Memo copied to clipboard!'))
    .catch(() => showToast('Select the memo text and copy manually.'));
}

// ===== EMAIL CAPTURE =====
async function captureEmail(e) {
  e.preventDefault();
  const email = document.getElementById('emailInput').value;
  const btn   = document.getElementById('emailBtn');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      showToast('🎉 You’re in! Check your inbox.');
      document.getElementById('emailForm').reset();
    } else {
      showToast('Something went wrong. Please try again.');
    }
  } catch {
    showToast('🎉 You’re in! Check your inbox.');
    document.getElementById('emailForm').reset();
  }

  btn.textContent = 'Get Free Access →';
  btn.disabled = false;
}

// ===== TOAST =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ===== INIT =====
scoreDeal();
