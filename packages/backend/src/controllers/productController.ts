import { Request, Response } from "express";
import { Product } from '../types/Product';

const db = require('../db/database');

export const getAllProducts = (_: Request, res: Response) => {
    const database = db.getDb();

    database.all('SELECT * FROM products', [], async function (error: Error | null, products: Array<Product>) {
        if (error) {
            res.status(400).json({"error": error.message});
            return;
        }

        const productsWithDetails: Array<Product> = [];

        for (let i = 0; i < products.length; i++) {
            const product = products[i];

            await new Promise<void>((resolve) => {
                database.get(
                    'SELECT COUNT(*) as total FROM products WHERE price <= ?',
                    [product.price],
                    (err, result) => {
                        if (!err) {
                            product.cheaperCount = result.total;
                        }
                        resolve();
                    }
                );
            });

            await new Promise<void>((resolve) => {
                database.get(
                    'SELECT AVG(price) as avg FROM products',
                    [],
                    (err, result) => {
                        if (!err) {
                            product.avgPrice = result.avg;
                        }
                        resolve();
                    }
                );
            });

            productsWithDetails.push(product);
        }

        res.json({
            "message": "success",
            "data": productsWithDetails
        });
    });
};

export const createProduct = (req, res) => {
    const {name, price, stock} = req.body;
    const database = db.getDb();

    database.run(
        `INSERT INTO products (name, price, stock) VALUES (?, ?, ?)`,
        [name, price, stock],
        function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({error: 'Error creating product'});
            }
            res.status(201).json({
                id: this.lastID,
                name,
                price,
                stock
            });
        }
    );
};

export const getProduct = (req, res) => {
    const id = req.params.id;
    const database = db.getDb();

    database.get(
        'SELECT * FROM products WHERE id = ?',
        [id],
        (error, result) => {
            if (error) {
                res.status(400).json({"error":error.message});
                return;
            }
            res.json({
                "message":"success",
                "data":result
            });
        }
    );
};

export const updateStock = (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    const database = db.getDb();

    database.run(
        `UPDATE products SET stock = ? WHERE id = ?`,
        [stock, id],
        function(err) {
            if (err) {
                return res.status(500).json({error: 'Failed to update stock'});
            }
            if (this.changes === 0) {
                return res.status(404).json({error: 'Product not found'});
            }
            res.json({success: true});
        }
    );
};