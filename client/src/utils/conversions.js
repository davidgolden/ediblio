// if number of teaspoons divides into 4, then convert to tablespoons
// but if there's leftover, divide

export const canBeAdded = (m1, m2) => {
    if(m1 !== m2) {
        if(m1 === '#' && m2 === 'lb') {
            return false;
        }
        else if(m1 === '#' && m2 === 'fl oz') {
            return false;
        }
        else if(m1 === '#' && m2 === 'oz') {
            return false;
        }
        else if(m1 === 'lb' && m2 === '#') {
            return false;
        }
        else if(m1 === 'lb' && m2 === 'fl oz') {
            return false;
        }
        else if(m1 === 'lb' && m2 === 'oz') {
            return false;
        }
        else if(m1 === 'fl oz' && m2 === '#') {
            return false;
        }
        else if(m1 === 'fl oz' && m2 === 'lb') {
            return false;
        }
        else if(m1 === 'fl oz' && m2 === 'oz') {
            return false;
        }
        else if(m1 === 'oz' && m2 === 'fl oz') {
            return false;
        }
        else if(m1 === 'oz' && m2 === '#') {
            return false;
        }
        else if(m1 === 'oz' && m2 === 'lb') {
            return false;
        }
    }
    return true;
};

// return { quantity: x, measurement: y }
// m1 is grocery list item, m2 is new ingredient (adding new ingredient to grocery list)
export const addIngredient = (q1, m1, q2, m2) => {
    console.log(q1)
    console.log(q2)
    let q, m;
    if (m1 === 'tsp' && m2 === 'tbsp') {
        m = m2;
        q = (q1 / 4) + q2;
    }
    if (m1 === 'tsp' && m2 === 'cup') {
        m = m2;
        q = (q1/48) + q2;
    }
    if (m1 === 'tbsp' && m2 === 'tsp') {
        m = m1;
        q = q1 + (q2 / 4);
    }
    if (m1 === 'tbsp' && m2 === 'cup') {
        m = m2;
        q = (q1 / 16) + q2;
    }
    if (m1 === 'cup' && m2 === 'tsp') {
        m = m1;
        q = q1 + (q2 / 48);
    }
    if (m1 === 'cup' && m2 === 'tbsp') {
        m = m1;
        q = q1 + (q2 / 16);
    }
    if (m1 === m2) {
        q = q1 + q2;
        m = m1;

        console.log('q: ', q);
    }
    return { quantity: q, measurement: m };
};
