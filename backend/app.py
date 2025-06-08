from flask import Flask, jsonify, request
from flask_cors import CORS
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Mock product database
products = [
    {
        "id": i,
        "name": f"Product {i}",
        "category": random.choice(["electronics", "books", "textiles"]),
        "price": round(random.uniform(10, 1000), 2),
        "description": f"This is a description for Product {i}",
        "stock": random.randint(0, 100),
        "rating": round(random.uniform(1, 5), 1),
        "image": f"https://picsum.photos/200/300?random={i}"
    } for i in range(1, 101)
]

@app.route('/api/products', methods=['GET'])
def get_products():
    # Basic filtering
    category = request.args.get('category')
    search = request.args.get('search')
    
    result = products
    
    if category:
        result = [p for p in result if p['category'] == category]
    
    if search:
        search = search.lower()
        result = [p for p in result if search in p['name'].lower() or search in p['description'].lower()]
    
    return jsonify(result)

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    # In a real app, you would validate credentials against a database
    return jsonify({
        "token": "mock-token",
        "user": {
            "id": 1,
            "username": data.get('username'),
            "email": "user@example.com"
        }
    })

if __name__ == '__main__':
    app.run(debug=True)