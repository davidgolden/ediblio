const { PrismaClient } = require('@prisma/client');
export const prismaClient = new PrismaClient();

async function main() {
    await prismaClient.measurements.upsert({
        where: {
            short_name: "tsp",
        },
        update: {},
        create: {
            short_name: "tsp",
            long_name: "teaspoon",
            long_name_plural: "teaspons",
            type: "volume",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "tbsp",
        },
        update: {},
        create: {
            short_name: "tbsp",
            long_name: "tablespoon",
            long_name_plural: "tablespoons",
            type: "volume",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "pt",
        },
        update: {},
        create: {
            short_name: "pt",
            long_name: "pint",
            long_name_plural: "pints",
            type: "volume",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "fl oz",
        },
        update: {},
        create: {
            short_name: "fl oz",
            long_name: "fluid ounce",
            long_name_plural: "fluid ounces",
            type: "volume",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "qt",
        },
        update: {},
        create: {
            short_name: "qt",
            long_name: "quart",
            long_name_plural: "quarts",
            type: "volume",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "oz"
        },
        update: {},
        create: {
            short_name: "oz",
            long_name: "ounce",
            long_name_plural: "ounces",
            type: "weight",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "ml"
        },
        update: {},
        create: {
            short_name: "ml",
            long_name: "milliliter",
            long_name_plural: "milliliters",
            type: "volume",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "lb",
        },
        update: {},
        create: {
            short_name: "lb",
            long_name: "pound",
            long_name_plural: "pounds",
            type: "weight",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "gal",
        },
        update: {},
        create: {
            short_name: "gal",
            long_name: "gallon",
            long_name_plural: "gallons",
            type: "volume",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "l",
        },
        update: {},
        create: {
            short_name: "l",
            long_name: "liter",
            long_name_plural: "liters",
            type: "volume",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "cup",
        },
        update: {},
        create: {
            short_name: "cup",
            long_name: "cup",
            long_name_plural: "cups",
            type: "volume",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "g",
        },
        update: {},
        create: {
            short_name: "g",
            long_name: "gram",
            long_name_plural: "grams",
            type: "weight",
        }
    });
    await prismaClient.measurements.upsert({
        where: {
            short_name: "#",
        },
        update: {},
        create: {
            short_name: "#",
            long_name: "#",
            long_name_plural: "",
            type: "amount",
        }
    });
}

main()
    .then(async () => {
        await prismaClient.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prismaClient.$disconnect()
        process.exit(1)
    })