    // Configuração do Firebase
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
    let metas = [];

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
                metas = data.metas || [];
                console.log("✅ Dados carregados do Firebase:", data);
            } else {
                console.log("📋 Nenhum dado encontrado, iniciando com valores padrão");
                // Metas padrão
                metas = [
                    { id: 'oculos', nome: 'ÓCULOS', valor: 700, status: 'planejando', prioridade: 'media', concluida: false },
                    { id: 'tv', nome: 'TV', valor: 2000, status: 'planejando', prioridade: 'media', concluida: false }
                ];
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
                dataAtualizacao: new Date().toISOString(),
                metas: metas
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

    // Renderiza as metas na tela
    function renderMetas() {
        const metasContainer = document.querySelector('.metas-container');
        const metasTitle = metasContainer.querySelector('.metas-title');
        const addButton = metasContainer.querySelector('.add-meta-btn');
        const stats = metasContainer.querySelector('.stats');
        
        // Remove metas existentes
        const existingMetas = metasContainer.querySelectorAll('.meta-item');
        existingMetas.forEach(meta => meta.remove());
        
        // Adiciona cada meta
        metas.forEach(meta => {
            const metaElement = document.createElement('div');
            metaElement.className = `meta-item ${meta.concluida ? 'completed' : ''}`;
            metaElement.innerHTML = `
                <div class="meta-header">
                    <div class="checkbox-container">
                        <input type="checkbox" id="${meta.id}" ${meta.concluida ? 'checked' : ''} onchange="toggleMeta('${meta.id}')">
                    </div>
                    <label for="${meta.id}" class="meta-name">${meta.nome}</label>
                    <span class="meta-value">R$ ${meta.valor.toLocaleString('pt-BR')}</span>
                </div>
                <div class="meta-controls">
                    <select class="status-select" onchange="updateStatus('${meta.id}', this.value)">
                        <option value="planejando" ${meta.status === 'planejando' ? 'selected' : ''}>🎯 Planejando</option>
                        <option value="progresso" ${meta.status === 'progresso' ? 'selected' : ''}>🔄 Em Progresso</option>
                        <option value="pausado" ${meta.status === 'pausado' ? 'selected' : ''}>⏸️ Pausado</option>
                        <option value="concluido" ${meta.status === 'concluido' ? 'selected' : ''}>✅ Concluído</option>
                    </select>
                    <select class="priority-select" onchange="updatePriority('${meta.id}', this.value)">
                        <option value="baixa" ${meta.prioridade === 'baixa' ? 'selected' : ''}>🟢 Baixa</option>
                        <option value="media" ${meta.prioridade === 'media' ? 'selected' : ''}>🟡 Média</option>
                        <option value="alta" ${meta.prioridade === 'alta' ? 'selected' : ''}>🔴 Alta</option>
                    </select>
                    <button class="delete-btn" onclick="deleteMeta('${meta.id}', this)">
                        Deletar
                    </button>
                </div>
            `;
            
            metasContainer.insertBefore(metaElement, addButton);
        });
        
        updateStats();
    }

    // Funções das metas
    async function toggleMeta(metaId) {
        const meta = metas.find(m => m.id === metaId);
        if (meta) {
            meta.concluida = !meta.concluida;
            meta.status = meta.concluida ? 'concluido' : 'planejando';
            await saveDataToFirebase();
            renderMetas();
        }
    }

    async function updateStatus(metaId, status) {
        const meta = metas.find(m => m.id === metaId);
        if (meta) {
            meta.status = status;
            meta.concluida = (status === 'concluido');
            await saveDataToFirebase();
            renderMetas();
        }
    }

    async function updatePriority(metaId, prioridade) {
        const meta = metas.find(m => m.id === metaId);
        if (meta) {
            meta.prioridade = prioridade;
            await saveDataToFirebase();
            console.log('Prioridade atualizada:', prioridade);
        }
    }

    async function deleteMeta(metaId, button) {
        const metaItem = button.closest('.meta-item');
        const meta = metas.find(m => m.id === metaId);

        if (meta && confirm(`Tem certeza que deseja excluir a meta "${meta.nome}"?`)) {
            metaItem.classList.add('removing');

            setTimeout(async () => {
                metaItem.remove();
                metas = metas.filter(m => m.id !== metaId);
                await saveDataToFirebase();
                renderMetas();
            }, 300);
        }
    }

    async function addNewMeta() {
        const nome = prompt('Nome da meta:');
        const valor = prompt('Valor da meta (apenas números):');
        
        if (nome && valor) {
            const newMeta = {
                id: 'meta_' + Date.now(),
                nome: nome.toUpperCase(),
                valor: parseInt(valor),
                status: 'planejando',
                prioridade: 'media',
                concluida: false
            };
            
            metas.push(newMeta);
            await saveDataToFirebase();
            renderMetas();
        }
    }

    function updateStats() {
        const metasConcluidas = metas.filter(m => m.concluida).length;
        const valorTotal = metas.reduce((sum, meta) => sum + meta.valor, 0);
        
        const totalMetasElement = document.getElementById('totalMetas');
        const metasConcluidasElement = document.getElementById('metasConcluidas');
        const valorTotalElement = document.getElementById('valorTotal');
        
        if (totalMetasElement) totalMetasElement.textContent = metas.length;
        if (metasConcluidasElement) metasConcluidasElement.textContent = metasConcluidas;
        if (valorTotalElement) valorTotalElement.textContent = `R$ ${valorTotal.toLocaleString('pt-BR')}`;
    }

    async function init() {
        try {
            await loadDataFromFirebase();
            
            // Verifica se precisa atualizar o contador
            await updateCounters();
            
            // Atualiza a tela
            updateDisplay();
            updateCountdown();
            renderMetas();
            
            setInterval(async () => {
                await updateCounters();
                updateCountdown();
            }, 1000);
            
            console.log("🚀 Sistema inicializado com sucesso!");
            
        } catch (error) {
            console.error("❌ Erro na inicialização:", error);
        }
    }

    // Torna as funções globais para uso nos event handlers
    window.toggleMeta = toggleMeta;
    window.updateStatus = updateStatus;
    window.updatePriority = updatePriority;
    window.addNewMeta = addNewMeta;
    window.deleteMeta = deleteMeta;

    // Inicia o sistema quando a página carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }