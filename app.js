// ETAPE 3 : Chat connecte a l'API Claude
const CLAUDE_API_KEY = 'sk-cs4-f71a6b468c368c9c340160080080920cb36ceb4d23a63324'; // <-- remplace par ta nouvelle cle (celle que tu as revoquee ne marchera plus)
const CLAUDE_MODEL = 'claude-3-5-haiku-latest';
const SYSTEM_INSTRUCTION = "Tu es l'assistant personnel pour la marque 'Graphic Phone' (graphisme mobile) et la formation 'G∆MYs Academy VIP'. Charte graphique : palette navy/brun/or, typographie Montserrat. Reponds toujours en francais, de facon concise et directement utilisable pour du graphisme, de la creation de contenu, de la formation ou du coaching.";

const STORAGE_KEY = 'graphicPhoneLib';
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentCategory = 'Toutes';

const tabBtns = document.querySelectorAll('.tab-btn');
const screens = document.querySelectorAll('.screen');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    screens.forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.screen).classList.add('active');
    document.getElementById('addBtn').style.display = (btn.dataset.screen === 'libScreen') ? 'flex' : 'none';
    if (btn.dataset.screen === 'libScreen') renderLibrary();
  });
});

const chat = document.getElementById('chat');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function ajouterMessage(texte, type) {
  const div = document.createElement('div');
  div.className = 'msg ' + type;
  div.textContent = texte;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

async function envoyer() {
  const texte = userInput.value.trim();
  if (!texte) return;
  ajouterMessage(texte, 'user');
  userInput.value = '';

  const loadingDiv = ajouterMessage('Reflexion...', 'assistant');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: SYSTEM_INSTRUCTION,
        messages: [{ role: 'user', content: texte }]
      })
    });
    const data = await response.json();
    const reponse = (data.content && data.content[0] && data.content[0].text)
      ? data.content[0].text
      : "Desole, pas de reponse generee. Verifie ta cle API. Detail: " + JSON.stringify(data).slice(0, 150);
    loadingDiv.textContent = reponse;
  } catch (err) {
    loadingDiv.textContent = "Erreur de connexion. Verifie ta cle API et ta connexion internet.";
  }
  chat.scrollTop = chat.scrollHeight;
}

sendBtn.addEventListener('click', envoyer);
userInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') envoyer(); });
ajouterMessage("Bonjour ! Je suis connecte a l'IA maintenant. Pose-moi ta question.", 'assistant');

const libList = document.getElementById('libList');
const libSearch = document.getElementById('libSearch');
const categoryTabs = document.getElementById('categoryTabs');
const addBtn = document.getElementById('addBtn');
const addModal = document.getElementById('addModal');
const addForm = document.getElementById('addForm');
const cancelEntryBtn = document.getElementById('cancelEntryBtn');

const CATEGORIES = ['Toutes', 'Posts', 'Reponses clients', 'Formation'];

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function renderCategoryTabs() {
  categoryTabs.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat === currentCategory ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      currentCategory = cat;
      renderLibrary();
    });
    categoryTabs.appendChild(btn);
  });
}

function renderLibrary() {
  renderCategoryTabs();
  const search = libSearch.value.toLowerCase();
  const filtered = entries.filter(e => {
    const matchCat = currentCategory === 'Toutes' || e.category === currentCategory;
    const matchSearch = e.title.toLowerCase().includes(search) || e.content.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  libList.innerHTML = '';
  if (filtered.length === 0) {
    libList.innerHTML = '<p style="opacity:0.6;text-align:center;margin-top:20px;">Aucun contenu pour le moment.</p>';
    return;
  }

  filtered.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'lib-card';
    card.innerHTML =
      '<h3>' + entry.title + ' <span style="opacity:0.6;font-size:11px;">(' + entry.category + ')</span></h3>' +
      '<p>' + entry.content + '</p>' +
      '<div class="lib-actions">' +
      '<button onclick="copierContenu(\'' + entry.id + '\')">Copier</button>' +
      '<button onclick="ouvrirWhatsApp(\'' + entry.id + '\')">WhatsApp</button>' +
      '<button onclick="ouvrirFacebook(\'' + entry.id + '\')">Facebook</button>' +
      '<button class="danger" onclick="supprimerEntree(\'' + entry.id + '\')">Supprimer</button>' +
      '</div>';
    libList.appendChild(card);
  });
}

libSearch.addEventListener('input', renderLibrary);

addBtn.addEventListener('click', () => { addModal.classList.add('active'); });
cancelEntryBtn.addEventListener('click', () => { addModal.classList.remove('active'); addForm.reset(); });

addForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('entryTitle').value.trim();
  const category = document.getElementById('entryCategory').value;
  const content = document.getElementById('entryContent').value.trim();
  if (!title || !content) return;

  entries.unshift({ id: Date.now().toString(), title: title, category: category, content: content });
  saveEntries();
  addModal.classList.remove('active');
  addForm.reset();
  renderLibrary();
});

function copierContenu(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  navigator.clipboard.writeText(entry.content).then(() => {
    alert('Copie dans le presse-papier !');
  });
}

function ouvrirWhatsApp(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  navigator.clipboard.writeText(entry.content);
  window.open('https://wa.me/?text=' + encodeURIComponent(entry.content), '_blank');
}

function ouvrirFacebook(id) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  navigator.clipboard.writeText(entry.content);
  alert('Contenu copie ! Colle-le directement dans Facebook.');
  window.open('https://www.facebook.com/', '_blank');
}

function supprimerEntree(id) {
  if (!confirm('Supprimer ce contenu ?')) return;
  entries = entries.filter(e => e.id !== id);
  saveEntries();
  renderLibrary();
}

do
