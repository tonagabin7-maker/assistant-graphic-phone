// ÉTAPE 1 : on teste juste l'interface, sans IA connectée pour l'instant.
// À l'étape 2, on remplacera "reponseTest()" par un vrai appel à l'API Claude.

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

function reponseTest(question) {
  // Simple réponse de test pour vérifier que tout s'affiche bien.
  return "Interface OK ✅ Tu as écrit : \"" + question + "\". L'IA sera branchée à l'étape 2.";
}

function envoyer() {
  const texte = userInput.value.trim();
  if (!texte) return;

  ajouterMessage(texte, 'user');
  userInput.value = '';

  setTimeout(() => {
    const reponse = reponseTest(texte);
    ajouterMessage(reponse, 'assistant');
  }, 300);
}

sendBtn.addEventListener('click', envoyer);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') envoyer();
});

// Message d'accueil
ajouterMessage("Bonjour ! Je suis ton assistant Graphic Phone. (Mode test - étape 1)", 'assistant');
