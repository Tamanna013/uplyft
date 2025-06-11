import random

categories = ["Electronics", "Books", "Clothing", "Accessories", "Audio", "Mobiles"]
names = {
    "Electronics": ["USB Cable", "Smart Bulb", "Power Bank", "Keyboard", "Laptop Stand"],
    "Books": ["Romance Novel", "Sci-Fi Thriller", "Self-Help Guide", "Comic Book"],
    "Clothing": ["T-shirt", "Jeans", "Hoodie", "Sneakers", "Cap"],
    "Accessories": ["Watch", "Wallet", "Sunglasses", "Backpack"],
    "Audio": ["Earphones", "Bluetooth Speaker", "Headphones"],
    "Mobiles": ["Smartphone X", "Phone Cover", "Screen Guard"]
}

products = []
id_counter = 1

for _ in range(500):
    category = random.choice(categories)
    name = random.choice(names[category])
    price = random.randint(199, 19999)
    products.append({
        "id": id_counter,
        "name": name,
        "category": category,
        "price": price
    })
    id_counter += 1

# Save it as a Python list in a file
with open("mock_inventory.py", "w") as f:
    f.write("inventory = " + str(products))
