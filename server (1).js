// ============================================================
// Fortescue Chatbot — Backend Server
// Run this with: node server.js
// Listens on http://localhost:3000
// The HTML file sends messages here and gets responses back.
// ============================================================

const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

// ============================================================
// INTENT KNOWLEDGE BASE
// ============================================================
const INTENTS = [
  {
    id: 'problem',
    label: 'Problem / Pain Point',
    keywords: ['problem','solve','issue','challenge','unplanned','downtime',
               'breakdown','failure','outage','disruption','why needed','purpose'],
    response: `<strong>The Core Problem Fortescue Faces</strong><br><br>
      Fortescue's biggest challenge is <strong>unplanned equipment downtime</strong> — when haul trucks, conveyors, rail assets, or fixed plant fail without warning, operations halt and revenue is lost.<br><br>
      Traditional maintenance is either:<br>
      <ul>
        <li><strong>Reactive</strong> — fix it after it breaks (costly, risky)</li>
        <li><strong>Scheduled</strong> — service on a calendar (often inefficient)</li>
      </ul>
      This AI system shifts Fortescue to <strong>predictive maintenance</strong> — anticipating failures before they happen. Target: reduce unplanned downtime by at least 10% within 12 months.`
  },
  {
    id: 'how_works',
    label: 'How It Works / Process',
    keywords: ['how does','how it works','process','steps','workflow','explain',
               'what is predictive','pipeline','stages','work','mechanism'],
    response: `<strong>How Predictive Maintenance Works</strong><br><br>
      The AI system follows a five-stage pipeline:<br><br>
      <span class="tag">1. Ingest</span> Sensor data streams in real time from equipment.<br><br>
      <span class="tag">2. Analyse</span> Azure ML models detect anomalies from healthy baselines.<br><br>
      <span class="tag">3. Score</span> A Failure Risk Score (0–100) is calculated per asset per shift.<br><br>
      <span class="tag">4. Alert</span> Planners receive automated alerts with recommended intervention windows.<br><br>
      <span class="tag">5. Decide</span> Human engineers review AI insights and authorise action.`
  },
  {
    id: 'data',
    label: 'Data Sources / Inputs',
    keywords: ['data','sensor','vibration','temperature','pressure','maintenance log',
               'input','iot','reading','technician','sources'],
    response: `<strong>Data Sources Used by the AI System</strong><br><br>
      The platform ingests data from:<br>
      <ul>
        <li><strong>Equipment sensors</strong> — real-time IoT readings</li>
        <li><strong>Vibration readings</strong> — early indicator of mechanical wear</li>
        <li><strong>Temperature readings</strong> — engine, hydraulic, and bearing heat patterns</li>
        <li><strong>Pressure readings</strong> — hydraulic and pneumatic system integrity</li>
        <li><strong>Maintenance logs</strong> — historical service records</li>
        <li><strong>Technician notes</strong> — field observations that enrich AI context</li>
      </ul>
      All data flows through <strong>Microsoft Azure IoT Hub</strong> into the ML pipeline.`
  },
  {
    id: 'azure',
    label: 'Microsoft Azure Platform',
    keywords: ['azure','microsoft','cloud','platform','why azure','infrastructure',
               'ml studio','iot hub','anomaly','vendor','technology'],
    response: `<strong>Why Microsoft Azure?</strong><br><br>
      <ul>
        <li><strong>Azure IoT Hub</strong> — enterprise-grade sensor data ingestion at scale</li>
        <li><strong>Azure ML Studio</strong> — model training and deployment</li>
        <li><strong>Azure Anomaly Detector</strong> — pre-built time-series anomaly detection API</li>
        <li><strong>Azure Power BI</strong> — dashboards for planners, managers, and investors</li>
        <li><strong>Security &amp; compliance</strong> — ISO 27001, SOC 2, Australian data sovereignty</li>
        <li><strong>Scalability</strong> — handles Fortescue's global multi-site asset fleet</li>
      </ul>
      Preferred over IBM AIOps due to stronger Microsoft licensing integration.`
  },
  {
    id: 'downtime',
    label: 'Downtime Reduction',
    keywords: ['downtime','reduce','reduction','uptime','availability','halt',
               'efficiency','prevent','less downtime','operational'],
    response: `<strong>How This AI System Reduces Downtime</strong><br><br>
      <span class="tag">Early Warning</span> Risk scores calculated continuously. Vibration deviations flagged before mechanical failure gives planners time to act.<br><br>
      <span class="tag">Planned Intervention</span> Maintenance scheduled within a recommended window instead of emergency shutdowns.<br><br>
      <span class="tag">Root Cause Insights</span> System identifies which subsystem is degrading so technicians arrive prepared.<br><br>
      Primary KPI: <strong>≥10% reduction in unplanned downtime</strong> within 12 months.`
  },
  {
    id: 'investor',
    label: 'Investor Benefits',
    keywords: ['investor','investment','superannuation','super fund','shareholder',
               'return','roi','confidence','financial','revenue','profit','fund'],
    response: `<strong>Why This Matters to Investors &amp; Super Funds</strong><br><br>
      <ul>
        <li>📉 <strong>Lower operational disruption risk</strong> — protects revenue continuity</li>
        <li>📊 <strong>Improved earnings reliability</strong> — supports financial forecasting</li>
        <li>🏗️ <strong>Better asset lifecycle management</strong> — reduces capital expenditure</li>
        <li>🌱 <strong>ESG alignment</strong> — lower carbon output per tonne moved</li>
        <li>💡 <strong>Digital transformation credibility</strong> — demonstrates tech-led operations</li>
        <li>🛡️ <strong>Stronger risk management</strong> — reduces human error in decisions</li>
      </ul>`
  },
  {
    id: 'risks',
    label: 'Risks and Limitations',
    keywords: ['risk','limitation','downside','concern','accuracy','error',
               'false positive','wrong','fail','drawback','caveat'],
    response: `<strong>Risks and Limitations</strong><br><br>
      <ul>
        <li>⚠️ <strong>Data quality dependency</strong> — AI is only as good as the sensor data it receives</li>
        <li>⚠️ <strong>Probabilistic outputs</strong> — false positives and missed faults are both possible</li>
        <li>⚠️ <strong>Human validation required</strong> — engineers must review all recommendations</li>
        <li>⚠️ <strong>Integration complexity</strong> — connecting to legacy OT/SCADA systems takes time</li>
        <li>⚠️ <strong>Change management</strong> — technician and planner adoption is critical</li>
        <li>⚠️ <strong>This is a prototype</strong> — all current data is simulated</li>
      </ul>`
  },
  {
    id: 'sustainability',
    label: 'Sustainability / ESG',
    keywords: ['sustainability','green','environment','esg','carbon','emission',
               'net zero','climate','renewable','energy','scope','decarbonise'],
    response: `<strong>Sustainability Benefits</strong><br><br>
      Fortescue targets <strong>real zero Scope 1 and 2 emissions by 2030</strong>. Predictive maintenance supports this by:<br><br>
      <ul>
        <li>🌱 <strong>Fewer emergency runs</strong> — less diesel idling during unplanned repairs</li>
        <li>♻️ <strong>Longer equipment life</strong> — reduces replacement energy and material costs</li>
        <li>📊 <strong>Better sustainability reporting</strong> — real-time data improves Scope 1 accuracy</li>
        <li>🔋 <strong>Green fleet integration</strong> — extends to battery-electric and hydrogen-powered assets</li>
      </ul>`
  },
  {
    id: 'score',
    label: 'Failure Risk Score',
    keywords: ['score','risk score','failure score','rating','probability',
               'likelihood','predict','forecast','0 to 100','how is risk calculated'],
    response: `<strong>How the Failure Risk Score Works</strong><br><br>
      The AI calculates a score from <strong>0 to 100</strong> per asset, updated continuously:<br><br>
      <span class="tag">0–30</span> <span style="color:#00d68f">Low Risk</span> — Normal parameters. Standard scheduled maintenance applies.<br><br>
      <span class="tag">31–65</span> <span style="color:#ffbe00">Medium Risk</span> — Elevated anomaly signals. Plan intervention within 5–7 days.<br><br>
      <span class="tag">66–100</span> <span style="color:#ff4d6d">High Risk</span> — Significant deviation. Immediate inspection within 24–48 hours.`
  },
  {
    id: 'human',
    label: 'Human Role / Oversight',
    keywords: ['human','expert','engineer','technician','planner','decision',
               'replace','automate','role','who decides','manual','oversight'],
    response: `<strong>The Human Role in This AI System</strong><br><br>
      This system is a <strong>decision-support tool, not an autonomous decision-maker</strong>:<br><br>
      <ul>
        <li>🧑‍🔧 <strong>Maintenance planners</strong> — receive alerts and decide when to act</li>
        <li>🧑‍💼 <strong>Managers</strong> — review fleet health trends via Power BI dashboards</li>
        <li>🔬 <strong>Engineers</strong> — validate AI recommendations before approving intervention</li>
        <li>👷 <strong>Field technicians</strong> — carry out physical maintenance using AI diagnostics</li>
      </ul>
      The AI accelerates human decision-making — it never replaces expert authority.`
  },
  {
    id: 'cost',
    label: 'Cost and Business Value',
    keywords: ['cost','saving','expensive','budget','capex','opex','spend',
               'worth','value','benefit','price','afford','business case'],
    response: `<strong>Cost and Business Value</strong><br><br>
      <ul>
        <li>💰 <strong>Lower unplanned maintenance costs</strong> — emergency repairs far more expensive than planned servicing</li>
        <li>📦 <strong>Reduced spare parts waste</strong> — parts ordered when needed</li>
        <li>⏱️ <strong>Shorter MTTR</strong> — technicians arrive prepared with right diagnosis</li>
        <li>🏗️ <strong>Extended asset lifespan</strong> — timely maintenance prevents cumulative damage</li>
        <li>📈 <strong>Improved throughput</strong> — fewer unplanned stops means more ore moved</li>
      </ul>
      ROI expected within the first <strong>24 months</strong> of deployment.`
  },
  {
    id: 'reports_links',
    label: 'Reports / Links / Current Info',
    keywords: ['report','reports','current','latest','annual report','esg report',
               'sustainability report','progress','where can i find','find','link',
               'website','fortescue website','investor relations','disclosure',
               'filing','published','documents','download','access'],
    response: `<strong>Fortescue Reports &amp; Official Resources</strong><br><br>
      Here are the key links to Fortescue's publicly available reports and disclosures:<br><br>
      <ul>
        <li>🌱 <strong>Sustainability &amp; ESG Reports</strong><br>
            <a href="https://www.fortescue.com/en/sustainability" target="_blank" rel="noopener noreferrer"
               style="color:var(--ore);word-break:break-all;">
              fortescue.com/en/sustainability
            </a>
        </li>
        <li>📊 <strong>Investor Relations (Annual Reports, ASX filings)</strong><br>
            <a href="https://www.fortescue.com/en/investors" target="_blank" rel="noopener noreferrer"
               style="color:var(--ore);word-break:break-all;">
              fortescue.com/en/investors
            </a>
        </li>
        <li>📰 <strong>Latest News &amp; Media Releases</strong><br>
            <a href="https://www.fortescue.com/en/media" target="_blank" rel="noopener noreferrer"
               style="color:var(--ore);word-break:break-all;">
              fortescue.com/en/media
            </a>
        </li>
      </ul>
      All links open Fortescue's official website in a new tab. For ASX filings, the investor relations page also links through to the ASX announcements portal.`
  },
  {
    id: 'demo',
    label: 'Demo / Simulator',
    keywords: ['demo','simulate','simulator','show','example','try','test',
               'sample','demonstrate','risk simulator','interactive'],
    response: `<strong>Equipment Risk Simulator</strong><br><br>
      Use the panel on the right side of this page to try the live risk simulator.<br><br>
      Select one of four asset types:<br>
      <ul>
        <li>🚛 <strong>Haul Truck</strong></li>
        <li>🏭 <strong>Conveyor</strong></li>
        <li>🚂 <strong>Rail Asset</strong></li>
        <li>⚙️ <strong>Fixed Plant Infrastructure</strong></li>
      </ul>
      Each shows a simulated failure risk score, risk level, intervention window, and recommended action.`
  }
];

