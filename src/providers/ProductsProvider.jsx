import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ProductsContext } from "../contexts/ProductsContext";
import { getAllProducts } from "../api/product.api";

export function ProductsProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchedOnceRef = useRef(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllProducts(); // ✅ هنا data هي array
            setProducts(Array.isArray(data) ? data : []);
            return data;
        } catch (err) {
            setError(err);
            setProducts([]);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (fetchedOnceRef.current) return;
        fetchedOnceRef.current = true;
        fetchProducts();
    }, [fetchProducts]);

    const api = useMemo(() => {
        const byId = new Map(products.map((p) => [Number(p.productId), p]));

        return {
            products,
            loading,
            error,

            refresh: fetchProducts,

            getProductById: (id) => byId.get(Number(id)) ?? null,
            getProductName: (id) => byId.get(Number(id))?.productName ?? "",
            getProductPrice: (id) => byId.get(Number(id))?.price ?? 0,

            searchProducts: (q) => {
                const s = (q ?? "").trim();
                if (!s) return products;
                return products.filter((p) => p.productName?.includes(s));
            },
        };
    }, [products, loading, error, fetchProducts]);
    return (
        <ProductsContext.Provider value={api}>
            {children}
        </ProductsContext.Provider>
    );
}
