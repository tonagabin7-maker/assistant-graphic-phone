// ETAPE 2 : Bibliotheque de contenu (gratuite, sans IA connectee)
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
}

function envoyer() {
  const texte = userInput.value.trim();
  if (!texte) return;
  ajouterMessage(texte, 'user');
  userInput.value = '';
  setTimeout(() => {
    ajouterMessage("Mode test - IA pas encore branchee. Utilise l onglet Bibliotheque pour organiser ton contenu.", 'assistant');
  }, 300);
}

sendBtn.addEventListener('click', envoyer);
userInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') envoyer(); });
ajouterMessage("Bonjour ! Le chat IA n est pas encore branche. Utilise la Bibliotheque pour stocker tes contenus.", 'assistant');

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

document.getElementById('addBtn').style.display = 'none';
renderLibrary();
