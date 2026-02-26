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

    document.getElementById('opt-receipt').addEventListener('click', startReceiptScan);
    document.getElementById('opt-manual').addEventListener('click', showManualForm);
}


function startReceiptScan() {
    window.openModal('Scan Receipt', `
        <div class="ai-scan-container">
            <div class="receipt-preview">
                <video id="receipt-video" autoplay playsinline muted></video>
                <div class="scanner-line"></div>
                <button id="capture-receipt-btn" class="capture-btn" title="Capture Receipt"></button>
            </div>
            <div id="receipt-status" class="ai-feedback">
                <p>Align receipt and tap to scan...</p>
            </div>
        </div>
    `);

    const video = document.getElementById('receipt-video');
    // Give the DOM a moment to settle
    setTimeout(() => {
        if (video) startCamera(video);
    }, 100);

    document.getElementById('capture-receipt-btn').addEventListener('click', () => {
        const status = document.getElementById('receipt-status');
        status.innerHTML = `
            <p>AI is scanning for food items...</p>
            <div class="progress-bar"><div class="progress-fill animate-scan"></div></div>
        `;
        document.getElementById('capture-receipt-btn').style.display = 'none';

        // Simulate AI extraction and filtering
        setTimeout(() => {
            const rawExtractedItems = [
                { name: '2% Milk', quantity: '1 Gal' },
                { name: 'Paper Towels', quantity: '2 pack' }, // Non-food
                { name: 'Bananas', quantity: '1 bunch' },
                { name: 'Chicken Breast', quantity: '1.2 lbs' },
                { name: 'Dish Soap', quantity: '24 oz' }, // Non-food
                { name: 'Cheddar Cheese', quantity: '8 oz' },
                { name: 'Batteries AA', quantity: '4 pack' } // Non-food
            ];

            // Filter for food items only using our database
            const foodItems = rawExtractedItems.filter(item => {
                const searchName = item.name.toLowerCase();
                return window.FOOD_DATABASE.some(dbItem =>
                    searchName.includes(dbItem.name.toLowerCase()) ||
                    dbItem.name.toLowerCase().includes(searchName)
                );
            }).map((item, index) => {
                // Find match in DB for expiry estimation
                const dbMatch = window.FOOD_DATABASE.find(dbItem =>
                    item.name.toLowerCase().includes(dbItem.name.toLowerCase()) ||
                    dbItem.name.toLowerCase().includes(item.name.toLowerCase())
                ) || { category: 'Other', shelfLife: 7 };

                const expiry = new Date();
                expiry.setDate(expiry.getDate() + dbMatch.shelfLife);

                return {
                    id: Date.now() + index,
                    name: item.name,
                    category: dbMatch.category,
                    quantity: item.quantity,
                    expiry: expiry.toISOString().split('T')[0]
                };
            });

            showReceiptPreview(foodItems);
        }, 3000);
    });
}

