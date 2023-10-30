export interface Item {
    name: string;
    password: string;
    imageDataURL: string;
}

export interface ItemsDocument extends Document {
    uId: string;
    items: Item[];
}
