// if number of teaspoons divides into 4, then convert to tablespoons
// but if there's leftover, divide

// groups of what measurements can be added
const canBeAddedLookup = [
    ['#'],
    ['cup', 'ml', 'fl oz', 'pt', 'qt', 'gal', 'tbsp', 'tsp', 'l'],
    ['oz', 'lb'],
];

export const canBeAdded = (m1, m2) => {
    if (m1 === m2) return true;
    return canBeAddedLookup.find(g => g.find(t => t === m1)).includes(m2);
};

export const conversions = {
    'cup': {
        'tbsp': v => v / 16,
        'tsp': v => v / 48,
        'ml': v => v * 237,
        'fl oz': v => v * 8.115391,
        'pt': v => v * 0.5072103,
    },
    'tbsp': {
        'cup': v => v * 16,
        'tsp': v => v / 4,
    },
    'tsp': {
        'cup': v => v * 48,
        'tbsp': v => v * 4,
    }
};

// return { quantity: x, measurement: y }
// m1 is grocery list item, m2 is new ingredient (adding new ingredient to grocery list)
export const addIngredient = (q1, m1, q2, m2) => {
    let q, m;
    if (m1 === 'tsp' && m2 === 'tbsp') {
        m = m2;
        q = (q1 / 4) + q2;
    } else if (m1 === 'tsp' && m2 === 'cup') {
        m = m2;
        q = (q1/48) + q2;
    } else if (m1 === 'tbsp' && m2 === 'tsp') {
        m = m1;
        q = q1 + (q2 / 4);
    } else if (m1 === 'tbsp' && m2 === 'cup') {
        m = m2;
        q = (q1 / 16) + q2;
    } else if (m1 === 'cup' && m2 === 'tsp') {
        m = m1;
        q = q1 + (q2 / 48);
    } else if (m1 === 'cup' && m2 === 'tbsp') {
        m = m1;
        q = q1 + (q2 / 16);
    } else if (m1 === m2) {
        q = q1 + q2;
        m = m1;
    }
    return { quantity: `${q}`, measurement: m };
};
