// Food Waste App - In-App Recipe Suggestions

// Global function to show recipe details
window.showRecipeDetails = (recipe) => {
    const modalContent = `
        <div class="recipe-details">
            <div class="recipe-details-header">
                <div class="recipe-badge">${recipe.image}</div>
                <div>
                    <h3>${recipe.name}</h3>
                    <p>🕒 ${recipe.time} • 👨‍🍳 ${recipe.difficulty}</p>
                </div>
            </div>

            <div class="recipe-section">
                <h4>Ingredients (Measurements Included)</h4>
                <ul class="detail-list">
                    ${recipe.details.ingredients.map(detailIng => {
        const isMissing = recipe.processedIngredients.some(pi => !pi.available && detailIng.toLowerCase().includes(pi.name.toLowerCase()));
        return `<li class="${isMissing ? 'item-missing' : 'item-has'}">
                            ${detailIng}
                        </li>`;
    }).join('')}
                </ul>
            </div>

            <div class="recipe-section">
                <h4>Step-by-Step Instructions</h4>
                <ol class="detail-list">
                    ${recipe.details.steps.map((step, i) => `<li><strong>Step ${i + 1}:</strong> ${step}</li>`).join('')}
                </ol>
            </div>

            <div class="recipe-actions" style="margin-top: 24px;">
                <button class="btn-primary full-width" onclick="window.closeModal()">Close Instructions</button>
            </div>
        </div>
    `;
    window.openModal('Recipe Instructions', modalContent);
};

