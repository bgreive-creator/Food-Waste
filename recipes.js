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
        // 1. Precise matching logic
        const isAvailable = window.appState.inventory.some(fridgeItem => {
            const itemName = fridgeItem.name.toLowerCase();
            const lowerIng = detailIng.toLowerCase();

            // Simple singular form check
            const singularItem = itemName.replace(/s$/, '');
            const singularIng = lowerIng.replace(/s$/, '');

            // Direct inclusion (e.g., "Chicken Breast" includes "Chicken")
            if (lowerIng.includes(itemName) || itemName.includes(lowerIng)) return true;
            if (singularIng.includes(singularItem)) return true;

            // Specific shared synonyms for robust but tight matching
            const specificSynonyms = {
                'egg': ['eggs'],
                'milk': ['dairy', 'cream'],
                'flour': ['pasta', 'grain'],
                'tomato': ['sauce', 'puree'],
                'meat': ['beef', 'pork', 'chicken', 'turkey', 'steak'],
                'onion': ['leek', 'shallot'],
                'garlic': ['clove']
            };

            const itemCat = fridgeItem.category.toLowerCase();
            if (specificSynonyms[singularItem]) {
                if (specificSynonyms[singularItem].some(syn => singularIng.includes(syn))) return true;
            }
            if (specificSynonyms[itemCat]) {
                if (specificSynonyms[itemCat].some(syn => singularIng.includes(syn))) return true;
            }

            return false;
        });

        return `<li class="${isAvailable ? 'item-has' : 'item-missing'}">
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
        // Proteiin-Based Recipes (Chicken, Beef, Pork, Turkey)
        { name: 'Honey Garlic Chicken', time: '20 min', difficulty: 'Easy', image: '🍗', ingredients: ['Meat', 'Pantry'], details: { ingredients: ['2 Chicken Breasts', '3 tbsp Honey', '2 tbsp Soy Sauce', '3 cloves Garlic'], steps: ['Sear chicken until golden.', 'Whisk honey, soy sauce, and garlic.', 'Pour over chicken and simmer until glaze thickens.'] } },
        { name: 'Beef & Broccoli Stir-Fry', time: '25 min', difficulty: 'Medium', image: '🥩', ingredients: ['Meat', 'Vegetables', 'Grains'], details: { ingredients: ['1 lb Flank Steak', '2 cups Broccoli', '1 cup White Rice', '2 tbsp Soy Sauce', '1 tbsp Ginger'], steps: ['Cook rice.', 'Sear beef strips.', 'Add broccoli and ginger.', 'Toss with soy sauce and serve over rice.'] } },
        { name: 'Pork Chops with Apple', time: '30 min', difficulty: 'Medium', image: '🥩', ingredients: ['Meat', 'Fruit'], details: { ingredients: ['2 Pork Chops', '2 Apples, sliced', '1 Onion, sliced', '1 tbsp Butter'], steps: ['Sear pork chops.', 'Sauté apples and onions in butter.', 'Deglaze pan with water or cider.', 'Serve chops topped with apple mixture.'] } },
        { name: 'Turkey Taco Bowls', time: '20 min', difficulty: 'Easy', image: '🥣', ingredients: ['Meat', 'Vegetables', 'Grains'], details: { ingredients: ['1 lb Ground Turkey', '1 cup Quinoa', '1 cup Corn', '1 Avocado', 'Taco Seasoning'], steps: ['Cook quinoa.', 'Brown turkey with taco seasoning.', 'Assemble bowls with quinoa, turkey, corn, and avocado.'] } },
        { name: 'Lemon Herb Roasted Chicken', time: '50 min', difficulty: 'Medium', image: '🍗', ingredients: ['Meat', 'Vegetables', 'Lemon'], details: { ingredients: ['4 Chicken Thighs', '1 lb Potatoes', '2 Lemons', '4 cloves Garlic'], steps: ['Toss chicken and potatoes with oil, garlic, and herbs.', 'Roast at 425°F for 35 mins.', 'Squeeze lemon over before serving.'] } },
        { name: 'Stuffed Bell Peppers', time: '40 min', difficulty: 'Medium', image: '🫑', ingredients: ['Meat', 'Vegetables', 'Grains'], details: { ingredients: ['4 Bell Peppers', '1 lb Ground Beef', '1 cup Rice', '1 cup Tomato Sauce', '1 cup Cheese'], steps: ['Cook rice and beef.', 'Mix with tomato sauce.', 'Stuff peppers and top with cheese.', 'Bake at 375°F for 30 mins.'] } },
        { name: 'Chicken Alfredo', time: '25 min', difficulty: 'Medium', image: '🍝', ingredients: ['Meat', 'Grains', 'Dairy'], details: { ingredients: ['1 lb Chicken Breast', '8 oz Fettuccine', '1 cup Heavy Cream', '1/2 cup Parmesan', '2 tbsp Butter'], steps: ['Cook pasta.', 'Sear chicken.', 'Simmer cream, butter, and parmesan until thickened.', 'Toss pasta and chicken in sauce.'] } },
        { name: 'BBQ Pulled Pork Sandwiches', time: '20 min', difficulty: 'Easy', image: '🥪', ingredients: ['Meat', 'Bakery', 'Pantry'], details: { ingredients: ['2 cups Shredded Pork', '4 Buns', '1 cup BBQ Sauce', '1 cup Coleslaw'], steps: ['Heat pork with BBQ sauce.', 'Toast buns.', 'Assemble with pork and coleslaw.'] } },
        { name: 'Classic Beef Stew', time: '90 min', difficulty: 'Hard', image: '🍲', ingredients: ['Meat', 'Vegetables', 'Pantry'], details: { ingredients: ['1 lb Beef Stew Meat', '3 Potatoes', '3 Carrots', '1 Onion', '4 cups Beef Broth'], steps: ['Sear beef.', 'Add chopped veggies and broth.', 'Simmer on low for 60-90 minutes until meat is tender.'] } },
        { name: 'Chicken Quesadillas', time: '15 min', difficulty: 'Easy', image: '🌮', ingredients: ['Meat', 'Dairy', 'Grains'], details: { ingredients: ['1 cup Shredded Chicken', '2 Tortillas', '1 cup Cheese', '1/2 cup Salsa'], steps: ['Place chicken and cheese on tortilla.', 'Fold and heat in a pan until cheese melts.', 'Serve with salsa.'] } },
        { name: 'Sheet Pan Chicken & Veggies', time: '35 min', difficulty: 'Easy', image: '🥦', ingredients: ['Meat', 'Vegetables'], details: { ingredients: ['4 Chicken Thighs', '1 lb Mixed Vegetables', '2 tbsp Olive Oil', '1 tbsp Italian Seasoning'], steps: ['Toss everything on a sheet pan.', 'Roast at 400°F for 30 mins.', 'Serve hot.'] } },
        { name: 'Ground Beef Stroganoff', time: '25 min', difficulty: 'Medium', image: '🍝', ingredients: ['Meat', 'Grains', 'Dairy'], details: { ingredients: ['1 lb Ground Beef', '8 oz Egg Noodles', '1 cup Sour Cream', '1 cup Mushrooms'], steps: ['Cook noodles.', 'Brown beef and mushrooms.', 'Stir in sour cream.', 'Serve over noodles.'] } },
        { name: 'Teriyaki Chicken Bowls', time: '20 min', difficulty: 'Easy', image: '🍚', ingredients: ['Meat', 'Vegetables', 'Grains'], details: { ingredients: ['2 Chicken Breasts', '1 cup Rice', '2 cups Stir-fry Veggies', '1/2 cup Teriyaki Sauce'], steps: ['Cook rice and chicken.', 'Steam veggies.', 'Toss everything with teriyaki sauce.'] } },
        { name: 'Pork Medallions with Mustard Sauce', time: '25 min', difficulty: 'Medium', image: '🥩', ingredients: ['Meat', 'Dairy', 'Pantry'], details: { ingredients: ['1 lb Pork Tenderloin', '1/2 cup Heavy Cream', '2 tbsp Dijon Mustard', '1/2 cup Chicken Broth'], steps: ['Sear pork slices.', 'Whisk cream, mustard, and broth in the pan.', 'Simmer until thick.'] } },
        { name: 'Turkey Meatballs', time: '30 min', difficulty: 'Medium', image: '🍝', ingredients: ['Meat', 'Grains', 'Vegetables'], details: { ingredients: ['1 lb Ground Turkey', '1/2 cup Breadcrumbs', '1 Egg', '1 cup Tomato Sauce', '8 oz Spaghetti'], steps: ['Mix turkey, breadcrumbs, egg.', 'Roll into balls and bake.', 'Serve with pasta and sauce.'] } },

        // Seafood Recipes
        { name: 'Garlic Butter Shrimp', time: '15 min', difficulty: 'Easy', image: '🦐', ingredients: ['Meat', 'Dairy', 'Pantry'], details: { ingredients: ['1 lb Shrimp', '4 tbsp Butter', '4 cloves Garlic', '1 tbsp Parsley'], steps: ['Melt butter and sauté garlic.', 'Add shrimp and cook until pink.', 'Garnish with parsley.'] } },
        { name: 'Lemon Dill Salmon', time: '20 min', difficulty: 'Medium', image: '🐟', ingredients: ['Meat', 'Vegetables', 'Lemon'], details: { ingredients: ['2 Salmon Fillets', '1 lb Asparagus', '1 Lemon', '1 tbsp Fresh Dill'], steps: ['Place salmon and asparagus on pan.', 'Top with lemon and dill.', 'Bake at 400°F for 15 mins.'] } },
        { name: 'Crispy Cod Fillets', time: '20 min', difficulty: 'Medium', image: '🐟', ingredients: ['Meat', 'Grains', 'Pantry'], details: { ingredients: ['2 Cod Fillets', '1 cup Flour', '2 Eggs', '1 cup Breadcrumbs'], steps: ['Dredge fish in flour, eggs, then breadcrumbs.', 'Fry in oil until golden brown.'] } },
        { name: 'Shrimp Scampi Pasta', time: '20 min', difficulty: 'Medium', image: '🦐', ingredients: ['Meat', 'Grains', 'Dairy'], details: { ingredients: ['1 lb Shrimp', '8 oz Linguine', '2 tbsp Butter', '2 tbsp Lemon Juice'], steps: ['Cook pasta.', 'Sauté shrimp in butter and lemon.', 'Toss with pasta.'] } },
        { name: 'Tuna Salad Wraps', time: '10 min', difficulty: 'Easy', image: '🌯', ingredients: ['Meat', 'Vegetables', 'Grains'], details: { ingredients: ['1 can Tuna', '2 tbsp Mayo', '1 stalking Celery', '2 Tortillas'], steps: ['Mix tuna, mayo, and celery.', 'Roll into tortillas.'] } },
        { name: 'Baked Trout with Veggies', time: '30 min', difficulty: 'Medium', image: '🐟', ingredients: ['Meat', 'Vegetables'], details: { ingredients: ['2 Trout Fillets', '2 Zucchinis', '1 Bell Pepper', '2 tbsp Olive Oil'], steps: ['Place fish and sliced veggies on pan.', 'Drizzle with oil.', 'Bake at 375°F for 20 mins.'] } },
        { name: 'Pan-Seared Scallops', time: '10 min', difficulty: 'Hard', image: '🐚', ingredients: ['Meat', 'Dairy'], details: { ingredients: ['1/2 lb Scallops', '2 tbsp Butter', '1 clove Garlic'], steps: ['Pat scallops very dry.', 'Sear in a very hot pan with butter for 2 mins per side.'] } },
        { name: 'Baked Tilapia with Herbs', time: '20 min', difficulty: 'Easy', image: '🐟', ingredients: ['Meat', 'Pantry', 'Lemon'], details: { ingredients: ['4 Tilapia Fillets', '1 tbsp Italian Seasoning', '1 Lemon'], steps: ['Season fish.', 'Bake at 400°F for 12-15 mins.', 'Serve with lemon.'] } },
        { name: 'Fettuccine with Smoked Salmon', time: '20 min', difficulty: 'Medium', image: '🍝', ingredients: ['Meat', 'Grains', 'Dairy'], details: { ingredients: ['4 oz Smoked Salmon', '8 oz Fettuccine', '1/2 cup Heavy Cream', '1/4 cup Dill'], steps: ['Cook pasta.', 'Heat cream and stir in smoked salmon and dill.', 'Toss with pasta.'] } },
        { name: 'Asian Glazed Salmon', time: '25 min', difficulty: 'Easy', image: '🐟', ingredients: ['Meat', 'Pantry', 'Grains'], details: { ingredients: ['2 Salmon Fillets', '1/4 cup Soy Sauce', '2 tbsp Honey', '1 cup Rice'], steps: ['Mix soy sauce and honey.', 'Marinate salmon and bake.', 'Serve over rice.'] } },
        { name: 'Fish Tacos with Cabbage Slaw', time: '25 min', difficulty: 'Medium', image: '🌮', ingredients: ['Meat', 'Vegetables', 'Grains'], details: { ingredients: ['1 lb White Fish', '6 Tortillas', '2 cups Shredded Cabbage', '1/2 cup Sour Cream'], steps: ['Pan-sear fish.', 'Warm tortillas.', 'Assemble with cabbage and sour cream.'] } },
        { name: 'Cajun Shrimp & Grits', time: '30 min', difficulty: 'Medium', image: '🦐', ingredients: ['Meat', 'Grains', 'Dairy'], details: { ingredients: ['1 lb Shrimp', '1 cup Grits/Cornmeal', '2 cups Chicken Broth', '2 tbsp Cajun Seasoning'], steps: ['Cook grits in broth.', 'Sauté seasoned shrimp.', 'Serve shrimp over grits.'] } },
        { name: 'Baked Halibut with Tomatoes', time: '25 min', difficulty: 'Medium', image: '🐟', ingredients: ['Meat', 'Vegetables'], details: { ingredients: ['2 Halibut Fillets', '1 cup Cherry Tomatoes', '1 tbsp Olive Oil', '1/4 cup Basil'], steps: ['Toss tomatoes and fillets in oil.', 'Bake at 400°F for 15 mins.', 'Garnish with basil.'] } },
        { name: 'Crab Cakes', time: '30 min', difficulty: 'Hard', image: '🦀', ingredients: ['Meat', 'Eggs', 'Grains'], details: { ingredients: ['1 lb Crab Meat', '1 Egg', '1/2 cup Breadcrumbs', '1/4 cup Mayo'], steps: ['Mix all ingredients.', 'Form into patties.', 'Pan-fry until golden.'] } },
        { name: 'Salmon Salad Bowls', time: '15 min', difficulty: 'Easy', image: '🥗', ingredients: ['Meat', 'Vegetables'], details: { ingredients: ['1 can Salmon', '2 cups Mixed Greens', '1 Cucumber', '1/2 cup Feta'], steps: ['Combine all ingredients in a bowl.', 'Toss with your favorite dressing.'] } },

        // Vegetarian & Pasta Recipes
        { name: 'Classic Margherita Pizza', time: '30 min', difficulty: 'Easy', image: '🍕', ingredients: ['Grains', 'Dairy', 'Vegetables'], details: { ingredients: ['1 Pizza Dough', '1 cup Marinara Sauce', '8 oz Mozzarella', '1/2 cup Fresh Basil'], steps: ['Spread sauce and cheese on dough.', 'Bake at 450°F for 12 mins.', 'Top with basil.'] } },
        { name: 'Creamy Mushroom Risotto', time: '40 min', difficulty: 'Hard', image: '🍄', ingredients: ['Grains', 'Vegetables', 'Dairy'], details: { ingredients: ['1.5 cups Arborio Rice', '1 lb Mushrooms', '4 cups Veg Broth', '1/2 cup Parmesan'], steps: ['Sauté mushrooms.', 'Add rice and broth slowly, stirring.', 'Finish with cheese.'] } },
        { name: 'Vegetable Fried Rice', time: '15 min', difficulty: 'Easy', image: '🍚', ingredients: ['Grains', 'Vegetables', 'Eggs'], details: { ingredients: ['2 cups Cooked Rice', '1 cup Mixed Veggies', '2 Eggs', '2 tbsp Soy Sauce'], steps: ['Sauté veg.', 'Add rice and soy sauce.', 'Scramble eggs and mix in.'] } },
        { name: 'Lentil Soup', time: '45 min', difficulty: 'Medium', image: '🍲', ingredients: ['Vegetables', 'Pantry'], details: { ingredients: ['1 cup Dried Lentils', '4 cups Veg Broth', '2 Carrots', '2 stalks Celery'], steps: ['Sauté chopped veggies.', 'Add lentils and broth.', 'Simmer for 30-40 minutes.'] } },
        { name: 'Avocado Toast with Egg', time: '10 min', difficulty: 'Easy', image: '🥑', ingredients: ['Fruit', 'Eggs', 'Bakery'], details: { ingredients: ['2 slices Bread', '1 Avocado', '2 Eggs', 'Chili Flakes'], steps: ['Toast bread.', 'Mash avocado and spread.', 'Top with fried eggs and chili flakes.'] } },
        { name: 'Pasta Primavera', time: '20 min', difficulty: 'Easy', image: '🍝', ingredients: ['Grains', 'Vegetables', 'Dairy'], details: { ingredients: ['8 oz Spaghetti', '2 cups Mixed Veggies', '1/4 cup Olive Oil', '1/4 cup Parmesan'], steps: ['Cook pasta.', 'Sauté veggies in oil.', 'Toss everything together with cheese.'] } },
        { name: 'Sweet Potato & Black Bean Tacos', time: '30 min', difficulty: 'Medium', image: '🌮', ingredients: ['Vegetables', 'Grains'], details: { ingredients: ['2 Sweet Potatoes, cubed', '1 can Black Beans', '6 Tortillas', '1/4 cup Cilantro'], steps: ['Roast sweet potatoes.', 'Heat beans.', 'Assemble in warm tortillas.'] } },
        { name: 'Zucchini Noodle Pesto', time: '15 min', difficulty: 'Easy', image: '🍝', ingredients: ['Vegetables', 'Dairy', 'Pantry'], details: { ingredients: ['2 Zucchinis, spiraled', '1/2 cup Pesto', '1/4 cup Pine Nuts', '1/4 cup Parmesan'], steps: ['Sauté zucchini noodles for 2-3 mins.', 'Toss with pesto and cheese.'] } },
        { name: 'Chickpea Salad Sandwiches', time: '15 min', difficulty: 'Easy', image: '🥪', ingredients: ['Vegetables', 'Bakery', 'Pantry'], details: { ingredients: ['1 can Chickpeas', '1/4 cup Mayo', '1 stalking Celery', '4 slices Bread'], steps: ['Mash chickpeas and mix with mayo and celery.', 'Serve on bread.'] } },
        { name: 'Roasted Veggie Bowls', time: '35 min', difficulty: 'Medium', image: '🥣', ingredients: ['Vegetables', 'Grains'], details: { ingredients: ['2 cups Mixed Root Veggies', '1 cup Quinoa', '1/4 cup Hummus'], steps: ['Roast veggies.', 'Cook quinoa.', 'Assemble bowls and top with hummus.'] } },
        { name: 'Eggplant Parmesan', time: '50 min', difficulty: 'Hard', image: '🍆', ingredients: ['Vegetables', 'Dairy', 'Grains'], details: { ingredients: ['1 large Eggplant', '1 cup Tomato Sauce', '1 cup Mozzarella', '1/2 cup Breadcrumbs'], steps: ['Slice and bread eggplant.', 'Bake until soft.', 'Layer with sauce and cheese and bake until bubbly.'] } },
        { name: 'Quinoa & Bean Salad', time: '15 min', difficulty: 'Easy', image: '🥗', ingredients: ['Grains', 'Vegetables'], details: { ingredients: ['1 cup Cooked Quinoa', '1 can Chickpeas', '1 Bell Pepper', '2 tbsp Lemon Dressing'], steps: ['Combine all ingredients.', 'Chill before serving.'] } },
        { name: 'Paneer Butter Masala', time: '30 min', difficulty: 'Medium', image: '🍛', ingredients: ['Dairy', 'Vegetables', 'Pantry'], details: { ingredients: ['8 oz Paneer/Tofu', '1 cup Tomato Puree', '1/2 cup Heavy Cream', '1 tbsp Curry Powder'], steps: ['Sauté paneer.', 'Add tomato and spices.', 'Stir in cream and simmer.'] } },
        { name: 'Spinach & Feta Stuffed Shells', time: '45 min', difficulty: 'Hard', image: '🍝', ingredients: ['Grains', 'Dairy', 'Vegetables'], details: { ingredients: ['12 Jumbo Shells', '1 cup Ricotta', '1 cup Spinach', '1/2 cup Feta'], steps: ['Cook shells.', 'Mix cheeses and spinach.', 'Stuff shells and bake with marinara.'] } },
        { name: 'Mushroom & Leek Galette', time: '60 min', difficulty: 'Hard', image: '🥧', ingredients: ['Vegetables', 'Bakery', 'Dairy'], details: { ingredients: ['1 Pie Crust', '1 lb Mushrooms', '2 Leeks', '1/2 cup Goat Cheese'], steps: ['Sauté mushrooms and leeks.', 'Place on crust and top with cheese.', 'Fold edges and bake.'] } },
        { name: 'Baked Ziti', time: '40 min', difficulty: 'Medium', image: '🍝', ingredients: ['Grains', 'Dairy', 'Vegetables'], details: { ingredients: ['1 lb Ziti Pasta', '2 cups Marinara', '2 cups Mozzarella', '1 cup Ricotta'], steps: ['Cook pasta.', 'Mix with sauce and ricotta.', 'Top with mozzarella and bake.'] } },
        { name: 'Veggie Burger Bowls', time: '20 min', difficulty: 'Easy', image: '🥣', ingredients: ['Vegetables', 'Grains'], details: { ingredients: ['2 Veggie Patties', '2 cups Lettuce', '1 Avocado', '1/4 cup Pickles'], steps: ['Cook patties.', 'Assemble bowls with greens, avocado, and pickles.'] } },
        { name: 'Tofu Stir-fry', time: '20 min', difficulty: 'Medium', image: '🥢', ingredients: ['Meat/Protein', 'Vegetables', 'Grains'], details: { ingredients: ['1 block Tofu', '2 cups Stir-fry Veg', '1 cup Rice', '2 tbsp Soy Sauce'], steps: ['Press tofu and cube.', 'Fry until crispy.', 'Sauté with veg and soy sauce.'] } },
        { name: 'Minestrone Soup', time: '40 min', difficulty: 'Medium', image: '🍲', ingredients: ['Vegetables', 'Grains', 'Pantry'], details: { ingredients: ['1 can Kidney Beans', '1 cup Diced Tomatoes', '1/2 cup Small Pasta', '2 Carrots'], steps: ['Simmer veggies and tomatoes in broth.', 'Add beans and pasta.', 'Cook until pasta is tender.'] } },
        { name: 'Gnocchi with Sage Butter', time: '15 min', difficulty: 'Easy', image: '🍝', ingredients: ['Grains', 'Dairy'], details: { ingredients: ['1 lb Gnocchi', '4 tbsp Butter', '6 Fresh Sage Leaves'], steps: ['Cook gnocchi.', 'Melt butter until brown, add sage.', 'Toss with gnocchi.'] } },

        // Breakfast & Brunch Recipes
        { name: 'Classic Fluffy Pancakes', time: '20 min', difficulty: 'Easy', image: '🥞', ingredients: ['Grains', 'Eggs', 'Dairy'], details: { ingredients: ['1.5 cups Flour', '1 cup Milk', '1 Egg', '2 tbsp Butter'], steps: ['Whisk dry and wet ingredients separately.', 'Combine and cook on a griddle until bubbly.'] } },
        { name: 'Overnight Oats with Berries', time: '5 min', difficulty: 'Easy', image: '🥣', ingredients: ['Grains', 'Dairy', 'Fruit'], details: { ingredients: ['1/2 cup Oats', '1/2 cup Milk', '1/4 cup Berries', '1 tsp Honey'], steps: ['Combine in a jar.', 'Refrigerate overnight.', 'Enjoy cold.'] } },
        { name: 'Spinach & Cheese Omelet', time: '10 min', difficulty: 'Easy', image: '🍳', ingredients: ['Eggs', 'Vegetables', 'Cheese'], details: { ingredients: ['3 Eggs', '1 cup Spinach', '1/4 cup Cheddar'], steps: ['Whisk eggs.', 'Sauté spinach.', 'Add eggs and cheese, fold when set.'] } },
        { name: 'French Toast', time: '15 min', difficulty: 'Easy', image: '🍞', ingredients: ['Bakery', 'Eggs', 'Dairy'], details: { ingredients: ['4 slices Bread', '2 Eggs', '1/2 cup Milk', '1 tsp Cinnamon'], steps: ['Whisk eggs, milk, cinnamon.', 'Dip bread and fry in butter until golden.'] } },
        { name: 'Greek Yogurt Parfait', time: '5 min', difficulty: 'Easy', image: '🍨', ingredients: ['Dairy', 'Fruit', 'Grains'], details: { ingredients: ['1 cup Greek Yogurt', '1/2 cup Berries', '1/4 cup Granola'], steps: ['Layer ingredients in a glass.', 'Serve immediately.'] } },
        { name: 'Breakfast Burritos', time: '20 min', difficulty: 'Medium', image: '🌯', ingredients: ['Eggs', 'Grains', 'Dairy'], details: { ingredients: ['4 Eggs', '2 Tortillas', '1/2 cup Cheese', '1/4 cup Salsa'], steps: ['Scramble eggs.', 'Place in tortillas with cheese and salsa.', 'Roll up and enjoy.'] } },
        { name: 'Shakshuka', time: '30 min', difficulty: 'Medium', image: '🍳', ingredients: ['Eggs', 'Vegetables', 'Pantry'], details: { ingredients: ['3 Eggs', '1 can Diced Tomatoes', '1 Onion', '1 tbsp Cumin'], steps: ['Sauté onion and spices in tomatoes.', 'Crack eggs into sauce.', 'Cover and simmer until whites are set.'] } },
        { name: 'Banana Bread', time: '60 min', difficulty: 'Medium', image: '🍞', ingredients: ['Fruit', 'Grains', 'Eggs'], details: { ingredients: ['3 Ripe Bananas', '1.5 cups Flour', '1/2 cup Sugar', '1 Egg'], steps: ['Mash bananas.', 'Mix in other ingredients.', 'Bake at 350°F for 50-60 mins.'] } },
        { name: 'Egg Muffin Cups', time: '25 min', difficulty: 'Easy', image: '🧁', ingredients: ['Eggs', 'Vegetables', 'Cheese'], details: { ingredients: ['6 Eggs', '1/2 cup Spinach', '1/4 cup Bacon Bits'], steps: ['Whisk eggs and mix-ins.', 'Pour into muffin tin.', 'Bake at 350°F for 20 mins.'] } },
        { name: 'Smoothie Bowl', time: '10 min', difficulty: 'Easy', image: '🥣', ingredients: ['Fruit', 'Dairy'], details: { ingredients: ['1 cup Frozen Fruit', '1/2 cup Milk or Yogurt', '1/4 cup Toppings'], steps: ['Blend fruit and milk until thick.', 'Pour into bowl and add toppings.'] } },
        { name: 'Potato Hash with Egg', time: '25 min', difficulty: 'Medium', image: '🍳', ingredients: ['Vegetables', 'Eggs'], details: { ingredients: ['2 Potatoes, diced', '1 Onion', '2 Eggs'], steps: ['Fry potatoes and onions until crispy.', 'Fry eggs on top.'] } },
        { name: 'Blueberry Muffins', time: '30 min', difficulty: 'Medium', image: '🧁', ingredients: ['Grains', 'Fruit', 'Dairy'], details: { ingredients: ['2 cups Flour', '1 cup Blueberries', '1/2 cup Milk', '1/2 cup Butter'], steps: ['Mix dry and wet.', 'Fold in berries.', 'Bake at 375°F for 20 mins.'] } },
        { name: 'Breakfast Quesadilla', time: '15 min', difficulty: 'Easy', image: '🌮', ingredients: ['Eggs', 'Grains', 'Dairy'], details: { ingredients: ['2 Eggs', '1 Tortilla', '1/2 cup Cheese'], steps: ['Scramble eggs.', 'Place on half tortilla with cheese.', 'Fold and toast in pan.'] } },
        { name: 'Chia Seed Pudding', time: '5 min', difficulty: 'Easy', image: '🥣', ingredients: ['Dairy', 'Pantry', 'Fruit'], details: { ingredients: ['1/4 cup Chia Seeds', '1 cup Milk', '1 tsp Honey'], steps: ['Whisk ingredients together.', 'Refrigerate for 4+ hours.', 'Top with fruit.'] } },
        { name: 'Tofu Scramble', time: '15 min', difficulty: 'Easy', image: '🍳', ingredients: ['Protein', 'Vegetables'], details: { ingredients: ['1 block Tofu', '1/2 cup Peppers', '1/4 tsp Turmeric'], steps: ['Crumble tofu into a pan.', 'Add turmeric and peppers.', 'Sauté until heated through.'] } },

        // Salads, Soups & Sides
        { name: 'Classic Caesar Salad', time: '15 min', difficulty: 'Easy', image: '🥗', ingredients: ['Vegetables', 'Dairy', 'Grains'], details: { ingredients: ['4 cups Romaine', '1/4 cup Caesar Dressing', '1/2 cup Croutons'], steps: ['Toss lettuce with dressing.', 'Top with croutons.'] } },
        { name: 'Caprese Salad', time: '10 min', difficulty: 'Easy', image: '🥗', ingredients: ['Vegetables', 'Dairy'], details: { ingredients: ['2 Tomatoes', '8 oz Mozzarella', '1/4 cup Basil'], steps: ['Slice tomatoes and cheese.', 'Layer with basil and drizzle with olive oil.'] } },
        { name: 'Roasted Broccoli', time: '20 min', difficulty: 'Easy', image: '🥦', ingredients: ['Vegetables'], details: { ingredients: ['1 lb Broccoli', '2 tbsp Olive Oil', '2 cloves Garlic'], steps: ['Toss broccoli in oil and garlic.', 'Roast at 400°F for 15-20 mins.'] } },
        { name: 'Cucumber Salad', time: '10 min', difficulty: 'Easy', image: '🥗', ingredients: ['Vegetables'], details: { ingredients: ['3 Cucumbers', '1/4 cup Red Onion', '2 tbsp Vinegar'], steps: ['Slice cucumbers and onion.', 'Toss with vinegar and salt.'] } },
        { name: 'Garlic Mashed Potatoes', time: '25 min', difficulty: 'Medium', image: '🥔', ingredients: ['Vegetables', 'Dairy'], details: { ingredients: ['2 lbs Potatoes', '1/2 cup Milk', '4 tbsp Butter', '2 cloves Garlic'], steps: ['Boil potatoes until soft.', 'Mash with butter, milk, and garlic.'] } },
        { name: 'Butternut Squash Soup', time: '45 min', difficulty: 'Medium', image: '🥣', ingredients: ['Vegetables', 'Pantry'], details: { ingredients: ['1 Butternut Squash', '1 Onion', '4 cups Veg Broth'], steps: ['Roast squash and onion.', 'Blend with broth until smooth.'] } },
        { name: 'Coleslaw', time: '10 min', difficulty: 'Easy', image: '🥗', ingredients: ['Vegetables', 'Pantry'], details: { ingredients: ['4 cups Shredded Cabbage', '1/2 cup Mayo', '1 tbsp Vinegar'], steps: ['Mix mayo and vinegar.', 'Toss with cabbage.'] } },
        { name: 'Fruit Salad', time: '15 min', difficulty: 'Easy', image: '🍉', ingredients: ['Fruit'], details: { ingredients: ['4 cups Mixed Fruit', '1 tsp Honey', '1 tsp Lime Juice'], steps: ['Chop fruit.', 'Toss with honey and lime.'] } },
        { name: 'Quinoa Salad', time: '20 min', difficulty: 'Easy', image: '🥗', ingredients: ['Grains', 'Vegetables'], details: { ingredients: ['1 cup Quinoa', '1 Cucumber', '1/2 cup Cherry Tomatoes'], steps: ['Cook quinoa.', 'Chop veggies and toss with quinoa.'] } },
        { name: 'Garlic Bread', time: '10 min', difficulty: 'Easy', image: '🥖', ingredients: ['Bakery', 'Dairy'], details: { ingredients: ['1 Baguette', '4 tbsp Butter', '2 cloves Garlic'], steps: ['Mix butter and garlic.', 'Spread on bread and toast.'] } },
        { name: 'Roasted Brussels Sprouts', time: '25 min', difficulty: 'Medium', image: '🥦', ingredients: ['Vegetables', 'Pantry'], details: { ingredients: ['1 lb Brussels Sprouts', '2 tbsp Olive Oil', '1 tbsp Balsamic'], steps: ['Toss sprouts in oil.', 'Roast at 400°F for 20 mins.'] } },
        { name: 'Greek Salad', time: '15 min', difficulty: 'Easy', image: '🥗', ingredients: ['Vegetables', 'Cheese'], details: { ingredients: ['2 Cucumbers', '1 cup Feta', '1/2 cup Olives'], steps: ['Toss chopped cucumbers with olives and feta.'] } },
        { name: 'Gazpacho', time: '15 min', difficulty: 'Medium', image: '🥣', ingredients: ['Vegetables'], details: { ingredients: ['4 Tomatoes', '1 Cucumber', '1 Bell Pepper'], steps: ['Blend all raw veggies until smooth.', 'Chill before serving.'] } },
        { name: 'Hummus & Veggies', time: '10 min', difficulty: 'Easy', image: '🥕', ingredients: ['Vegetables', 'Pantry'], details: { ingredients: ['1 cup Hummus', '2 Carrots', '2 Celery Stalks'], steps: ['Slice veggies into sticks.', 'Serve with hummus.'] } },
        { name: 'Sweet Potato Fries', time: '30 min', difficulty: 'Medium', image: '🍟', ingredients: ['Vegetables'], details: { ingredients: ['2 Sweet Potatoes', '2 tbsp Olive Oil'], steps: ['Slice into fries.', 'Roast at 425°F for 25 mins.'] } },

        // Desserts & Snacks
        { name: 'Apple Crisp', time: '45 min', difficulty: 'Medium', image: '🍎', ingredients: ['Fruit', 'Grains', 'Dairy'], details: { ingredients: ['4 Apples, sliced', '1 cup Oats', '1/2 cup Butter', '1/2 cup Flour'], steps: ['Place apples in dish.', 'Mix oats, butter, and flour.', 'Top apples and bake at 375°F for 35 mins.'] } },
        { name: 'Chocolate Chip Cookies', time: '25 min', difficulty: 'Medium', image: '🍪', ingredients: ['Grains', 'Eggs', 'Dairy'], details: { ingredients: ['2 cups Flour', '1 cup Butter', '1/2 cup Choc Chips', '2 Eggs'], steps: ['Mix ingredients.', 'Drop onto pan.', 'Bake at 350°F for 10-12 mins.'] } },
        { name: 'Berry Smoothie', time: '5 min', difficulty: 'Easy', image: '🍹', ingredients: ['Fruit', 'Dairy'], details: { ingredients: ['1 cup Berries', '1 cup Milk', '1 Banana'], steps: ['Blend all until smooth.'] } },
        { name: 'Baked Pears', time: '30 min', difficulty: 'Easy', image: '🍐', ingredients: ['Fruit', 'Pantry'], details: { ingredients: ['2 Pears', '1 tsp Cinnamon', '1 tbsp Honey'], steps: ['Halve pears.', 'Top with honey and cinnamon.', 'Bake at 375°F for 20 mins.'] } },
        { name: 'Peanut Butter Banana Toast', time: '5 min', difficulty: 'Easy', image: '🍞', ingredients: ['Bakery', 'Fruit', 'Pantry'], details: { ingredients: ['2 slices Bread', '2 tbsp Peanut Butter', '1 Banana'], steps: ['Toast bread.', 'Spread peanut butter and top with sliced banana.'] } },
        { name: 'Ants on a Log', time: '5 min', difficulty: 'Easy', image: '🪵', ingredients: ['Vegetables', 'Pantry', 'Fruit'], details: { ingredients: ['2 stalks Celery', '2 tbsp Peanut Butter', '1/4 cup Raisins'], steps: ['Fill celery with peanut butter.', 'Top with raisins.'] } },
        { name: 'Yogurt Dipped Strawberries', time: '10 min', difficulty: 'Easy', image: '🍓', ingredients: ['Fruit', 'Dairy'], details: { ingredients: ['1 cup Strawberries', '1/2 cup Greek Yogurt'], steps: ['Dip strawberries in yogurt.', 'Freeze for 30 mins.'] } },
        { name: 'Rice Krispie Treats', time: '15 min', difficulty: 'Easy', image: '🍬', ingredients: ['Grains', 'Dairy', 'Pantry'], details: { ingredients: ['4 cups Rice Cereal', '1 bag Marshmallows', '2 tbsp Butter'], steps: ['Melt butter and marshmallows.', 'Stir in cereal.', 'Press into a pan and cool.'] } },
        { name: 'Stuffed Dates', time: '10 min', difficulty: 'Easy', image: '🌴', ingredients: ['Fruit', 'Cheese'], details: { ingredients: ['10 Dates', '1/4 cup Goat Cheese'], steps: ['Slice dates and remove pit.', 'Fill with cheese.'] } },
        { name: 'Energy Balls', time: '15 min', difficulty: 'Easy', image: '🍡', ingredients: ['Grains', 'Pantry'], details: { ingredients: ['1 cup Oats', '1/2 cup Peanut Butter', '1/4 cup Honey'], steps: ['Mix all ingredients.', 'Roll into small balls.', 'Chill.'] } },
        { name: 'Garlic Parmesan Popcorn', time: '10 min', difficulty: 'Easy', image: '🍿', ingredients: ['Pantry', 'Dairy'], details: { ingredients: ['1/2 cup Popcorn Kernels', '2 tbsp Butter', '1/4 cup Parmesan'], steps: ['Pop the corn.', 'Toss with melted butter and cheese.'] } },
        { name: 'Baked Cinnamon Apples', time: '20 min', difficulty: 'Easy', image: '🍎', ingredients: ['Fruit', 'Pantry'], details: { ingredients: ['2 Apples, cubed', '1 tsp Cinnamon', '1 tbsp Sugar'], steps: ['Toss apples with sugar and cinnamon.', 'Microwave for 3-5 mins or bake until soft.'] } },
        { name: 'Trail Mix', time: '5 min', difficulty: 'Easy', image: '🥜', ingredients: ['Grains', 'Fruit', 'Pantry'], details: { ingredients: ['1/2 cup Nuts', '1/4 cup Raisins', '1/4 cup Pretzels'], steps: ['Mix all ingredients in a bowl.'] } },
        { name: 'Deviled Eggs', time: '25 min', difficulty: 'Medium', image: '🥚', ingredients: ['Eggs', 'Pantry'], details: { ingredients: ['6 Eggs', '1/4 cup Mayo', '1 tsp Mustard'], steps: ['Boil and peel eggs.', 'Slice in half.', 'Mix yolks with mayo/mustard and pipe back in.'] } },
        { name: 'S\'mores', time: '5 min', difficulty: 'Easy', image: '🔥', ingredients: ['Grains', 'Pantry'], details: { ingredients: ['4 Graham Crackers', '2 Marshmallows', '1 Choc Bar'], steps: ['Toast marshmallows.', 'Sandwich with chocolate between crackers.'] } }
    ];



    // 2. Logic to find matching ingredients based on detailed ingredient lists
    const recipesWithMatchStatus = recipes.map(recipe => {
        let matchCount = 0;

        const processedIngredients = recipe.details.ingredients.map(detailIng => {
            const lowerIng = detailIng.toLowerCase();

            const isAvailable = inventory.some(item => {
                const itemName = item.name.toLowerCase();
                const itemCat = item.category.toLowerCase();

                // Simple singular form check
                const singularItem = itemName.replace(/s$/, '');
                const singularIng = lowerIng.replace(/s$/, '');

                // Direct name match
                if (lowerIng.includes(itemName) || itemName.includes(lowerIng)) return true;
                if (singularIng.includes(singularItem)) return true;

                // Targeted synonyms consistent with showRecipeDetails
                const specificSynonyms = {
                    'egg': ['eggs'],
                    'milk': ['dairy', 'cream'],
                    'flour': ['pasta', 'grain'],
                    'tomato': ['sauce', 'puree'],
                    'meat': ['beef', 'pork', 'chicken', 'turkey', 'steak'],
                    'onion': ['leek', 'shallot'],
                    'garlic': ['clove']
                };

                if (specificSynonyms[singularItem]) {
                    if (specificSynonyms[singularItem].some(syn => singularIng.includes(syn))) return true;
                }
                if (specificSynonyms[itemCat]) {
                    if (specificSynonyms[itemCat].some(syn => singularIng.includes(syn))) return true;
                }
                return false;
            });

            if (isAvailable) matchCount++;
            return { name: detailIng, available: isAvailable };
        });

        return {
            ...recipe,
            processedIngredients,
            matchPercentage: matchCount / recipe.details.ingredients.length
        };
    })
        .filter(recipe => recipe.matchPercentage >= 0.66) // Stricter 2/3 match threshold
        .sort((a, b) => b.matchPercentage - a.matchPercentage);

    // 3. Render
    if (recipesWithMatchStatus.length === 0) {
        container.innerHTML = `
            <div class="coming-soon">
                <div style="font-size: 3rem">🔎</div>
                <h2>No great matches found</h2>
                <p>Try adding more items to your fridge. We only suggest recipes where you have at least 2/3 of the main ingredients!</p>
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
    if (percentage >= 0.8) return 'match-high';
    if (percentage >= 0.66) return 'match-medium';
    return 'match-low';
}
