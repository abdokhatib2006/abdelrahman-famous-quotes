/**
 * Quoteverse — Plain Vanilla JavaScript Frontend Application
 */

(function () {
  'use strict';

  // --- State ---
  const state = {
    currentQuote: null,
    selectedCategory: 'all',
    selectedAuthor: '',
    searchQuery: '',
    isExplorerOpen: false,
    matchingQuotes: [],
    theme: localStorage.getItem('quoteverse_theme') || 'light'
  };

  // --- DOM Elements ---
  const elements = {
    // Theme
    themeToggle: document.getElementById('theme-toggle'),
    themeIconSun: document.getElementById('theme-icon-sun'),
    themeIconMoon: document.getElementById('theme-icon-moon'),

    // Search & Filters
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    authorSelect: document.getElementById('author-select'),
    categoriesContainer: document.getElementById('categories-container'),
    totalBadge: document.getElementById('total-badge'),

    // Hero Quote Card
    quoteCard: document.getElementById('quote-card'),
    quoteText: document.getElementById('quote-text'),
    quoteAuthor: document.getElementById('quote-author'),
    quoteCategory: document.getElementById('quote-category'),

    // Actions
    randomBtn: document.getElementById('random-btn'),
    copyBtn: document.getElementById('copy-btn'),
    tweetBtn: document.getElementById('tweet-btn'),
    toggleExplorerBtn: document.getElementById('toggle-explorer-btn'),
    matchingCountSpan: document.getElementById('matching-count'),
    explorerToggleText: document.getElementById('explorer-toggle-text'),

    // Explorer Section
    explorerSection: document.getElementById('explorer-section'),
    explorerCountBadge: document.getElementById('explorer-count-badge'),
    quotesGrid: document.getElementById('quotes-grid'),
    noQuotesMessage: document.getElementById('no-quotes-message'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message')
  };

  // --- Theme Management ---
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quoteverse_theme', theme);

    if (theme === 'dark') {
      elements.themeIconSun.classList.add('hidden');
      elements.themeIconMoon.classList.remove('hidden');
    } else {
      elements.themeIconSun.classList.remove('hidden');
      elements.themeIconMoon.classList.add('hidden');
    }
  }

  function toggleTheme() {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // --- Query Params Builder ---
  function buildQueryParams() {
    const params = new URLSearchParams();
    if (state.selectedCategory && state.selectedCategory !== 'all') {
      params.append('category', state.selectedCategory);
    }
    if (state.selectedAuthor) {
      params.append('author', state.selectedAuthor);
    }
    if (state.searchQuery.trim()) {
      params.append('q', state.searchQuery.trim());
    }
    return params;
  }

  // --- API Calls ---
  async function fetchRandomQuote() {
    try {
      const params = buildQueryParams();
      const url = `/api/quote/random${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          renderNoQuoteFound();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      renderHeroQuote(data.quote);
      state.currentQuote = data.quote;
    } catch (err) {
      console.error('Error fetching random quote:', err);
    }
  }

  async function fetchMatchingQuotes() {
    try {
      const params = buildQueryParams();
      const url = `/api/quotes${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      state.matchingQuotes = data.quotes || [];
      updateMatchingCount(state.matchingQuotes.length, data.total);
      renderExplorerGrid(state.matchingQuotes);
    } catch (err) {
      console.error('Error fetching matching quotes:', err);
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      renderCategoryPills(data.categories, data.total);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  }

  async function loadAuthors() {
    try {
      const res = await fetch('/api/authors');
      const data = await res.json();
      populateAuthorsDropdown(data.authors);
    } catch (err) {
      console.error('Error loading authors:', err);
    }
  }

  // --- UI Renderers ---
  function renderHeroQuote(quote) {
    if (!quote) return;

    // Smooth transition
    elements.quoteText.classList.add('anim-fade-out');

    setTimeout(() => {
      elements.quoteText.textContent = `"${quote.quote}"`;
      elements.quoteAuthor.textContent = quote.author;
      elements.quoteCategory.textContent = quote.category;
      
      // Update share button URL
      const tweetText = `"${quote.quote}" — ${quote.author}`;
      elements.tweetBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

      elements.quoteText.classList.remove('anim-fade-out');
      elements.quoteText.classList.add('anim-fade-in');

      setTimeout(() => {
        elements.quoteText.classList.remove('anim-fade-in');
      }, 250);
    }, 150);
  }

  function renderNoQuoteFound() {
    elements.quoteText.textContent = 'No quotes match your current filter or search criteria.';
    elements.quoteAuthor.textContent = 'Try adjusting your search';
    elements.quoteCategory.textContent = 'No match';
    state.currentQuote = null;
  }

  function renderCategoryPills(categories, total) {
    elements.categoriesContainer.innerHTML = '';

    // "All" Pill
    const allBtn = document.createElement('button');
    allBtn.className = `pill ${state.selectedCategory === 'all' ? 'active' : ''}`;
    allBtn.dataset.category = 'all';
    allBtn.innerHTML = `All <span class="pill-count">${total}</span>`;
    allBtn.addEventListener('click', () => onCategorySelect('all'));
    elements.categoriesContainer.appendChild(allBtn);

    // Dynamic Category Pills
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `pill ${state.selectedCategory.toLowerCase() === cat.name.toLowerCase() ? 'active' : ''}`;
      btn.dataset.category = cat.name;
      btn.innerHTML = `${cat.name} <span class="pill-count">${cat.count}</span>`;
      btn.addEventListener('click', () => onCategorySelect(cat.name));
      elements.categoriesContainer.appendChild(btn);
    });
  }

  function populateAuthorsDropdown(authors) {
    elements.authorSelect.innerHTML = '<option value="">All Authors</option>';
    authors.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.name;
      opt.textContent = `${item.name} (${item.count})`;
      elements.authorSelect.appendChild(opt);
    });
  }

  function updateMatchingCount(count, total) {
    elements.matchingCountSpan.textContent = count;
    elements.explorerCountBadge.textContent = `${count} quote${count === 1 ? '' : 's'} found`;
  }

  function renderExplorerGrid(quotes) {
    elements.quotesGrid.innerHTML = '';

    if (!quotes || quotes.length === 0) {
      elements.noQuotesMessage.classList.remove('hidden');
      return;
    }

    elements.noQuotesMessage.classList.add('hidden');

    quotes.forEach(q => {
      const card = document.createElement('article');
      card.className = 'mini-quote-card';
      card.title = 'Click to display as main quote';

      card.innerHTML = `
        <p class="mini-quote-text">"${escapeHtml(q.quote)}"</p>
        <div class="mini-quote-meta">
          <span class="mini-quote-author">${escapeHtml(q.author)}</span>
          <span class="mini-quote-category">${escapeHtml(q.category)}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        state.currentQuote = q;
        renderHeroQuote(q);
        elements.quoteCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

      elements.quotesGrid.appendChild(card);
    });
  }

  // --- Handlers ---
  function onCategorySelect(category) {
    state.selectedCategory = category;

    // Update active pill state
    document.querySelectorAll('.categories-pills .pill').forEach(pill => {
      if (pill.dataset.category.toLowerCase() === category.toLowerCase()) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    onFilterChange();
  }

  function onFilterChange() {
    fetchRandomQuote();
    fetchMatchingQuotes();
  }

  function resetAllFilters() {
    state.selectedCategory = 'all';
    state.selectedAuthor = '';
    state.searchQuery = '';
    elements.searchInput.value = '';
    elements.clearSearchBtn.classList.add('hidden');
    elements.authorSelect.value = '';

    document.querySelectorAll('.categories-pills .pill').forEach(pill => {
      if (pill.dataset.category === 'all') {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    onFilterChange();
  }

  // --- Toast ---
  let toastTimeout = null;
  function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('hidden');

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastTimeout = setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, 2400);
  }

  // --- Copy Quote ---
  async function copyCurrentQuote() {
    if (!state.currentQuote) return;
    const textToCopy = `"${state.currentQuote.quote}" — ${state.currentQuote.author}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-https / older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('Quote copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
      showToast('Failed to copy quote');
    }
  }

  // --- Utilities ---
  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);

    // Random Quote Button
    elements.randomBtn.addEventListener('click', () => {
      fetchRandomQuote();
    });

    // Spacebar shortcut for Random Quote
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
        e.preventDefault();
        fetchRandomQuote();
      }
    });

    // Copy Button
    elements.copyBtn.addEventListener('click', copyCurrentQuote);

    // Search Input with Debounce
    const debouncedSearch = debounce(() => {
      state.searchQuery = elements.searchInput.value;
      if (state.searchQuery) {
        elements.clearSearchBtn.classList.remove('hidden');
      } else {
        elements.clearSearchBtn.classList.add('hidden');
      }
      onFilterChange();
    }, 300);

    elements.searchInput.addEventListener('input', debouncedSearch);

    // Clear Search Button
    elements.clearSearchBtn.addEventListener('click', () => {
      elements.searchInput.value = '';
      state.searchQuery = '';
      elements.clearSearchBtn.classList.add('hidden');
      onFilterChange();
      elements.searchInput.focus();
    });

    // Author Select Filter
    elements.authorSelect.addEventListener('change', (e) => {
      state.selectedAuthor = e.target.value;
      onFilterChange();
    });

    // Toggle Explorer Section
    elements.toggleExplorerBtn.addEventListener('click', () => {
      state.isExplorerOpen = !state.isExplorerOpen;
      if (state.isExplorerOpen) {
        elements.explorerSection.classList.remove('hidden');
        elements.explorerSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        elements.explorerSection.classList.add('hidden');
      }
    });

    // Reset Filters Button
    elements.resetFiltersBtn.addEventListener('click', resetAllFilters);
  }

  // --- Initialization ---
  function init() {
    applyTheme(state.theme);
    setupEventListeners();
    loadCategories();
    loadAuthors();
    fetchRandomQuote();
    fetchMatchingQuotes();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
