import { faker } from '@faker-js/faker/locale/es';

export const generateProducts = ()=>
{
    const categories = ["Supplements", "Energizing", "Snacks", "Sportswear"];
    const status = [true,false];
    
    return {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        category: faker.helpers.arrayElement(categories),
        code: faker.number.int(),
        status: faker.helpers.arrayElement(status),
        stock: faker.number.int(),
        price: faker.commerce.price(),
        thumbnail: faker.image.avatar(),
        createdAt: faker.date.anytime(),
        updatedAt: faker.date.anytime()
    }
}