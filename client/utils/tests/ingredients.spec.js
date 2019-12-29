import {extractIngredient} from "../ingredients";

describe("should extract correct ingredients", () => {
    it(" should work with fractions < 1", () => {
        const {measurement, quantity, name} = extractIngredient("1/2 cup chopped nuts, optional")
        expect(measurement).toEqual("cup");
        expect(quantity).toEqual(0.5);
        expect(name).toEqual("chopped nuts, optional");
    })

    it("1 Tablespoon", () => {
        const {measurement, quantity, name} = extractIngredient("1 Tablespoon orange peel")
        expect(measurement).toEqual("tbsp");
        expect(quantity).toEqual(1);
        expect(name).toEqual("orange peel")
    })

    it("1-1/2 cups cranberries, coarsely chopped", () => {
        const {measurement, quantity, name} = extractIngredient("1-1/2 cups cranberries, coarsely chopped")
        expect(measurement).toEqual("cup");
        expect(quantity).toEqual(1.5);
        expect(name).toEqual("cranberries, coarsely chopped")
    })

    it("2 Tablespoons hot water", () => {
        const {measurement, quantity, name} = extractIngredient("2 Tablespoons hot water")
        expect(measurement).toEqual("tbsp");
        expect(quantity).toEqual(2);
        expect(name).toEqual("hot water")
    })

    it("1 egg, well beaten", () => {
        const {measurement, quantity, name} = extractIngredient("1 egg, well beaten")
        expect(measurement).toEqual("#");
        expect(quantity).toEqual(1);
        expect(name).toEqual("egg, well beaten")
    })

    it("1/2 cup broken walnuts, optional", () => {
        const {measurement, quantity, name} = extractIngredient("1/2 cup broken walnuts, optional")
        expect(measurement).toEqual("cup");
        expect(quantity).toEqual(0.5);
        expect(name).toEqual("broken walnuts, optional")
    })

    it("2 teaspoons baking powder", () => {
        const {measurement, quantity, name} = extractIngredient("2 teaspoons baking powder")
        expect(measurement).toEqual("tsp");
        expect(quantity).toEqual(2);
        expect(name).toEqual("baking powder")
    })

    it("1/4 cup milk (can use almond milk)", () => {
        const {measurement, quantity, name} = extractIngredient("1/4 cup milk (can use almond milk)")
        expect(measurement).toEqual("cup");
        expect(quantity).toEqual(0.25);
        expect(name).toEqual("milk (can use almond milk)")
    })

    it("1/3 cup shortening (butter or coconut oil)", () => {
        const {measurement, quantity, name} = extractIngredient("1/3 cup shortening (butter or coconut oil)")
        expect(measurement).toEqual("cup");
        expect(quantity).toEqual(0.33);
        expect(name).toEqual("shortening (butter or coconut oil)")
    })

    it("1.5 cups milk", () => {
        const {measurement, quantity, name} = extractIngredient("1.5 cups milk")
        expect(measurement).toEqual("cup");
        expect(quantity).toEqual(1.5);
        expect(name).toEqual("milk")
    })

    it("2.5 Tbs. flour", () => {
        const {measurement, quantity, name} = extractIngredient("2.5 Tbs. flour")
        expect(measurement).toEqual("tbsp");
        expect(quantity).toEqual(2.5);
        expect(name).toEqual("flour")
    })
});
