// Fridge Tracker Component
window.initFridge = function (state) {
    this.appState = state;
    this.lastRemovedItem = null;
    this.undoTimeout = null;

    const addBtn = document.getElementById('add-item-btn');
    if (addBtn) {
        addBtn.replaceWith(addBtn.cloneNode(true));
        document.getElementById('add-item-btn').addEventListener('click', showAddSelectionModal);
    }

    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) {
        undoBtn.onclick = () => {
            if (this.lastRemovedItem) {
                window.appState.inventory.push(this.lastRemovedItem);
                this.lastRemovedItem = null;
                document.getElementById('snackbar').classList.remove('show');
                saveAndRefresh();
            }
        };
    }
}

window.renderFridge = function (container, inventory) {
    const sorted = [...inventory].sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    container.innerHTML = `
        <div class="fridge-grid">
            <div class="stats-cards">
                <div class="stat-card urgent">
                    <span class="stat-value">${getUrgentCount(inventory)}</span>
                    <span class="stat-label">Expiring Soon</span>
                </div>
                <div class="stat-card total">
                    <span class="stat-value">${inventory.length}</span>
                    <span class="stat-label">Total Items</span>
                </div>
            </div>
            <div class="inventory-list">
                <div class="list-header">
                    <span>Item</span>
                    <span>Category</span>
                    <span>Expiry</span>
                    <span>Action</span>
                </div>
                ${sorted.map(item => renderItemRow(item)).join('')}
            </div>
        </div>
    `;
    attachListListeners();
}

function showAddSelectionModal() {
    const selectionHTML = `
        <div class="entry-options">
            <div class="entry-option-card" id="opt-camera">
                <div class="option-icon">📸</div>
                <h3>AI Photo Scan</h3>
                <p>Take a picture of food items to automatically identify them.</p>
            </div>
            <div class="entry-option-card" id="opt-receipt">
                <div class="option-icon">🧾</div>
                <h3>Scan Receipt</h3>
                <p>Upload a shopping receipt to add multiple items at once.</p>
            </div>
            <div class="entry-option-card" id="opt-manual">
                <div class="option-icon">✍️</div>
                <h3>Manual Entry</h3>
                <p>Type in the item details yourself.</p>
            </div>
        </div>
    `;

    window.openModal('How would you like to add items?', selectionHTML);

    document.getElementById('opt-camera').addEventListener('click', startAIScan);
    document.getElementById('opt-receipt').addEventListener('click', startReceiptScan);
    document.getElementById('opt-manual').addEventListener('click', showManualForm);
}

function startAIScan() {
    window.openModal('AI Photo Scan', `
        <div class="ai-scan-container">
            <div class="camera-preview">
                <div class="scanner-line"></div>
                <span>Looking for food...</span>
            </div>
            <div class="ai-feedback">
                <p>Analyzing image with EcoA-AI...</p>
                <div class="progress-bar"><div class="progress-fill animate-scan"></div></div>
            </div>
        </div>
    `);

    setTimeout(() => {
        const detectedItem = {
            name: 'Avocado',
            category: 'Fruit',
            expiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            quantity: '3 count'
        };
        showManualForm(detectedItem, 'AI thinks it found:');
    }, 2500);
}

function startReceiptScan() {
    window.openModal('Scanning Receipt', `
        <div class="ai-scan-container">
            <div class="receipt-preview">
                <div class="receipt-text-line">SCANNING TOTAL...</div>
                <div class="receipt-text-line">DETECTING ITEMS...</div>
            </div>
            <div class="ai-feedback">
                <p>Extracting data from receipt...</p>
                <div class="progress-bar"><div class="progress-fill animate-scan"></div></div>
            </div>
        </div>
    `);

    setTimeout(() => {
        const items = [
            { name: 'Organic Milk', category: 'Dairy', quantity: '1 Gal' },
            { name: 'Red Apples', category: 'Fruit', quantity: '5 pack' },
            { name: 'Sourdough', category: 'Bakery', quantity: '1 loaf' }
        ];

        items.forEach(item => {
            item.id = Date.now() + Math.random();
            item.expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            item.shared = false;
            window.appState.inventory.push(item);
        });

        saveAndRefresh();
        window.openModal('Success!', `<p>Successfully added ${items.length} items from your receipt!</p><button class="btn-primary full-width" onclick="window.closeModal()">Awesome</button>`);
    }, 3000);
}

