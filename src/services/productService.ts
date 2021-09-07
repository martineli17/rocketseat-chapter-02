import { Product, Stock } from "../types";
import { api } from "./api";

export async function GetStockProduct(id: Number): Promise<Number>{
    const { data } = await api.get<Stock>(`stock/${id}`);
    return data.amount;
}

export async function GetAllProcuts(): Promise<Product[]>{
    const { data } = await api.get<Product[]>(`products`);
    return data;
}

export async function GetProduct(id: Number): Promise<Product>{
    const { data } = await api.get<Product>(`products/${id}`);
    return data;
}