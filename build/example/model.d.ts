import { ObjectID } from "mongodb";
export declare class Product {
    _id: ObjectID;
    CategoryId: ObjectID;
    Category: Category;
    Discontinued: boolean;
    Name: string;
    QuantityPerUnit: string;
    UnitPrice: number;
}
export declare class Category {
    _id: ObjectID;
    Description: string;
    Name: string;
    Products: Product[];
    echo(): string[];
}
