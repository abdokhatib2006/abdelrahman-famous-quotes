import json
import os
import unittest
from app import app, QUOTES_FILE

class QuotesAppTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()
        with open(QUOTES_FILE, 'r', encoding='utf-8') as f:
            cls.quotes_data = json.load(f)

    def test_quotes_dataset_size(self):
        """Verify the dataset contains exactly 100 quotes."""
        self.assertEqual(len(self.quotes_data), 100, "Dataset should contain exactly 100 quotes")

    def test_quotes_dataset_integrity(self):
        """Verify each quote has valid id, quote, author, and category."""
        ids = set()
        for item in self.quotes_data:
            self.assertIn('id', item)
            self.assertIn('quote', item)
            self.assertIn('author', item)
            self.assertIn('category', item)

            self.assertIsInstance(item['id'], int)
            self.assertTrue(item['quote'].strip())
            self.assertTrue(item['author'].strip())
            self.assertTrue(item['category'].strip())

            self.assertNotIn(item['id'], ids, f"Duplicate ID found: {item['id']}")
            ids.add(item['id'])

    def test_index_route(self):
        """Verify that the home page loads successfully."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Quoteverse', response.data)

    def test_api_random_quote(self):
        """Verify GET /api/quote/random returns a random quote."""
        response = self.client.get('/api/quote/random')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('quote', data)
        self.assertIn('id', data['quote'])
        self.assertIn('author', data['quote'])
        self.assertEqual(data['total_matching'], 100)

    def test_api_quotes_all(self):
        """Verify GET /api/quotes returns all 100 quotes when unfiltered."""
        response = self.client.get('/api/quotes')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['total'], 100)
        self.assertEqual(data['count'], 100)
        self.assertEqual(len(data['quotes']), 100)

    def test_api_quotes_by_category(self):
        """Verify category filtering works correctly."""
        response = self.client.get('/api/quotes?category=Science')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(data['count'], 0)
        for q in data['quotes']:
            self.assertEqual(q['category'].lower(), 'science')

    def test_api_quotes_by_author(self):
        """Verify author filtering works correctly."""
        response = self.client.get('/api/quotes?author=Einstein')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(data['count'], 0)
        for q in data['quotes']:
            self.assertIn('einstein', q['author'].lower())

    def test_api_quotes_search_query(self):
        """Verify text search matches quote content."""
        response = self.client.get('/api/quotes?q=opportunity')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertGreater(data['count'], 0)
        for q in data['quotes']:
            match = 'opportunity' in q['quote'].lower() or 'opportunity' in q['author'].lower()
            self.assertTrue(match)

    def test_api_categories(self):
        """Verify /api/categories returns aggregated category stats."""
        response = self.client.get('/api/categories')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('categories', data)
        self.assertGreater(len(data['categories']), 0)
        total_sum = sum(cat['count'] for cat in data['categories'])
        self.assertEqual(total_sum, 100)

    def test_api_authors(self):
        """Verify /api/authors returns aggregated author stats."""
        response = self.client.get('/api/authors')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('authors', data)
        self.assertGreater(len(data['authors']), 0)

    def test_api_random_quote_not_found(self):
        """Verify /api/quote/random returns 404 when no quotes match."""
        response = self.client.get('/api/quote/random?author=NonExistentPerson12345')
        self.assertEqual(response.status_code, 404)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['total_matching'], 0)

if __name__ == '__main__':
    unittest.main()
