// Global state
let currentTab = 'all';
let selectedItems = new Set();

// Initialize page
function initPage() {
    initTelegramApp();
    updateBalance();
    filterInventory();
    initTabSwipe();
}

// Tab switching
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter inventory
    filterInventory();
}

// Filter inventory based on current tab
function filterInventory() {
    const items = document.querySelectorAll('.inventory-item');
    
    items.forEach(item => {
        let show = false;
        
        switch(currentTab) {
            case 'all':
                show = true;
                break;
            case 'sellable':
                // Show all items that can be sold (most items)
                show = !item.classList.contains('mythic');
                break;
            case 'rare':
                // Show rare, epic, legendary, mythic
                show = item.classList.contains('rare') || 
                        item.classList.contains('epic') || 
                        item.classList.contains('legendary') || 
                        item.classList.contains('mythic');
                break;
            case 'common':
                // Show common items
                show = item.classList.contains('common');
                break;
            case 'mythic':
                // Show mythic items
                show = item.classList.contains('mythic');
                break;
            case 'legendary':
                // Show legendary items
                show = item.classList.contains('legendary');
                break;
        }
        
        item.style.display = show ? 'block' : 'none';
    });
}

// Select/deselect item
function selectItem(item) {
    const itemId = Array.from(item.parentNode.children).indexOf(item);
    
    if (selectedItems.has(itemId)) {
        selectedItems.delete(itemId);
        item.classList.remove('selected');
    } else {
        selectedItems.add(itemId);
        item.classList.add('selected');
    }
    
    // Add selection visual feedback
    item.style.transform = selectedItems.has(itemId) ? 'scale(0.95)' : 'scale(1)';
    
    // Haptic feedback
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Add swipe functionality for tabs
function initTabSwipe() {
    const tabsContainer = document.getElementById('tabsContainer');
    let startX = 0;
    let scrollLeft = 0;
    let isDown = false;

    tabsContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - tabsContainer.offsetLeft;
        scrollLeft = tabsContainer.scrollLeft;
    });

    tabsContainer.addEventListener('mouseleave', () => {
        isDown = false;
    });

    tabsContainer.addEventListener('mouseup', () => {
        isDown = false;
    });

    tabsContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - tabsContainer.offsetLeft;
        const walk = (x - startX) * 2;
        tabsContainer.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile
    tabsContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - tabsContainer.offsetLeft;
        scrollLeft = tabsContainer.scrollLeft;
    });

    tabsContainer.addEventListener('touchmove', (e) => {
        const x = e.touches[0].pageX - tabsContainer.offsetLeft;
        const walk = (x - startX) * 2;
        tabsContainer.scrollLeft = scrollLeft - walk;
    });
}
function goBack() {
    document.body.style.opacity = '0.8';
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 200);
}

function updateBalance() {
    document.getElementById('balance').textContent = '1451';
}

function initTelegramApp() {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Set theme
        if (tg.themeParams.bg_color) {
            document.documentElement.style.setProperty('--bg-primary', tg.themeParams.bg_color);
        }
        
        // Handle back button
        tg.BackButton.show();
        tg.BackButton.onClick(goBack);
    }
}

// Add selection styles
const style = document.createElement('style');
style.textContent = `
    .inventory-item.selected {
        border-color: var(--accent-yellow) !important;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.4) !important;
        background: rgba(255, 215, 0, 0.1) !important;
    }
`;
document.head.appendChild(style);

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);