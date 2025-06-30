    let totalDays = 12;
    let dailyEarning = 16.56; // R$ 30 por dia
    let lastUpdateDate = null;

    function formatMoney(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    function updateCounters() {
        const now = new Date();
        const today = now.toDateString();

        // Se ainda não teve atualização ou se é um novo dia
        if (!lastUpdateDate || lastUpdateDate !== today) {
            totalDays++;
            lastUpdateDate = today;
            
            // Atualiza os valores na tela
            document.getElementById('totalDays').textContent = totalDays;
            document.getElementById('totalMoney').textContent = formatMoney(totalDays * dailyEarning);
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
        document.getElementById('nextUpdate').textContent = countdown;
    }

    // Inicializa na primeira carga
    updateCounters();

    // Atualiza a cada segundo para verificar se é um novo dia
    setInterval(() => {
        updateCounters();
        updateCountdown();
    }, 1000);

    // Atualiza o countdown imediatamente
    updateCountdown();