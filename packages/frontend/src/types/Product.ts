export interface Product {
  /**
   * Statut du stock
   */
  stockStatus: string;
  /**
   * Prix de la catégorie
   */
  priceCategory: string;
  /**
   * Texte de recherche
   */
  searchableText: any;
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
  price: string;
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