const FALLBACK_SUGGESTIONS = [
  "What problem does this AI system solve?",
  "How does predictive maintenance work?",
  "How does this benefit investors?",
  "What data does the system use?",
  "Why use Microsoft Azure?",
  "What are the risks of this AI system?",
  "How does this support sustainability?",
  "How does the failure risk score work?",
  "What is the role of human experts?",
  "Where can I find Fortescue's current reports?"
];

// ============================================================
// INTENT DETECTION ENGINE
// ============================================================
function detectIntent(userText) {
  const lower = userText.toLowerCase().trim();
  let bestIntent = null;
  let bestScore  = 0;
  const scores   = [];

  for (const intent of INTENTS) {
    let score = 0;
    const hits  = [];
    const misses = [];
    for (const kw of intent.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        score++;
        hits.push(kw);
      } else {
        misses.push(kw);
      }
    }
    scores.push({ id: intent.id, label: intent.label, score, hits, misses });
    if (score > bestScore) {
      bestScore  = score;
      bestIntent = intent;
    }
  }

  return {
    matched: bestScore >= 1 ? bestIntent : null,
    score:   bestScore,
    scores,
    lower
  };
}

// ============================================================
// POST /chat  — main endpoint called by the HTML chatbot
// Body:    { "message": "user question here" }
// Returns: { response, intent, score, scores, lower }
// ============================================================
app.post('/chat', (req, res) => {
  const userText = (req.body.message || '').trim();
  console.log(`[${new Date().toLocaleTimeString()}] Received: "${userText}"`);

  if (!userText) {
    return res.json({ response: 'Please type a question.', intent: 'none', score: 0 });
  }

  const result = detectIntent(userText);

  let response;
  if (result.matched) {
    response = result.matched.response;
    console.log(`[${new Date().toLocaleTimeString()}] Matched intent: "${result.matched.id}" (score: ${result.score})`);
  } else {
    const picks = FALLBACK_SUGGESTIONS.sort(() => Math.random() - 0.5).slice(0, 3);
    response = `I'm not sure I have a specific answer to that. Here are some things I can help with:<br><br>
      <div class="suggestions">
        ${picks.map(q => `<button class="suggest-chip" data-q="${q}">→ ${q}</button>`).join('')}
      </div>`;
    console.log(`[${new Date().toLocaleTimeString()}] No match — returning fallback suggestions`);
  }

  res.json({
    response,
    intent:  result.matched ? result.matched.id : 'fallback',
    score:   result.score,
    scores:  result.scores,
    lower:   result.lower
  });
});

// GET /  — health check
app.get('/', (req, res) => {
  res.json({ status: 'running', message: 'Fortescue Chatbot Backend Server is active.' });
});

// ============================================================
// START SERVER
// ============================================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Fortescue Chatbot Backend Server                ║');
  console.log('║  Running at http://localhost:3000                 ║');
  console.log('║  Open chatbot.html in your browser to start      ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
  console.log('Waiting for messages...');
});
