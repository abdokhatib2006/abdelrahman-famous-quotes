# Quoteverse — 100 Famous & Timeless Quotes

A responsive web application built with **Python Flask**, **plain Vanilla JavaScript**, **HTML5**, and modern **CSS3** that presents and filters 100 curated quotes from history's most notable thinkers, scientists, writers, and leaders.

---

## ✨ Features

- **Curated Dataset of 100 Quotes**: Exactly 100 timeless quotes across 9 categories (*Inspiration*, *Philosophy*, *Science*, *Wisdom*, *Life*, *Success*, *Humor*, *Leadership*, *Creativity*).
- **Dynamic Random Quote Generator**: Shuffles through quotes with smooth transitions and keyboard shortcut support (<kbd>Space</kbd> key).
- **Live Search & Filtering**:
  - **Keyword Search**: Debounced real-time search across quote text and author names.
  - **Category Pills**: Filter by category with live quote counts displayed on each pill.
  - **Author Dropdown**: Filter quotes by a specific author.
- **Quote Explorer Gallery**: Collapsible visual grid displaying all matching quotes with instant promotion to the main view upon clicking.
- **Copy & Share**:
  - **1-Click Copy**: Copies formatted quotes to clipboard with toast notification feedback.
  - **Share to X**: Pre-fills an X (Twitter) post intent with the current quote.
- **Dark / Light Mode**: Seamless theme switching with user preference saved in `localStorage`.
- **Zero External JS Dependencies**: Built using standard browser APIs (Fetch API, Clipboard API, DOM manipulation).

---

## 🛠️ Tech Stack

- **Backend**: Python 3, Flask
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Data Store**: Flat-file JSON (`quotes.json`)
- **Testing**: Python standard library `unittest`

---

## 📁 Project Structure

```
webapp/
├── app.py                  # Flask server and REST API routes
├── quotes.json             # 100 curated quotes dataset
├── requirements.txt        # Python package dependencies
├── .gitignore              # Git ignore rules
├── templates/
│   └── index.html          # Semantic HTML5 template
├── static/
│   ├── css/
│   │   └── style.css       # Responsive styling & themes
│   └── js/
│       └── app.js          # Pure Vanilla JS application logic
└── tests/
    └── test_app.py         # Automated test suite
```

---

## 🔌 API Endpoints

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | — | Renders the single-page application. |
| `GET` | `/api/quote/random` | `category`, `author`, `q` | Returns a single random quote matching filter criteria. |
| `GET` | `/api/quotes` | `category`, `author`, `q` | Returns a list of all matching quotes with counts. |
| `GET` | `/api/categories` | — | Returns all unique categories and their quote counts. |
| `GET` | `/api/authors` | — | Returns all unique authors and their quote counts. |

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10 or higher
- Git

### 2. Installation

Clone the repository and navigate into the project directory:
```bash
git clone https://github.com/abdokhatib2006/abdelrahman-famous-quotes.git
cd abdelrahman-famous-quotes
```

Create and activate a Python virtual environment:

**Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Linux / macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

### 3. Run the Application

```bash
python app.py
```

Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 🧪 Running Tests

The application includes an automated test suite verifying dataset integrity, API routes, and query filters:

```bash
python -m unittest discover -s tests -v
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
