import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log(prisma);

async function main() {
    const categories = [
        {
            name: "BASIC",
            capacity: 20,
            price: 100,
        },
        {
            name: "PLUS",
            capacity: 50,
            price: 150,
        },
        {
            name: "VIP",
            capacity: 8,
            price: 300,
        },
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category,
        });
    }

    console.log("✔ Categories seeded");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    })