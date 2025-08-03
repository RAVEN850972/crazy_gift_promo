// Settings State
let settings = {
    sound: true,
    vibration: false,
    language: 'en',
    referralCode: 'CG' + Math.random().toString(36).substr(2, 8).toUpperCase()
};

// Initialize page
function initPage() {
    initTelegramApp();
    updateBalance();
    loadSettings();
    updateUI();
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
        settings = { ...settings, ...JSON.parse(savedSettings) };
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('gameSettings', JSON.stringify(settings));
}

// Update UI based on current settings
function updateUI() {
    // Update toggle switches
    const soundToggle = document.getElementById('soundToggle');
    const vibrationToggle = document.getElementById('vibrationToggle');
    
    if (settings.sound) {
        soundToggle.classList.add('active');
        soundToggle.parentElement.classList.add('active');
    } else {
        soundToggle.classList.remove('active');
        soundToggle.parentElement.classList.remove('active');
    }
    
    if (settings.vibration) {
        vibrationToggle.classList.add('active');
        vibrationToggle.parentElement.classList.add('active');
    } else {
        vibrationToggle.classList.remove('active');
        vibrationToggle.parentElement.classList.remove('active');
    }
}

// Toggle sound setting
function toggleSound() {
    settings.sound = !settings.sound;
    updateUI();
    saveSettings();
    
    // Play feedback sound if enabled
    if (settings.sound) {
        playSound('toggle');
    }
    
    showNotification(settings.sound ? 'Звук включен' : 'Звук выключен', 'info');
}

// Toggle vibration setting
function toggleVibration() {
    settings.vibration = !settings.vibration;
    updateUI();
    saveSettings();
    
    // Vibrate if enabled
    if (settings.vibration && navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    showNotification(settings.vibration ? 'Вибрация включена' : 'Вибрация выключена', 'info');
}

// Show promo code modal
function showPromoModal() {
    const modal = document.getElementById('promoModal');
    modal.classList.add('show');
    
    // Focus input after animation
    setTimeout(() => {
        const input = document.getElementById('promoInput');
        input.focus();
    }, 300);
}

// Close promo code modal
function closePromoModal() {
    const modal = document.getElementById('promoModal');
    modal.classList.remove('show');
    
    // Clear input
    document.getElementById('promoInput').value = '';
}

// Apply promo code
function applyPromoCode() {
    const promoInput = document.getElementById('promoInput');
    const promoCode = promoInput.value.trim().toUpperCase();
    
    if (!promoCode) {
        showNotification('Введите промокод', 'error');
        return;
    }
    
    // Simulate promo code validation
    const validPromoCodes = ['WELCOME100', 'BONUS50', 'GIFT25', 'START75'];
    
    if (validPromoCodes.includes(promoCode)) {
        // Simulate reward
        const rewards = {
            'WELCOME100': 100,
            'BONUS50': 50,
            'GIFT25': 25,
            'START75': 75
        };
        
        const reward = rewards[promoCode];
        
        // Add to balance
        let currentBalance = parseInt(document.getElementById('balance').textContent);
        currentBalance += reward;
        document.getElementById('balance').textContent = currentBalance;
        
        // Save used promo code
        let usedPromoCodes = JSON.parse(localStorage.getItem('usedPromoCodes') || '[]');
        usedPromoCodes.push(promoCode);
        localStorage.setItem('usedPromoCodes', JSON.stringify(usedPromoCodes));
        
        closePromoModal();
        showNotification(`Промокод активирован! Получено ${reward} звёзд`, 'success');
        
        // Vibrate if enabled
        if (settings.vibration && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    } else {
        showNotification('Недействительный промокод', 'error');
        promoInput.classList.add('error');
        setTimeout(() => promoInput.classList.remove('error'), 2000);
    }
}

// Show language modal
function showLanguageModal() {
    const modal = document.getElementById('languageModal');
    modal.classList.add('show');
}

// Close language modal
function closeLanguageModal() {
    const modal = document.getElementById('languageModal');
    modal.classList.remove('show');
}

// Select language
function selectLanguage(langCode) {
    settings.language = langCode;
    saveSettings();
    
    // Update UI
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('active');
    });
    
    event.target.closest('.language-option').classList.add('active');
    
    // Close modal after short delay
    setTimeout(() => {
        closeLanguageModal();
        showNotification('Язык изменен', 'info');
    }, 300);
}

