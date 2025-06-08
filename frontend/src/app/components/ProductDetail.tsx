"use client"
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiX, FiShoppingCart } from 'react-icons/fi';

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  stock: number;
  rating: number;
  image: string;
};

export default function ProductDetail({ productId, onClose }: { productId: number, onClose: () => void }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
        <div className="bg-white p-6 rounded-lg w-96">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
        <div className="bg-white p-6 rounded-lg w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Product Not Found</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX size={24} />
            </button>
          </div>
          <p>Sorry, we couldn't find the product you're looking for.</p>
          <button 
            onClick={onClose}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white p-6 rounded-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{product.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover rounded mb-4"
        />
        
        <p className="text-gray-700 mb-2">{product.description}</p>
        <p className="font-bold text-lg mb-2">${product.price.toFixed(2)}</p>
        
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>Category: {product.category}</span>
          <span>Rating: {product.rating}/5</span>
          <span>Stock: {product.stock}</span>
        </div>
        
        <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 flex items-center justify-center">
          <FiShoppingCart className="mr-2" /> Add to Cart
        </button>
      </div>
    </div>
  );
}