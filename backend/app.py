from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import datetime
import spacy

# Load NLP
nlp = spacy.load("en_core_web_sm")

# Simulated inventory
from mock_inventory import inventory

app = Flask(__name__)
CORS(app)

@app.route("/api/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "")
    doc = nlp(user_message)

    # Extract keywords (removing stop words & punctuation)
    keywords = [token.lemma_.lower() for token in doc if not token.is_stop and not token.is_punct]

    # Match keywords to products
    found = []
    for product in inventory:
        name = product["name"].lower()
        category = product["category"].lower()
        for kw in keywords:
            if kw in name or kw in category:
                found.append(product)
                break

    # Form reply
    if "recommend" in user_message.lower():
        product = random.choice(inventory)
        reply = f"Try this: {product['name']} ({product['category']}) - ₹{product['price']}"
    elif found:
        reply = "Here’s what I found:\n" + "\n".join(
            [f"• {p['name']} ({p['category']}) - ₹{p['price']}" for p in found[:5]]
        )
    else:
        reply = "Sorry, I couldn’t find anything for that."
    print("Extracted keywords:", keywords)


    timestamp = datetime.datetime.now().isoformat()
    return jsonify({"response": reply, "timestamp": timestamp})

if __name__ == "__main__":
    app.run(debug=True)
