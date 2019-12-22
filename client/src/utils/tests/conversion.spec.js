import {addIngredient} from "../conversions";

describe('should correctly add ingredients', () => {
    it('should add cup with tbsp properly', () => {
        const {measurement, quantity} = addIngredient(4, 'tbsp', 1, 'cup');
        expect(measurement).toEqual('cup');
        expect(quantity).toEqual("1.25");
    });
    it('should add gal and liter', () => {
        const {measurement, quantity} = addIngredient(4, 'l', 1, 'gal');
        expect(measurement).toEqual('gal');
        expect(quantity).toEqual("2.06");
    });
    it('should add gram and oz', () => {
        const {measurement, quantity} = addIngredient(1, 'oz', 28, 'g');
        expect(measurement).toEqual('oz');
        expect(quantity).toEqual("1.99");
    })
});
