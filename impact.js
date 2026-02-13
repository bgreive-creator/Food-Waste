// Food Waste App - Impact Tracker
window.renderImpact = function (container, inventory) {
    const history = window.appState.history || [];

    // Calculate Real Stats
    const usedItems = history.filter(h => h.type === 'used');
    const wastedItems = history.filter(h => h.type === 'wasted');

    // Financial calculations (Average $5 per item)
    const moneySaved = usedItems.length * 5;
    const moneyWasted = wastedItems.length * 5;

    // Environmental calculations (Average 1.5kg CO2 per item)
    const co2Reduced = (usedItems.length * 1.5).toFixed(1);

    // Total processed items
    const totalProcessed = history.length;
    const usedPercentage = totalProcessed > 0 ? Math.round((usedItems.length / totalProcessed) * 100) : 0;

    if (totalProcessed === 0) {
        container.innerHTML = `
            <div class="coming-soon">
                <div style="font-size: 3rem">📊</div>
                <h2>Your dashboard is ready!</h2>
                <p>Start using or removing items in your fridge to see your real-world impact here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="impact-view">
            <div class="impact-header">
                <h3>Real-Time Impact Dashboard</h3>
                <p>Data-driven insights based on your pantry and fridge habits.</p>
            </div>

            <div class="impact-stats">
                <div class="impact-card">
                    <div class="impact-icon">💰</div>
                    <div class="impact-info">
                        <span class="impact-label">Money Saved</span>
                        <span class="impact-value">$${moneySaved.toFixed(2)}</span>
                        <span class="impact-sub">Prevented $${moneyWasted.toFixed(2)} in waste</span>
                    </div>
                </div>
                <div class="impact-card">
                    <div class="impact-icon">🌡️</div>
                    <div class="impact-info">
                        <span class="impact-label">CO2 Prevented</span>
                        <span class="impact-value">${co2Reduced} kg</span>
                        <span class="impact-sub">Carbon footprint reduced</span>
                    </div>
                </div>
                <div class="impact-card">
                    <div class="impact-icon">🍽️</div>
                    <div class="impact-info">
                        <span class="impact-label">Usage Efficiency</span>
                        <span class="impact-value">${usedPercentage}%</span>
                        <div class="efficiency-bar">
                            <div class="efficiency-fill" style="width: ${usedPercentage}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="waste-log-section">
                <h4>Recent Activity History</h4>
                <div class="log-table">
                    <div class="log-header">
                        <span>Date</span>
                        <span>Item</span>
                        <span>Outcome</span>
                    </div>
                    ${history.slice().reverse().slice(0, 10).map(item => `
                        <div class="log-row">
                            <span>${new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            <span>${item.name}</span>
                            <span class="${item.type === 'used' ? 'status-used' : 'status-wasted'}">
                                ${item.type === 'used' ? '✅ Used' : '🗑️ Wasted'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}
