import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCgrpcyoU6mWzsFGD0RNHwFe8EF3u_YQ-0",
  authDomain: "landing-page-leads-rendaextra.firebaseapp.com",
  projectId: "landing-page-leads-rendaextra",
  storageBucket: "landing-page-leads-rendaextra.firebasestorage.app",
  messagingSenderId: "346035350566",
  appId: "1:346035350566:web:e1c7eb9f15ee577a538ae7",
  measurementId: "G-WHM53SLFHH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "landing-page-db");

// Máscara do WhatsApp
const whatsappInput = document.getElementById('whatsapp');

whatsappInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');

  if (value.length > 11) value = value.slice(0, 11);

  if (value.length > 0) {
    value = value.replace(/^(\d{2})(\d)/g, '($1)$2');
  }

  if (value.length > 9) {
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
  }

  e.target.value = value;
});

// Envio do formulário
document.getElementById("form").addEventListener("submit", async function(e) {
  e.preventDefault();

  const btn = e.target.querySelector("button[type=submit]");
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const whatsapp = document.getElementById("whatsapp").value;

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailValido.test(email)) {
    alert("Email inválido");
    return;
  }

  const whatsappNumeros = whatsapp.replace(/\D/g, '');
  if (whatsappNumeros.length !== 11) {
    alert("WhatsApp inválido. Digite com DDD.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Enviando...";

  console.log("1 - Iniciou envio");

  try {
    console.log("2 - Antes do Firestore");
    console.log("db:", db);

    await addDoc(collection(db, "leads"), {
      nome,
      email,
      whatsapp,
      createdAt: serverTimestamp()
    });
    console.log("3 - Salvou no Firestore");

} catch (error) {
    console.error(error);
    console.error("ERRO FIRESTORE:", error);
    alert("Erro de conexão. Tente novamente.");
    btn.disabled = false;
    btn.textContent = "QUERO COMEÇAR AGORA 🚀";
    return;
}

// Make roda separado — se falhar não trava o fluxo
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

try {
  await fetch("https://hook.us2.make.com/v932tjqd7cbzkbkjqvgiudx3gpjosigw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      email,
      whatsapp,
      createdAt: new Date().toISOString(),
      status: "new"
    }),
    signal: controller.signal

  });
} catch (e) {
  console.error("Make webhook falhou:", e);
} finally {
  clearTimeout(timeout);
}
document.getElementById("form").reset();
window.location.href = "obrigado.html";
});