function showReceiptPreview(items) {
    window.receiptPreviewItems = items; // Store globally for editing

    const renderPreviewList = () => {
        if (window.receiptPreviewItems.length === 0) {
            return `<div class="receipt-scan-status">No food items were identified on this receipt.</div>`;
        }

        return `
            <div class="receipt-summary">
                <span class="total-info">Identified ${window.receiptPreviewItems.length} food items</span>
                <span class="text-muted">Non-food items were ignored.</span>
            </div>
            <table class="receipt-preview-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Expiry</th>
                        <th>Qty</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    ${window.receiptPreviewItems.map((item, index) => `
                        <tr>
                            <td><input type="text" value="${item.name}" onchange="updatePreviewItem(${index}, 'name', this.value)"></td>
                            <td>
                                <select onchange="updatePreviewItem(${index}, 'category', this.value)">
                                    ${['Dairy', 'Vegetables', 'Meat', 'Fruit', 'Bakery', 'Pantry', 'Grains', 'Other'].map(cat =>
            `<option value="${cat}" ${item.category === cat ? 'selected' : ''}>${cat}</option>`
        ).join('')}
                                </select>
                            </td>
                            <td><input type="date" value="${item.expiry}" onchange="updatePreviewItem(${index}, 'expiry', this.value)"></td>
                            <td><input type="text" value="${item.quantity}" onchange="updatePreviewItem(${index}, 'quantity', this.value)"></td>
                            <td><button class="btn-remove-item" onclick="removePreviewItem(${index})">✕</button></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    };

    const previewHTML = `
        <div class="receipt-preview-container">
            <div id="preview-list-container">
                ${renderPreviewList()}
            </div>
            <div class="preview-actions">
                <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
                <button class="btn-primary" id="finalize-receipt-btn" ${items.length === 0 ? 'disabled' : ''}>Add to Fridge</button>
            </div>
        </div>
    `;

    window.openModal('Review Items', previewHTML);

    // Context-sensitive window functions for the preview
    window.updatePreviewItem = (index, field, value) => {
        window.receiptPreviewItems[index][field] = value;
    };

    window.removePreviewItem = (index) => {
        window.receiptPreviewItems.splice(index, 1);
        const container = document.getElementById('preview-list-container');
        if (container) container.innerHTML = renderPreviewList();
        if (window.receiptPreviewItems.length === 0) {
            document.getElementById('finalize-receipt-btn').disabled = true;
        }
    };

    document.getElementById('finalize-receipt-btn').addEventListener('click', () => {
        window.receiptPreviewItems.forEach(item => {
            item.shared = false;
            window.appState.inventory.push(item);
        });
        saveAndRefresh();
        window.closeModal();
        if (window.showSuccessBanner) {
            window.showSuccessBanner(`Added ${window.receiptPreviewItems.length} items from receipt!`);
        }
    });
}

