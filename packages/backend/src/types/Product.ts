export interface Product {
    /**
     * Identifiant unique du produit.
     */
    id: number;
    /**
     * Nom du produit.
     */
    name: string;
    /**
     * Prix du produit.
     */
    price: number;
    /**
     * Nombre de produits en stock.
     */
    stock: number;
    /**
     * Nombre de produits moins chers.
     */
    cheaperCount: number;
    /**
     * Prix moyen des produits.
     */
    avgPrice: number;
}