function showManualForm(prefill = null, message = 'Enter item details') {
    const formHTML = `
        <form id="add-food-form" class="food-form">
            ${prefill ? `<p class="ai-suggestion-msg">${message}</p>` : ''}
            <div class="form-group">
                <label>Item Name</label>
                <input type="text" id="food-name" value="${prefill?.name || ''}" placeholder="e.g. Greek Yogurt" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Category</label>
                    <select id="food-category">
                        ${['Dairy', 'Vegetables', 'Meat', 'Fruit', 'Bakery', 'Other'].map(c =>
        `<option ${prefill?.category === c ? 'selected' : ''}>${c}</option>`
    ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Expiry Date</label>
                    <input type="date" id="food-expiry" value="${prefill?.expiry || ''}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="text" id="food-quantity" value="${prefill?.quantity || ''}" placeholder="e.g. 2 cups">
            </div>
            <button type="submit" class="btn-primary full-width">Add to Fridge</button>
        </form>
    `;

    window.openModal(prefill ? 'Verify AI Detection' : 'Add Food Item', formHTML);

    document.getElementById('add-food-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newItem = {
            id: Date.now(),
            name: document.getElementById('food-name').value,
            category: document.getElementById('food-category').value,
            expiry: document.getElementById('food-expiry').value,
            quantity: document.getElementById('food-quantity').value || '1 unit',
            shared: false
        };

        window.appState.inventory.push(newItem);
        saveAndRefresh();
        window.closeModal();
    });
}

function getUrgentCount(inventory) {
    const today = new Date();
    const threeDays = new Date();
    threeDays.setDate(today.getDate() + 3);
    return inventory.filter(item => new Date(item.expiry) <= threeDays).length;
}

function renderItemRow(item) {
    const diff = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
    const statusClass = diff <= 1 ? 'status-danger' : (diff <= 3 ? 'status-warning' : '');
    return `
        <div class="inventory-row" data-id="${item.id}">
            <div class="item-name">
                <span class="category-icon">${getCategoryIcon(item.category)}</span>
                <div><strong>${item.name}</strong><div class="quantity">${item.quantity}</div></div>
            </div>
            <div class="item-category">${item.category}</div>
            <div class="item-expiry ${statusClass}">
                ${item.expiry}
                <span class="days-left">${diff < 0 ? 'Expired' : (diff === 0 ? 'Today' : diff + ' days left')}</span>
            </div>
            <div class="item-actions">
                <div class="tooltip-container">
                    <button class="btn-icon use-btn">✅</button>
                    <span class="tooltip-text">Mark as used</span>
                </div>
                <div class="tooltip-container">
                    <button class="btn-icon delete-btn">🗑️</button>
                    <span class="tooltip-text">Remove item</span>
                </div>
            </div>
        </div>
    `;
}

function getCategoryIcon(cat) {
    const icons = { 'Dairy': '🥛', 'Vegetables': '🥦', 'Meat': '🥩', 'Fruit': '🍎', 'Bakery': '🍞', 'Other': '📦' };
    return icons[cat] || icons['Other'];
}

function attachListListeners() {
    document.querySelectorAll('.use-btn').forEach(btn => btn.onclick = (e) => {
        const row = e.target.closest('.inventory-row');
        const id = parseInt(row.dataset.id);

        // Visual feedback
        row.classList.add('item-fading');

        setTimeout(() => {
            const item = window.appState.inventory.find(i => i.id === id);
            window.lastRemovedItem = { ...item };
            window.appState.inventory = window.appState.inventory.filter(i => i.id !== id);

            showSnackbar(`"${item.name}" marked as used.`);
            saveAndRefresh();
        }, 600);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = (e) => {
        const id = parseInt(e.target.closest('.inventory-row').dataset.id);
        window.appState.inventory = window.appState.inventory.filter(i => i.id !== id);
        saveAndRefresh();
    });

}

function showSnackbar(msg) {
    const snack = document.getElementById('snackbar');
    const snackMsg = document.getElementById('snackbar-msg');
    if (!snack || !snackMsg) return;

    snackMsg.innerText = msg;
    snack.classList.add('show');

    if (window.undoTimeout) clearTimeout(window.undoTimeout);
    window.undoTimeout = setTimeout(() => {
        snack.classList.remove('show');
        window.lastRemovedItem = null;
    }, 5000);
}

function saveAndRefresh() {
    localStorage.setItem('ecofridge_inventory', JSON.stringify(window.appState.inventory));
    window.renderPage();
}