function showManualForm(prefill = null, message = 'Enter item details') {
    const categories = ['Dairy', 'Vegetables', 'Meat', 'Fruit', 'Bakery', 'Pantry', 'Grains', 'Canned Goods', 'Other'];
    const formHTML = `
        <form id="add-food-form" class="food-form">
            ${prefill ? `<p class="ai-suggestion-msg">${message}</p>` : ''}
            <div id="estimate-error" class="ai-suggestion-msg hidden" style="background:#FFEBEE; color:#C62828; margin-bottom: 12px;"></div>
            <div class="form-group">
                <label>Item Name</label>
                <input type="text" id="food-name" value="${prefill?.name || ''}" placeholder="e.g. Basmati Rice" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Category</label>
                    <select id="food-category">
                        <option value="">Select Category</option>
                        ${categories.map(c =>
        `<option ${prefill?.category === c ? 'selected' : ''} value="${c}">${c}</option>`
    ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Expiry Date</label>
                    <input type="date" id="food-expiry" value="${prefill?.expiry || ''}" required>
                    <button type="button" id="estimate-expiry-btn" class="btn-secondary" style="margin-top: 8px;">
                        <span id="btn-text">Estimate Expiration Date</span>
                        <span id="btn-loader" class="hidden">Thinking...</span>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="text" id="food-quantity" value="${prefill?.quantity || ''}" placeholder="e.g. 5 lbs">
            </div>
            <button type="submit" class="btn-primary full-width">Add to Fridge</button>
        </form>
    `;

    window.openModal('Add Food Item', formHTML);

    const estimateBtn = document.getElementById('estimate-expiry-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const errorMsg = document.getElementById('estimate-error');

    estimateBtn.addEventListener('click', async () => {
        const name = document.getElementById('food-name').value.trim();
        const category = document.getElementById('food-category').value;

        if (!name || !category) {
            errorMsg.innerText = "Please input both Item Name and Category before estimating.";
            errorMsg.classList.remove('hidden');
            setTimeout(() => errorMsg.classList.add('hidden'), 3000);
            return;
        }

        // AI "Thinking" State
        estimateBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');

        // Simulate LLM Processing Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const estimatedDays = getEstimatedDays(name, category);
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + estimatedDays);
        document.getElementById('food-expiry').value = expiryDate.toISOString().split('T')[0];

        // Restore UI
        estimateBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    });

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

function getEstimatedDays(name, category) {
    const n = name.toLowerCase();

    // Comprehensive "AI Knowledge Base" for common and pantry items
    const aiKnowledge = {
        // PANTRY & LONG-LIFE (Highest Priority)
        'honey': 3650, 'rice': 730, 'pasta': 730, 'spaghetti': 730, 'flour': 365,
        'sugar': 3650, 'salt': 3650, 'maple syrup': 365, 'vinegar': 730,
        'dry beans': 730, 'lentils': 730, 'quinoa': 365, 'oats': 365,
        'canned': 730, 'tin': 730, 'jar': 365, 'oil': 365, 'soy sauce': 730,
        'ketchup': 180, 'mustard': 365, 'peanut butter': 180, 'jam': 180,

        // MEATS & SEAFOOD (Accurate LLM-style windows)
        'ground beef': 2, 'ground turkey': 2, 'ground pork': 2, 'ground chicken': 2,
        'salmon': 2, 'tuna': 2, 'fish': 2, 'shrimp': 2, 'scallops': 2, 'lobster': 2,
        'chicken breast': 2, 'chicken thighs': 2, 'chicken wings': 2,
        'steak': 4, 'roast': 4, 'pork chop': 4, 'lamb': 4,
        'bacon': 7, 'hot dog': 7, 'sausage': 3, 'ham': 5, 'salami': 21,

        // PRODUCE - SHORT (3-5 days)
        'spinach': 4, 'lettuce': 4, 'arugula': 4, 'kale': 5, 'berries': 3,
        'strawberry': 3, 'raspberry': 2, 'blackberry': 3, 'blueberry': 7,
        'asparagus': 4, 'avocado': 3, 'mushrooms': 4, 'corn': 3,

        // PRODUCE - MID (7-14 days)
        'bell pepper': 7, 'cucumber': 7, 'broccoli': 7, 'cauliflower': 7,
        'zucchini': 5, 'squash': 14, 'tomato': 7, 'grapes': 7, 'melon': 7,
        'watermelon': 7, 'pineapple': 5, 'lemon': 21, 'lime': 21, 'orange': 21,

        // PRODUCE - LONG (21+ days)
        'apple': 30, 'carrot': 21, 'celery': 14, 'potato': 30, 'onion': 30,
        'garlic': 60, 'cabbage': 21, 'beet': 21, 'radish': 14,

        // DAIRY & REFRIGERATED
        'milk': 7, 'heavy cream': 10, 'yogurt': 14, 'greek yogurt': 14,
        'sour cream': 21, 'cottage cheese': 7, 'cream cheese': 14,
        'butter': 60, 'egg': 30, 'tofu': 5, 'hummus': 7,

        // CHEESES
        'cheddar': 30, 'parmesan': 60, 'provolone': 21, 'swiss': 21,
        'mozzarella': 7, 'brie': 7, 'feta': 14, 'ricotta': 7, 'goat cheese': 10,

        // BAKERY
        'bread': 5, 'bagel': 5, 'muffin': 3, 'tortilla': 14, 'pita': 7,
        'croissant': 2, 'donut': 2, 'pastry': 2, 'leftovers': 3
    };

    // 1. Phased AI Matching Logic
    // Step A: Specific Keyword Match
    for (const [item, days] of Object.entries(aiKnowledge)) {
        if (n.includes(item)) return days;
    }

    // Step B: Broad Group Logic
    if (n.includes('meat') || n.includes('poultry')) return 3;
    if (n.includes('fruit') || n.includes('veggie')) return 7;
    if (n.includes('grain') || n.includes('cereal')) return 180;

    // 2. Optimized Category Logic (Safe Fallbacks)
    const categoryDefaults = {
        'Dairy': 7,
        'Vegetables': 7,
        'Meat': 2,
        'Fruit': 5,
        'Bakery': 4,
        'Pantry': 365,
        'Grains': 365,
        'Canned Goods': 365,
        'Other': 14
    };

    return categoryDefaults[category] || 7;
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
    const icons = {
        'Dairy': '🥛',
        'Vegetables': '🥦',
        'Meat': '🥩',
        'Fruit': '🍎',
        'Bakery': '🍞',
        'Pantry': '🥫',
        'Grains': '🌾',
        'Canned Goods': '🥫',
        'Other': '📦'
    };
    return icons[cat] || icons['Other'];
}

function attachListListeners() {
    document.querySelectorAll('.use-btn').forEach(btn => btn.onclick = (e) => {
        const row = e.currentTarget.closest('.inventory-row');
        const id = Number(row.dataset.id);

        // Visual feedback
        row.classList.add('item-fading');

        setTimeout(() => {
            const item = window.appState.inventory.find(i => Number(i.id) === id);

            if (!item) return; // Guard against rapid clicks or race conditions

            // Record to history
            window.appState.history.push({
                ...item,
                type: 'used',
                date: new Date().toISOString()
            });

            window.lastRemovedItem = { ...item };
            window.appState.inventory = window.appState.inventory.filter(i => i.id !== id);

            saveAndRefresh();

            // Show celebratory banner - now persists after re-render!
            if (window.showSuccessBanner) {
                window.showSuccessBanner("You're a food waste warrior! 🌿");
            }

            showSnackbar(`"${item.name}" marked as used.`);
        }, 600);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => btn.onclick = (e) => {
        const id = Number(e.currentTarget.closest('.inventory-row').dataset.id);
        const item = window.appState.inventory.find(i => Number(i.id) === id);

        if (!item) return;

        // Record as waste
        window.appState.history.push({
            ...item,
            type: 'wasted',
            date: new Date().toISOString()
        });

        window.appState.inventory = window.appState.inventory.filter(i => Number(i.id) !== id);
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
    localStorage.setItem('ecofridge_history', JSON.stringify(window.appState.history));
    window.renderPage();
}

function startCamera(videoElement) {
    const status = document.getElementById('receipt-status');

    // Check for Secure Context (required for camera in most browsers)
    if (window.location.protocol === 'file:' || !window.isSecureContext) {
        console.warn("Camera access usually requires HTTPS or localhost.");
        if (status) {
            status.innerHTML = `
                <p style="color:var(--danger)"><strong>Security Restriction:</strong> Camera access often requires an HTTPS connection or localhost.</p>
                <p style="font-size:0.8rem; margin-top:5px;">If you are running this locally from a file, try using a local server (like "Live Server" in VS Code) or check browser permissions.</p>
            `;
        }
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera API not supported");
        if (status && !status.innerHTML.includes('Security Restriction')) {
            status.innerHTML = `<p style="color:var(--danger)">Your browser does not support camera access.</p>`;
        }
        return;
    }

    const constraints = {
        video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            videoElement.srcObject = stream;
            videoElement.play().catch(e => console.error("Auto-play failed:", e));
            // Store stream for stopping later
            window.activeVideoStream = stream;
            if (status) status.innerHTML = `<p>Camera active. Align receipt and scan.</p>`;
        })
        .catch(err => {
            console.error("Error accessing camera:", err);
            if (status) {
                status.innerHTML = `
                    <p style="color:var(--danger)">Unable to access camera: ${err.name}</p>
                    <p style="font-size:0.8rem">Check that you've granted camera permissions and no other app is using it.</p>
                `;
            }
        });
}

// Clean up camera when modal closes
const originalCloseModal = window.closeModal;
window.closeModal = function () {
    if (window.activeVideoStream) {
        window.activeVideoStream.getTracks().forEach(track => track.stop());
        window.activeVideoStream = null;
    }
    originalCloseModal();
};
