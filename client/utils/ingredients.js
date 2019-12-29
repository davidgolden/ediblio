const measurements = ['tsp', 'teaspoon', 'tbsp', 'tbs', 'tablespoon', 'cup', 'pint', 'pt', 'fl oz', 'fluid ounce', 'quart', 'qt', 'ounce', 'oz', 'milliliter', 'ml', 'pound', 'lb', 'gram', 'gallon', 'gal', 'liter', 'l'];
const withMeasurement = new RegExp("^([0-9\\-\\.\\/\\s]+)\\s(" + measurements.join("s\?\\.?|") + "s?\\s?)\\s(.+)", "i");
const noMeasurement = new RegExp("([0-9\\.\\/\\s]+)\\s(.+)", "i");

const shortenedMeasurements = {
    'teaspoon': 'tsp',
    'tablespoon': 'tbsp',
    'pint': 'pt',
    'fluid ounce': 'fl oz',
    'quart': 'qt',
    'ounce': 'oz',
    'milliliter': 'ml',
    'pound': 'lb',
    'gallon': 'gal',
    'liter': 'l',
    'tbs': 'tbsp',
};

function convertFractionToDecimal(fraction) {
    let splitChar = /-/.test(fraction) ? "-" : " "; // support either separating numbers by space or -
    const nums = fraction.split(splitChar);
    if (nums.length > 1) {
        return Number(nums[0]) + eval(nums[1]);
    } else {
        return Number(eval(nums[0]));
    }
}

function standardizeMeasurement(measurement) {
    let tmp = measurement.replace(".", ""); // remove any abbreviations
    const pluralRegex = new RegExp("(" + measurements.join("s|") + "s)", "i");
    if (pluralRegex.test(measurement)) { // test that we're not using the plural of something
        tmp = measurement.substring(0, measurement.length - 1);
    }
    // test if we've used the long version of a measurement, and switch to abbreviation if necessary
    if (tmp.toLowerCase() in shortenedMeasurements) {
        tmp = shortenedMeasurements[tmp.toLowerCase()];
    }
    return tmp;
}

function roundQuantity(qty) {
    if (typeof qty === 'string') qty = Number(qty);
    return Math.round(qty * 100) / 100
}

export function extractIngredient(value) {
    let quantity = "0", measurement, name;
    if (withMeasurement.test(value)) { // follows format of "1 cup rice"
        const match = value.match(withMeasurement);
        quantity = match[1];
        measurement = match[2];
        name = match[3];

        if (/\//.test(quantity)) { // using fraction
            quantity = convertFractionToDecimal(quantity);
        }

    } else if (noMeasurement.test(value)) { // no measurement provided: 1 apple
        const match = value.match(noMeasurement);
        quantity = Number(match[1]);
        measurement = '#';
        name = match[2];
    } else { // assume singular: paper towels
        quantity = 1;
        measurement = '#';
        name = value;
    }

    measurement = standardizeMeasurement(measurement);
    quantity = roundQuantity(quantity);

    return {quantity, measurement, name};
}
