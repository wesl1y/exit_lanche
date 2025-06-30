import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBeb2PT825rFZA5jqrM8AeFOMZFHowCqqQ",
    authDomain: "exit-lanche.firebaseapp.com",
    projectId: "exit-lanche",
    storageBucket: "exit-lanche.firebasestorage.app",
    messagingSenderId: "1092455549985",
    appId: "1:1092455549985:web:3287f1c82102a083226760"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let totalDays = 0;
let dailyEarning = 16.56;
let lastUpdateDate = null;

function formatMoney(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Carrega os dados do Firebase
async function loadDataFromFirebase() {
    try {
        const docRef = doc(db, "contadores", "principal");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            totalDays = data.totalDias || 0;
            lastUpdateDate = data.ultimaAtualizacao || null;
            // console.log("✅ Dados carregados do Firebase:", data);
        } else {
            console.log("📋 Nenhum dado encontrado, iniciando com valores padrão");
            await saveDataToFirebase();
        }
    } catch (error) {
        console.error("❌ Erro ao carregar dados do Firebase:", error);
    }
}

// Salva os dados no Firebase
async function saveDataToFirebase() {
    try {
        await setDoc(doc(db, "contadores", "principal"), {
            totalDias: totalDays,
            ultimaAtualizacao: lastUpdateDate,
            ganhoTotal: totalDays * dailyEarning,
            ganhoDiario: dailyEarning,
            dataAtualizacao: new Date().toISOString()
        });
        console.log("✅ Dados salvos no Firebase!");
    } catch (error) {
        console.error("❌ Erro ao salvar dados no Firebase:", error);
    }
}

async function updateCounters() {
    const now = new Date();
    const today = now.toDateString();

    // Se ainda não teve atualização ou se é um novo dia
    if (!lastUpdateDate || lastUpdateDate !== today) {
        totalDays++;
        lastUpdateDate = today;
        
        await saveDataToFirebase();
        
        updateDisplay();
    }
}

function updateDisplay() {
    const totalDaysElement = document.getElementById('totalDays');
    const totalMoneyElement = document.getElementById('totalMoney');
    
    if (totalDaysElement) {
        totalDaysElement.textContent = totalDays;
    }
    if (totalMoneyElement) {
        totalMoneyElement.textContent = formatMoney(totalDays * dailyEarning);
    }
}

function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const countdown = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const nextUpdateElement = document.getElementById('nextUpdate');
    if (nextUpdateElement) {
        nextUpdateElement.textContent = countdown;
    }
}

async function init() {
    try {
        await loadDataFromFirebase();
        
        // Verifica se precisa atualizar o contador
        await updateCounters();
        
        // Atualiza a tela
        updateDisplay();
        updateCountdown();
        
        setInterval(async () => {
            await updateCounters();
            updateCountdown();
        }, 1000);
        
        console.log("🚀 Sistema inicializado com sucesso!");
        
    } catch (error) {
        console.error("❌ Erro na inicialização:", error);
    }
}

// Inicia o sistema quando a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}