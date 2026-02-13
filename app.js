// Food Waste App - Main Logic (Global Scope for file:/// compatibility)

// State Management
window.appState = {
    currentPage: 'fridge',
    inventory: JSON.parse(localStorage.getItem('ecofridge_inventory')) || [
        { id: 1, name: 'Milk', category: 'Dairy', expiry: '2026-02-15', quantity: '1L', shared: false },
        { id: 2, name: 'Spinach', category: 'Vegetables', expiry: '2026-02-12', quantity: '1 bag', shared: false },
        { id: 3, name: 'Chicken', category: 'Meat', expiry: '2026-02-08', quantity: '500g', shared: false }
    ],
    history: JSON.parse(localStorage.getItem('ecofridge_history')) || []
};

// Global UI Elements
let modal, closeBtn;

// Navigation Handling
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const page = link.getAttribute('data-page');
            window.appState.currentPage = page;

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const titles = {
                fridge: 'My Fridge',
                recipes: 'Quick Recipes',
                impact: 'Your Impact'
            };
            pageTitle.innerText = titles[page];
            window.renderPage();
        });
    });
}

// Page Rendering
window.renderPage = function () {
    const container = document.getElementById('app-view');
    if (!container) return;
    container.innerHTML = '';

    // Check for expiring items and update the global notification area
    checkExpiryNotifications();

    switch (window.appState.currentPage) {
        case 'fridge':
            if (window.renderFridge) window.renderFridge(container, window.appState.inventory);
            break;
        case 'recipes':
            if (window.renderRecipes) window.renderRecipes(container, window.appState.inventory);
            break;
        case 'impact':
            if (window.renderImpact) window.renderImpact(container, window.appState.inventory);
            break;
    }
}

function checkExpiryNotifications() {
    const area = document.getElementById('notification-area');
    if (!area) return;

    // Specifically remove existing expiry notifications, but preserve success banners
    const existingExpiry = area.querySelectorAll('.expiry-notification');
    existingExpiry.forEach(el => el.remove());

    const today = new Date();
    const fortyEightHours = new Date();
    fortyEightHours.setHours(today.getHours() + 48);

    // Find items expiring within 48 hours
    const urgentItems = window.appState.inventory.filter(item => {
        const expiry = new Date(item.expiry);
        return expiry > today && expiry <= fortyEightHours;
    });

    if (urgentItems.length === 0) return;

    // Show only the most urgent item for focus
    const item = urgentItems[0];

    // Calculate days/hours left for display
    const diffMs = new Date(item.expiry) - today;
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const timeLabel = diffHours <= 24 ? "within 24 hours" : "within 48 hours";

    const banner = document.createElement('div');
    banner.className = 'expiry-notification';
    banner.innerHTML = `
        <div class="notif-content">
            <div class="notif-icon">⏰</div>
            <div class="notif-text">
                <h4>Expiring Soon: ${item.name}</h4>
                <p>Use it ${timeLabel} to prevent waste!</p>
            </div>
        </div>
        <div class="notif-actions">
            <button class="btn-notif-action btn-recipe" onclick="window.findRecipesForItem('${item.name}')">Find Recipes</button>
            <button class="btn-notif-action btn-use" onclick="window.useItemFromNotification(${item.id})">I've Used It</button>
        </div>
    `;
    area.appendChild(banner);
}

// Global Notification Handlers
window.useItemFromNotification = function (id) {
    const itemIndex = window.appState.inventory.findIndex(i => i.id === id);
    if (itemIndex > -1) {
        const item = window.appState.inventory[itemIndex];

        // Record to history
        window.appState.history.push({
            ...item,
            type: 'used',
            date: new Date().toISOString()
        });

        window.lastRemovedItem = { ...item };

        // Remove from inventory
        window.appState.inventory.splice(itemIndex, 1);

        // Save and re-render
        localStorage.setItem('ecofridge_inventory', JSON.stringify(window.appState.inventory));
        localStorage.setItem('ecofridge_history', JSON.stringify(window.appState.history));

        // Refresh page
        window.renderPage();

        // Show celebratory banner
        window.showSuccessBanner("You're a food waste warrior! 🌿");

        // Show success snackbar if showSnackbar exists (it's in fridge.js)
        if (window.showSnackbar) {
            window.showSnackbar(`"${item.name}" marked as used.`);
        }
    }
};

window.showSuccessBanner = function (message) {
    const area = document.getElementById('notification-area');
    if (!area) return;

    const banner = document.createElement('div');
    banner.className = 'success-banner';
    banner.innerHTML = `<span>🎉</span> ${message}`;

    // Add to top of area
    area.prepend(banner);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        banner.classList.add('fade-out');
        setTimeout(() => banner.remove(), 800);
    }, 4000);
};

window.findRecipesForItem = function (name) {
    // Navigate to recipes page
    window.appState.currentPage = 'recipes';
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('data-page') === 'recipes') l.classList.add('active');
    });

    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.innerText = 'Quick Recipes';

    window.renderPage();

    // Provide a small hint on how to find the item in recipes
    // Actually, recipes currently shows matches >= 50%. 
    // If the item name is specific, it might not find a recipe unless we filter.
    // For now, navigating is the primary action.
};

// Modal Logic
window.openModal = function (title, content) {
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    if (!modalTitle || !modalBody || !modal) return;

    modalTitle.innerText = title;
    modalBody.innerHTML = content;
    modal.classList.remove('hidden');
}

window.closeModal = function () {
    if (modal) modal.classList.add('hidden');
}

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('modal-container');
    closeBtn = document.querySelector('.close-modal');

    if (closeBtn) {
        closeBtn.onclick = window.closeModal;
    }
    window.onclick = (e) => {
        if (e.target === modal) window.closeModal();
    };

    initNavigation();
    if (window.initFridge) window.initFridge(window.appState);
    window.renderPage();
});
