// Food Waste App - Impact Tracker
window.renderImpact = function (container, inventory) {
    // Mock impact data
    const impactData = {
        savedMoney: 124.50,
        co2Reduced: 15.2,
        mealsSaved: 42
    };

    container.innerHTML = `
        <div class="impact-view">
            <div class="impact-header">
                <h3>Your Environmental Impact</h3>
                <p>Track how your waste reduction efforts are helping the planet.</p>
            </div>

            <div class="impact-stats">
                <div class="impact-card">
                    <div class="impact-icon">💰</div>
                    <div class="impact-info">
                        <span class="impact-label">Money Saved</span>
                        <span class="impact-value">$${impactData.savedMoney.toFixed(2)}</span>
                    </div>
                </div>
                <div class="impact-card">
                    <div class="impact-icon">🌡️</div>
                    <div class="impact-info">
                        <span class="impact-label">CO2 Reduced</span>
                        <span class="impact-value">${impactData.co2Reduced} kg</span>
                    </div>
                </div>
                <div class="impact-card">
                    <div class="impact-icon">🍽️</div>
                    <div class="impact-info">
                        <span class="impact-label">Meals Saved</span>
                        <span class="impact-value">${impactData.mealsSaved}</span>
                    </div>
                </div>
            </div>

            <div class="waste-log-section">
                <h4>Waste Log</h4>
                <div class="log-table">
                    <div class="log-header">
                        <span>Date</span>
                        <span>Item</span>
                        <span>Reason</span>
                    </div>
                    <div class="log-row">
                        <span>Jan 28</span>
                        <span>Bread</span>
                        <span>Molded</span>
                    </div>
                    <div class="log-row">
                        <span>Jan 25</span>
                        <span>Lettuce</span>
                        <span>Slimy</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}
