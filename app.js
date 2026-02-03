// Food Waste App - Main Logic (Global Scope for file:/// compatibility)

// State Management
window.appState = {
    currentPage: 'fridge',
    inventory: JSON.parse(localStorage.getItem('ecofridge_inventory')) || [
        { id: 1, name: 'Milk', category: 'Dairy', expiry: '2026-02-05', quantity: '1L', shared: false },
        { id: 2, name: 'Spinach', category: 'Vegetables', expiry: '2026-02-03', quantity: '1 bag', shared: false },
        { id: 3, name: 'Chicken', category: 'Meat', expiry: '2026-02-08', quantity: '500g', shared: false }
    ]
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

    switch (window.appState.currentPage) {
        case 'fridge':
            if (window.renderFridge) window.renderFridge(container, window.appState.inventory);
            break;
        case 'impact':
            if (window.renderImpact) window.renderImpact(container, window.appState.inventory);
            break;
    }
}

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
