// if number of teaspoons divides into 4, then convert to tablespoons
// but if there's leftover, divide
const convert = require('convert-units');

// groups of what measurements can be added
const canBeAddedLookup = [
    ['#'],
    ['ml', 'tsp', 'tbsp', 'fl oz', 'cup', 'pt', 'l', 'qt', 'gal'],
    ['g', 'oz', 'lb'],
];

const canBeAdded = (m1, m2) => {
    if (m1 === m2) return true;
    return canBeAddedLookup.find(g => g.find(t => t === m1)).includes(m2);
};

// return { quantity: x, measurement: y }
// m1 is grocery list item, m2 is new ingredient (adding new ingredient to grocery list)
const standardize = { // use the library's nomenclature
    'fl oz': 'fl-oz',
    'tbsp': 'Tbs',
    'pt': 'pnt',
};

function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}

const addIngredient = (q1, m1, q2, m2) => {
    let q = q1 + q2, m = m1;
    if (m1 === m2) return { quantity: `${q}`, measurement: m };

    const arr = canBeAddedLookup.find(g => g.find(t => t === m1));
    const index1 = arr.findIndex(t => t === m1);
    const index2 = arr.findIndex(t => t === m2);

    if (index1 > index2) { // convert m2 to m1
        q2 = convert(q2).from(standardize[m2] || m2).to(standardize[m1] || m1);
        m = m1;
    } else { // convert m1 to m2
        q1 = convert(q1).from(standardize[m1] || m1).to(standardize[m2] || m2);
        m = m2;
    }

    q = roundToTwo(q1 + q2);

    return { quantity: `${q}`, measurement: m };
};

module.exports = {
    addIngredient,
    canBeAdded,
};
