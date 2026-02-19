/* ── 상태 관리 ── */
let mode = 'thread';
let chunks = [];

window.onload = () => {
  if(localStorage.getItem('sf_key')) document.getElementById('apiKey').value = localStorage.getItem('sf_key');
  if(localStorage.getItem('sf_model')) document.getElementById('modelSel').value = localStorage.getItem('sf_model');
};

/* ── UI 유틸 ── */
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  document.getElementById('progress').style.width = (window.scrollY / (h.scrollHeight - h.clientHeight) * 100) + '%';
});

function switchMode(m) {
  mode = m;
  document.getElementById('threadBtn').classList.toggle('active', m === 'thread');
  document.getElementById('magBtn').classList.toggle('active', m === 'magazine');
}

function toggleSettings() { document.getElementById('settingsPanel').classList.toggle('open'); }
function saveSettings() {
  localStorage.setItem('sf_key', document.getElementById('apiKey').value);
  localStorage.setItem('sf_model', document.getElementById('modelSel').value);
  toggleSettings(); toast('설정 저장 완료');
}
function toast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg;
  t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500);
}
function setLoading(b) {
  const btn = document.getElementById('genBtn');
  btn.disabled = b; btn.textContent = b ? '처리 중...' : '✦ 변환 실행';
}
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ── 파일 파싱 로직 (PDF/OCR) ── */
const dropZone = document.getElementById('dropZone');
const parseStatus = document.getElementById('parseStatus');

if (dropZone) {
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('dragover');
    if(e.dataTransfer.files.length) processFile(e.dataTransfer.files[0]);
  });
}

function handleFileSelect(e) { if(e.target.files.length) processFile(e.target.files[0]); }

async function processFile(file) {
  parseStatus.classList.add('active');
  parseStatus.textContent = `${file.name} 로컬 분석 중...`;
  setLoading(true);
  
  try {
    let text = "";
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map(item => item.str).join(" ") + "\n\n";
      }
    } else if (file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      const res = await Tesseract.recognize(imageUrl, 'kor+eng');
      URL.revokeObjectURL(imageUrl);
      text = res.data.text;
    } else throw new Error("PDF 또는 이미지만 지원");

    if(!text.trim()) throw new Error("추출된 텍스트 없음");
    
    const store = document.getElementById('rawTextStore');
    store.value += (store.value ? "\n\n" : "") + text;
    buildChunks(store.value);
    toast('✓ 파싱 및 분할 완료');
  } catch(e) { toast(`⚠ 오류: ${e.message}`); }
  finally { parseStatus.classList.remove('active'); parseStatus.textContent = ''; setLoading(false); document.getElementById('fileInput').value = ""; }
}

/* ── 청킹 및 UI 렌더링 ── */
function buildChunks(fullText) {
  const segments = fullText.split(/\n\n+/).map(s => s.trim()).filter(s => s.length > 20);
  chunks = segments.map((txt, i) => ({ id: i, text: txt, selected: true }));
  renderChunks();
}

function renderChunks() {
  const container = document.getElementById('chunkList');
  container.innerHTML = chunks.map(c => `
    <div class="article-card ${c.selected ? 'selected' : ''}" onclick="toggleChunk(${c.id})">
      <div class="card-header">
        <div class="chunk-check"></div>
        <div class="card-titles">
          <span class="badge badge-blue">BLOCK ${c.id + 1}</span>
          <div class="card-title" style="margin-top:6px;">${esc(c.text)}</div>
        </div>
      </div>
    </div>
  `).join('');
  updateStats();
}

function toggleChunk(id) {
  const c = chunks.find(x => x.id === id);
  if(c) { c.selected = !c.selected; renderChunks(); }
}

function updateStats() {
  const sel = chunks.filter(c => c.selected);
  document.getElementById('chunkCount').textContent = sel.length;
  document.getElementById('charCount').textContent = sel.reduce((a, c) => a + c.text.length, 0).toLocaleString() + ' chars';
}

/* ── LLM 생성 ── */
async function generate() {
  const text = chunks.filter(c => c.selected).map(c => c.text).join('\n\n---\n\n');
  if(!text) { toast('선택된 데이터가 없습니다.'); return; }
  
  const key = localStorage.getItem('sf_key');
  setLoading(true);
  document.getElementById('outputContainer').innerHTML = '<div class="empty-state"><h3>AI 변환 중...</h3><p>잠시만 기다려주세요.</p></div>';

  try {
    let resData;
    if(key) {
      const model = localStorage.getItem('sf_model') || 'gpt-4o-mini';
      const prompt = mode === 'thread' 
        ? `ADHD 학생을 위해 다음 내용을 트위터 타래로 요약. JSON {"tweets":["..."]} 응답:\n${text}`
        : `인스타그램 카드뉴스 형식으로 요약. JSON {"cards":[{"headline":"...","body":"..."}]} 응답:\n${text}`;
        
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ model, messages: [{role: 'user', content: prompt}], response_format: {type: 'json_object'}, temperature: 0.7 })
      });
      if(!res.ok) throw new Error('API 오류');
      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      resData = mode === 'thread' ? parsed.tweets : parsed.cards;
    } else {
      toast('API 키 없음: 기본 분할 적용');
      resData = mode === 'thread' ? text.split('---\n\n') : text.split('---\n\n').map((t,i) => ({headline:`개념 ${i+1}`, body:t.slice(0,100)}));
    }
    renderOutput(resData);
  } catch(e) { document.getElementById('outputContainer').innerHTML = `<div class="empty-state" style="color:var(--burgundy)"><h3>오류 발생</h3><p>${e.message}</p></div>`; }
  finally { setLoading(false); }
}

function renderOutput(data) {
  const cont = document.getElementById('outputContainer');
  if(!data || !data.length) { cont.innerHTML = '<div class="empty-state">결과 없음</div>'; return; }
  
  if(mode === 'thread') {
    cont.innerHTML = `<div class="thread-grid">` + data.map((t, i) => `
      <div class="thread-card">
        <button class="copy-btn" onclick="navigator.clipboard.writeText('${esc(t)}');toast('복사됨')">복사</button>
        <div class="t-meta">THREAD ${i+1}/${data.length}</div>
        <div class="t-text">${esc(t)}</div>
      </div>`).join('') + `</div>`;
  } else {
    cont.innerHTML = `<div class="magazine-grid">` + data.map((c, i) => `
      <div class="mag-card">
        <button class="copy-btn" onclick="navigator.clipboard.writeText('${esc(c.body)}');toast('복사됨')">복사</button>
        <div>
          <div class="mag-issue">CARD ${String(i+1).padStart(2,'0')}</div>
          <div class="mag-headline">${esc(c.headline)}</div>
        </div>
        <div class="mag-body">${esc(c.body)}</div>
      </div>`).join('') + `</div>`;
  }
}
