// ── Char Counter ──
const notesInput = document.getElementById('notes-input');
const charCount  = document.getElementById('char-count');

notesInput.addEventListener('input', () => {
  charCount.textContent = notesInput.value.length.toLocaleString();
});

// ── Loader ──
function showLoader(containerId, label) {
  document.getElementById(containerId).innerHTML = `
    <div class="loader">
      <div class="dots"><span></span><span></span><span></span></div>
      ${label}
    </div>`;
}

// ── Simple Markdown-like Formatter ──
function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^(#{1,3})\s+(.+)$/gm, (_, h, t) => `<strong>${t}</strong>`)
    .replace(/^[-•]\s+/gm, '  • ');
}

// ── Summarize ──
async function summarize() {
  const notes = notesInput.value.trim();
  if (!notes) {
    alert('Please paste some notes first!');
    return;
  }

  showLoader('summary-output', 'Generating summary…');

  try {
    const res  = await fetch('/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    document.getElementById('summary-output').innerHTML = `
      <div class="result-card result-summary">
        <h4>AI Summary</h4>
        <div class="result-body">${formatText(data.summary)}</div>
      </div>`;
  } catch (err) {
    document.getElementById('summary-output').innerHTML = `
      <div class="result-card result-summary">
        <h4>Error</h4>
        <div class="result-body" style="color:var(--accent)">${err.message}</div>
      </div>`;
  }
}

// ── Ask Question ──
async function askQuestion() {
  const notes    = notesInput.value.trim();
  const question = document.getElementById('question-input').value.trim();

  if (!question) {
    alert('Please type a question!');
    return;
  }

  showLoader('answer-output', 'Thinking…');

  try {
    const res  = await fetch('/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, question })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    document.getElementById('answer-output').innerHTML = `
      <div class="result-card result-answer">
        <h4>Answer — ${question}</h4>
        <div class="result-body">${formatText(data.answer)}</div>
      </div>`;
  } catch (err) {
    document.getElementById('answer-output').innerHTML = `
      <div class="result-card result-answer">
        <h4>Error</h4>
        <div class="result-body" style="color:var(--accent)">${err.message}</div>
      </div>`;
  }
}

// ── Clear All ──
function clearAll() {
  notesInput.value = '';
  charCount.textContent = '0';
  document.getElementById('question-input').value = '';

  ['summary-output', 'answer-output'].forEach(id => {
    document.getElementById(id).innerHTML = `
      <div class="empty-state">
        <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <path d="M7 8h10M7 12h10M7 16h6"/>
        </svg>
        <p>Output cleared</p>
      </div>`;
  });
}

// ── Enter key on question input ──
document.addEventListener('DOMContentLoaded', () => {
  const qInput = document.getElementById('question-input');
  if (qInput) {
    qInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') askQuestion();
    });
  }
});
