// Конфигурация TON Connect
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://your-domain.com/tonconnect-manifest.json',
    buttonRootId: 'ton-connect-button'
});

class TonWallet {
    constructor() {
        this.wallet = null;
        this.balance = 0;
        this.init();
    }

    async init() {
        // Слушаем изменения состояния кошелька
        tonConnectUI.onStatusChange(wallet => {
            this.wallet = wallet;
            if (wallet) {
                this.onWalletConnected(wallet);
            } else {
                this.onWalletDisconnected();
            }
        });

        // Проверяем, подключен ли уже кошелек
        const currentWallet = tonConnectUI.wallet;
        if (currentWallet) {
            this.wallet = currentWallet;
            this.onWalletConnected(currentWallet);
        }
    }

    async connectWallet() {
        try {
            await tonConnectUI.openModal();
        } catch (error) {
            console.error('Ошибка подключения кошелька:', error);
        }
    }

    async disconnectWallet() {
        try {
            await tonConnectUI.disconnect();
        } catch (error) {
            console.error('Ошибка отключения кошелька:', error);
        }
    }

    async onWalletConnected(wallet) {
        console.log('Кошелек подключен:', wallet);
        
        // Получаем баланс
        await this.updateBalance();
        
        // Обновляем UI
        this.updateWalletUI();
        
        // Показываем уведомление
        this.showNotification('Кошелек успешно подключен!', 'success');
    }

    onWalletDisconnected() {
        console.log('Кошелек отключен');
        this.wallet = null;
        this.balance = 0;
        this.updateWalletUI();
        this.showNotification('Кошелек отключен', 'info');
    }

    async updateBalance() {
        if (!this.wallet) return;

        try {
            // Получаем баланс через TON API
            const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${this.wallet.account.address}`);
            const data = await response.json();
            
            if (data.ok) {
                // Конвертируем из nanotons в TON
                this.balance = parseFloat(data.result) / 1000000000;
            }
        } catch (error) {
            console.error('Ошибка получения баланса:', error);
        }
    }

    updateWalletUI() {
        const walletBtn = document.getElementById('walletButton');
        const walletInfo = document.getElementById('walletInfo');
        
        if (this.wallet) {
            // Показываем информацию о кошельке
            const shortAddress = this.formatAddress(this.wallet.account.address);
            
            if (walletBtn) {
                walletBtn.innerHTML = `
                    <img src="assets/icons/ton_icon.png" alt="TON" class="wallet-icon">
                    <div class="wallet-data">
                        <span class="wallet-address">${shortAddress}</span>
                        <span class="wallet-balance">${this.balance.toFixed(2)} TON</span>
                    </div>
                `;
                walletBtn.onclick = () => this.showWalletModal();
            }
        } else {
            // Показываем кнопку подключения
            if (walletBtn) {
                walletBtn.innerHTML = `
                    <img src="assets/icons/ton_icon.png" alt="TON" class="wallet-icon">
                    <span>Подключить кошелек</span>
                `;
                walletBtn.onclick = () => this.connectWallet();
            }
        }
    }

    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    }

    showWalletModal() {
        // Создаем модальное окно с информацией о кошельке
        const modal = document.createElement('div');
        modal.className = 'wallet-modal';
        modal.innerHTML = `
            <div class="wallet-modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="wallet-modal-content">
                <div class="wallet-modal-header">
                    <h3>TON Кошелек</h3>
                    <button onclick="this.closest('.wallet-modal').remove()">×</button>
                </div>
                <div class="wallet-modal-body">
                    <div class="wallet-address-full">
                        <label>Адрес:</label>
                        <span>${this.wallet.account.address}</span>
                        <button onclick="navigator.clipboard.writeText('${this.wallet.account.address}')">
                            Копировать
                        </button>
                    </div>
                    <div class="wallet-balance-full">
                        <label>Баланс:</label>
                        <span>${this.balance.toFixed(4)} TON</span>
                    </div>
                </div>
                <div class="wallet-modal-footer">
                    <button class="disconnect-btn" onclick="tonWallet.disconnectWallet(); this.closest('.wallet-modal').remove();">
                        Отключить кошелек
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showNotification(message, type) {
        // Используем существующую систему уведомлений
        if (window.showNotification) {
            window.showNotification(message, type);
        }
    }
}

// Инициализируем кошелек
const tonWallet = new TonWallet();

// Экспортируем для использования в других файлах
window.tonWallet = tonWallet;