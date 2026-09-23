import json
import os
import random
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Load quotes dataset
QUOTES_FILE = os.path.join(os.path.dirname(__file__), 'quotes.json')

def load_quotes():
    if not os.path.exists(QUOTES_FILE):
        return []
    with open(QUOTES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

ALL_QUOTES = load_quotes()

def filter_quotes(category=None, author=None, query=None):
    results = ALL_QUOTES
    if category and category.lower() != 'all':
        cat_lower = category.strip().lower()
        results = [q for q in results if q.get('category', '').lower() == cat_lower]
    if author:
        auth_lower = author.strip().lower()
        results = [q for q in results if auth_lower in q.get('author', '').lower()]
    if query:
        q_lower = query.strip().lower()
        results = [
            q for q in results
            if q_lower in q.get('quote', '').lower() or q_lower in q.get('author', '').lower()
        ]
    return results

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/quote/random')
def get_random_quote():
    category = request.args.get('category')
    author = request.args.get('author')
    query = request.args.get('q') or request.args.get('query')

    matching = filter_quotes(category=category, author=author, query=query)
    if not matching:
        return jsonify({
            'error': 'No quotes found matching your criteria.',
            'total_matching': 0
        }), 404

    selected = random.choice(matching)
    return jsonify({
        'quote': selected,
        'total_matching': len(matching)
    })

@app.route('/api/quotes')
def get_quotes():
    category = request.args.get('category')
    author = request.args.get('author')
    query = request.args.get('q') or request.args.get('query')

    matching = filter_quotes(category=category, author=author, query=query)
    return jsonify({
        'quotes': matching,
        'total': len(ALL_QUOTES),
        'count': len(matching)
    })

@app.route('/api/categories')
def get_categories():
    counts = {}
    for q in ALL_QUOTES:
        cat = q.get('category', 'Uncategorized')
        counts[cat] = counts.get(cat, 0) + 1
    
    categories = [{'name': cat, 'count': count} for cat, count in sorted(counts.items())]
    return jsonify({
        'categories': categories,
        'total': len(ALL_QUOTES)
    })

@app.route('/api/authors')
def get_authors():
    counts = {}
    for q in ALL_QUOTES:
        author = q.get('author', 'Unknown')
        counts[author] = counts.get(author, 0) + 1

    authors = [{'name': author, 'count': count} for author, count in sorted(counts.items())]
    return jsonify({
        'authors': authors
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