// Invite friends
function inviteFriends() {
    const referralLink = `https://t.me/your_bot?start=${settings.referralCode}`;
    const message = `🎁 Присоединяйся к CrazyGift и получи бонусы!\n\nОткрывай кейсы, выигрывай подарки и получай реальные призы!\n\n${referralLink}`;
    
    if (window.Telegram?.WebApp) {
        // Use Telegram WebApp share functionality
        window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`);
    } else {
        // Fallback: copy to clipboard
        copyToClipboard(referralLink);
        showNotification('Ссылка скопирована в буфер обмена', 'success');
    }
    
    // Vibrate if enabled
    if (settings.vibration && navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Copy referral link
function copyReferralLink() {
    const referralLink = `https://t.me/your_bot?start=${settings.referralCode}`;
    copyToClipboard(referralLink);
    showNotification('Реферальная ссылка скопирована', 'success');
    
    // Visual feedback
    const copyBtn = event.target.closest('.copy-btn');
    copyBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        copyBtn.style.transform = 'scale(1)';
    }, 150);
}

// Copy to clipboard helper
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// Connect wallet
function connectWallet() {
    if (window.tonWallet) {
        window.tonWallet.connectWallet();
    } else {
        showNotification('TON Connect не загружен', 'error');
    }
}

// Play sound effect
function playSound(soundType) {
    if (!settings.sound) return;
    
    try {
        // Simple audio feedback using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different sounds for different actions
        switch(soundType) {
            case 'toggle':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                break;
            default:
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        }
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
        console.log('Audio not supported:', error);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1001;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        max-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'success' ? 'background: linear-gradient(135deg, #00ff87, #00cc6a);' : ''}
        ${type === 'info' ? 'background: linear-gradient(135deg, #3b82f6, #1d4ed8);' : ''}
        ${type === 'error' ? 'background: linear-gradient(135deg, #ef4444, #dc2626);' : ''}
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide notification
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Play sound
    playSound(type);
}

// Back navigation
function goBack() {
    document.body.style.opacity = '0.8';
    setTimeout(() => {
        window.location.href = 'profile.html';
    }, 200);
}

// Update balance display
function updateBalance() {
    document.getElementById('balance').textContent = '1451';
}

// Initialize Telegram WebApp
function initTelegramApp() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Set theme colors
        if (tg.themeParams.bg_color) {
            document.documentElement.style.setProperty('--bg-primary', tg.themeParams.bg_color);
        }
        
        // Handle back button
        tg.BackButton.show();
        tg.BackButton.onClick(goBack);
        
        // Handle main button if needed
        tg.MainButton.hide();
    }
}

// Handle keyboard events
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modals
        const promoModal = document.getElementById('promoModal');
        const languageModal = document.getElementById('languageModal');
        
        if (promoModal.classList.contains('show')) {
            closePromoModal();
        } else if (languageModal.classList.contains('show')) {
            closeLanguageModal();
        }
    } else if (e.key === 'Enter') {
        // Apply promo code if modal is open and input is focused
        const promoModal = document.getElementById('promoModal');
        if (promoModal.classList.contains('show')) {
            applyPromoCode();
        }
    }
});

// Handle modal backdrop clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        if (e.target.closest('#promoModal')) {
            closePromoModal();
        } else if (e.target.closest('#languageModal')) {
            closeLanguageModal();
        }
    }
});

// Add error styling for input
const style = document.createElement('style');
style.textContent = `
    .input-group input.error {
        border-color: #ef4444 !important;
        background: rgba(239, 68, 68, 0.1) !important;
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Handle touch feedback for buttons
document.addEventListener('touchstart', (e) => {
    if (e.target.closest('.invite-btn, .copy-btn, .wallet-btn, .modal-btn, .settings-item.clickable')) {
        e.target.closest('.invite-btn, .copy-btn, .wallet-btn, .modal-btn, .settings-item.clickable').style.transform = 'scale(0.98)';
    }
});

document.addEventListener('touchend', (e) => {
    if (e.target.closest('.invite-btn, .copy-btn, .wallet-btn, .modal-btn, .settings-item.clickable')) {
        setTimeout(() => {
            e.target.closest('.invite-btn, .copy-btn, .wallet-btn, .modal-btn, .settings-item.clickable').style.transform = 'scale(1)';
        }, 100);
    }
});

// Simulate referral data loading
function loadReferralData() {
    // In a real app, this would fetch from backend
    const referralData = {
        friendsInvited: 999,
        totalEarnings: 25680,
        pendingRewards: 1240
    };
    
    // Update UI with referral data
    const statValue = document.querySelector('.stat-value');
    if (statValue) {
        statValue.textContent = referralData.friendsInvited;
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initPage();
    loadReferralData();
    
    // Add subtle entrance animations
    setTimeout(() => {
        document.querySelectorAll('.settings-section').forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
});