window.renderRecipes = function (container, inventory) {
    // 1. Define Comprehensive Recipe Database
    const recipes = [
        {
            name: 'Creamy Chicken & Spinach Pasta',
            time: '25-30 min',
            difficulty: 'Medium',
            image: '🍝',
            ingredients: ['Chicken', 'Spinach', 'Dairy', 'Grains'],
            details: {
                ingredients: [
                    '1 lb (450g) Chicken Breast, cubed into 1-inch pieces',
                    '8 oz (225g) Penne or Fusilli Pasta',
                    '2 cups Fresh Baby Spinach, packed',
                    '1/2 cup Heavy Cream',
                    '1/2 cup Grated Parmesan Cheese',
                    '2 tbsp Butter',
                    '2 cloves Garlic, minced',
                    '1/2 tsp Salt',
                    '1/4 tsp Black Pepper'
                ],
                steps: [
                    'Boil a large pot of salted water. Add pasta and cook for 8-10 minutes until al dente.',
                    'While pasta cooks, melt 2 tbsp butter in a large skillet over medium-high heat.',
                    'Add chicken cubes, salt, and pepper. Sauté for 6-8 minutes until golden brown and cooked through to 165°F (74°C).',
                    'Reduce heat to medium. Add minced garlic and cook for 1 minute until fragrant.',
                    'Stir in 1/2 cup heavy cream and 1/2 cup Parmesan cheese. Simmer for 3 minutes until sauce thickens.',
                    'Add baby spinach and toss for 1-2 minutes until just wilted.',
                    'Drain pasta and add to the skillet. Toss to coat everything in the creamy sauce and serve immediately.'
                ]
            }
        },
        {
            name: 'Classic Vegetable Fried Rice',
            time: '15-20 min',
            difficulty: 'Easy',
            image: '🍚',
            ingredients: ['Grains', 'Vegetables', 'Eggs', 'Pantry'],
            details: {
                ingredients: [
                    '2 cups Cooked White or Brown Rice (preferably chilled over night)',
                    '2 large Eggs, lightly beaten',
                    '1 cup Frozen Mixed Vegetables (Peas, Carrots, Corn)',
                    '2 tbsp Soy Sauce',
                    '1 tbsp Sesame Oil or Vegetable Oil',
                    '1 clove Garlic, minced',
                    '1/2 tsp Ginger, minced (optional)',
                    '2 Green Onions, sliced'
                ],
                steps: [
                    'Heat 1 tbsp oil in a large wok or non-stick skillet over high heat.',
                    'Pour in the beaten eggs and scramble quickly for 30-45 seconds until set but still soft. Remove and set aside.',
                    'Add the mixed vegetables, garlic, and ginger to the same pan. Stir-fry for 2-3 minutes until heated through.',
                    'Add the cooked rice. Use a spatula to press down and break up any clumps. Cook for 3-4 minutes until the rice is hot and starting to crisp.',
                    'Pour 2 tbsp soy sauce over the rice and toss well to combine.',
                    'Fold in the scrambled eggs and sliced green onions. Cook for 1 more minute and serve hot.'
                ]
            }
        },
        {
            name: 'Spinach & Cheese Soufflé Omelet',
            time: '15 min',
            difficulty: 'Medium',
            image: '🍳',
            ingredients: ['Eggs', 'Spinach', 'Dairy', 'Cheese'],
            details: {
                ingredients: [
                    '3 large Eggs, whites and yolks separated',
                    '1 cup Fresh Baby Spinach, chopped',
                    '1 tbsp Butter',
                    '2 tbsp Shredded Cheddar or Swiss Cheese',
                    '1 tbsp Milk',
                    'Pinch of Salt and Black Pepper',
                    'Pinch of Nutmeg (optional)'
                ],
                steps: [
                    'In a clean bowl, beat the 3 egg whites with a pinch of salt until stiff peaks form.',
                    'In another bowl, whisk the yolks with 1 tbsp milk, pepper, and nutmeg.',
                    'Gently fold the yolks into the whites using a spatula, being careful not to deflate the air.',
                    'Melt 1 tbsp butter in an 8-inch non-stick skillet over medium-low heat.',
                    'Add the chopped spinach and sauté for 1 minute until wilted. Spread evenly across the pan.',
                    'Pour the egg mixture over the spinach. Cover the pan and cook for 3-5 minutes until the bottom is golden and the top is set.',
                    'Sprinkle cheese on one side, fold the omelet in half, and slide onto a plate.'
                ]
            }
        },
        {
            name: 'Honey-Glazed Lemon Salmon',
            time: '15-18 min',
            difficulty: 'Easy',
            image: '🐟',
            ingredients: ['Meat', 'Pantry', 'Lemon'],
            details: {
                ingredients: [
                    '2 Salmon Fillets (approx. 6oz each)',
                    '2 tbsp Honey',
                    '1 tbsp Fresh Lemon Juice',
                    '1 tbsp Olive Oil',
                    '1/2 tsp Garlic Powder',
                    '1/2 tsp Dried Oregano',
                    'Salt and Pepper'
                ],
                steps: [
                    'Pat salmon fillets dry with a paper towel. Season both sides with salt, pepper, garlic powder, and oregano.',
                    'In a small bowl, whisk together 2 tbsp honey and 1 tbsp lemon juice.',
                    'Heat 1 tbsp oil in a skillet over medium heat.',
                    'Place salmon skin-side down (if applicable). Sear for 4-5 minutes until the skin is crispy.',
                    'Flip the fillets. Pour the honey-lemon mixture into the pan around the salmon.',
                    'Cook for another 2-3 minutes, spooning the sauce over the fillets continuously as it bubbles and thickens into a glaze.',
                    'Remove when internal temperature reaches 145°F (63°C).'
                ]
            }
        },
        {
            name: 'Mediterranean Sheet Pan Veggies',
            time: '35 min',
            difficulty: 'Easy',
            image: '🥦',
            ingredients: ['Vegetables', 'Pantry', 'Cheese'],
            details: {
                ingredients: [
                    '4 cups Assorted Vegetables (Bell Peppers, Zucchini, Red Onion, Broccoli)',
                    '3 tbsp Olive Oil',
                    '2 cloves Garlic, smashed',
                    '1 tsp Dried Thyme or Rosemary',
                    '1/4 cup Feta Cheese crumbles (optional garnish)',
                    'Salt and Pepper to taste'
                ],
                steps: [
                    'Preheat your oven to 400°F (200°C).',
                    'Wash and chop all vegetables into roughly equal 1-inch pieces ensure even cooking.',
                    'Place vegetables on a large sheet pan. Drizzle with 3 tbsp olive oil and toss with garlic, herbs, salt, and pepper.',
                    'Spread the vegetables in a single layer, ensuring they aren\'t crowded (use two pans if necessary).',
                    'Roast for 20-25 minutes, tossing halfway through, until vegetables are tender and edges are slightly charred.',
                    'Remove from oven and sprinkle with feta cheese before serving.'
                ]
            }
        }
    ];

    // 2. Logic to find matching ingredients
    const recipesWithMatchStatus = recipes.map(recipe => {
        let matchCount = 0;
        const processedIngredients = recipe.ingredients.map(ing => {
            const isAvailable = inventory.some(item =>
                item.name.toLowerCase().includes(ing.toLowerCase()) ||
                item.category.toLowerCase().includes(ing.toLowerCase()) ||
                ing.toLowerCase().includes(item.category.toLowerCase())
            );
            if (isAvailable) matchCount++;
            return { name: ing, available: isAvailable };
        });

        return {
            ...recipe,
            processedIngredients,
            matchPercentage: matchCount / recipe.ingredients.length
        };
    })
        .filter(recipe => recipe.matchPercentage >= 0.5)
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

    // 3. Render
    if (recipesWithMatchStatus.length === 0) {
        container.innerHTML = `
            <div class="coming-soon">
                <div style="font-size: 3rem">🔎</div>
                <h2>No matches found</h2>
                <p>Add more items to your fridge to reach at least a 50% match for detailed in-app recipes!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="recipes-view">
            <div class="recipe-header">
                <h3>What to Cook?</h3>
                <p>Complete step-by-step recipes based on your fridge inventory.</p>
            </div>
            
            <div class="recipes-grid">
                ${recipesWithMatchStatus.map(recipe => {
        const recipeJson = JSON.stringify(recipe).replace(/'/g, "\\'").replace(/"/g, "&quot;");
        return `
                    <div class="recipe-card" onclick="window.showRecipeDetails(${recipeJson})">
                        <div class="recipe-icon">${recipe.image}</div>
                        <div class="recipe-content">
                            <div class="recipe-top">
                                <h4>${recipe.name}</h4>
                                <span class="match-badge ${getMatchClass(recipe.matchPercentage)}">
                                    ${Math.round(recipe.matchPercentage * 100)}% Match
                                </span>
                            </div>
                            <div class="recipe-meta">
                                <span>⏱️ ${recipe.time}</span>
                                <span>👨‍🍳 ${recipe.difficulty}</span>
                            </div>
                            <div class="ingredients-list">
                                ${recipe.processedIngredients.map(ing => `
                                    <span class="ingredient-tag ${ing.available ? 'has-item' : 'missing-item'}">
                                        ${ing.available ? '✓' : ''} ${ing.name}
                                    </span>
                                `).join('')}
                            </div>
                            <div class="view-recipe-hint">Tap to view instructions →</div>
                        </div>
                    </div>
                `}).join('')}
            </div>
        </div>
    `;
};

function getMatchClass(percentage) {
    if (percentage >= 0.75) return 'match-high';
    if (percentage >= 0.4) return 'match-medium';
    return 'match-low';
}
