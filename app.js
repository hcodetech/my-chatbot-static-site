// app.js

// Global state
let toys = [];
let filteredToys = [];
let cart = {};

// DOM elements
const navHomeBtn = document.getElementById('nav-home');
const navCatalogBtn = document.getElementById('nav-catalog');
const navCartBtn = document.getElementById('nav-cart');
const pages = {
  home: document.getElementById('home-page'),
  catalog: document.getElementById('catalog-page'),
  cart: document.getElementById('cart-page')
};

const featuredToysList = document.getElementById('featured-toys-list');
const catalogToysContainer = document.getElementById('catalog-toys');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');

const toyModal = document.getElementById('toy-modal');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.getElementById('modal-close');

const checkoutModal = document.getElementById('checkout-modal');
const checkoutCloseBtn = document.getElementById('checkout-close');
const checkoutDoneBtn = document.getElementById('checkout-done');
const checkoutButton = document.getElementById('checkout-button');

// Filters
const searchNameInput = document.getElementById('search-name');
const filterAgeSelect = document.getElementById('filter-age');
const filterInterestSelect = document.getElementById('filter-interest');
const filterCategorySelect = document.getElementById('filter-category');
const filterPriceInput = document.getElementById('filter-price');
const filterGenderSelect = document.getElementById('filter-gender');
const clearFiltersBtn = document.getElementById('clear-filters');

// Utility functions
function saveCart() {
  localStorage.setItem('toyland-cart', JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem('toyland-cart');
  if (saved) {
    cart = JSON.parse(saved);
  } else {
    cart = {};
  }
}

function updateCartCount() {
  const count = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
  cartCountEl.textContent = count;
}

function updateCartTotal() {
  let total = 0;
  for (const id in cart) {
    const item = cart[id];
    total += item.toy.price * item.quantity;
  }
  cartTotalEl.textContent = total.toFixed(2);
}

function openPage(pageName) {
  for (const key in pages) {
    if (key === pageName) {
      pages[key].classList.add('active');
      pages[key].removeAttribute('hidden');
    } else {
      pages[key].classList.remove('active');
      pages[key].setAttribute('hidden', '');
    }
  }
  // Update nav button active state
  navHomeBtn.classList.toggle('active', pageName === 'home');
  navCatalogBtn.classList.toggle('active', pageName === 'catalog');
  navCartBtn.classList.toggle('active', pageName === 'cart');
}

function createToyCard(toy) {
  const card = document.createElement('button');
  card.className = 'toy-card';
  card.setAttribute('aria-label', `${toy.name}, $${toy.price}, age ${toy.ageRange}, category ${toy.category}`);
  card.type = 'button';

  const img = document.createElement('img');
  img.src = toy.image;
  img.alt = toy.name;
  img.loading = 'lazy';
  card.appendChild(img);

  const nameEl = document.createElement('div');
  nameEl.className = 'toy-name';
  nameEl.textContent = toy.name;
  card.appendChild(nameEl);

  const priceEl = document.createElement('div');
  priceEl.className = 'toy-price';
  priceEl.textContent = `$${toy.price.toFixed(2)}`;
  card.appendChild(priceEl);

  const ageEl = document.createElement('div');
  ageEl.className = 'toy-age';
  ageEl.textContent = `Age: ${toy.ageRange}`;
  card.appendChild(ageEl);

  const categoryEl = document.createElement('div');
  categoryEl.className = 'toy-category';
  categoryEl.textContent = toy.category;
  card.appendChild(categoryEl);

  if (toy.interests && toy.interests.length > 0) {
    const tagsEl = document.createElement('div');
    tagsEl.className = 'toy-tags';
    tagsEl.textContent = toy.interests.join(', ');
    card.appendChild(tagsEl);
  }

  card.addEventListener('click', () => openToyModal(toy.id));

  return card;
}

function renderFeaturedToys() {
  featuredToysList.innerHTML = '';
  // Show first 6 toys as featured
  const featured = toys.slice(0, 6);
  featured.forEach(toy => {
    const card = createToyCard(toy);
    featuredToysList.appendChild(card);
  });
}

function renderCatalogToys() {
  catalogToysContainer.innerHTML = '';
  if (filteredToys.length === 0) {
    const noResult = document.createElement('p');
    noResult.textContent = 'No toys found matching your criteria.';
    noResult.style.textAlign = 'center';
    noResult.style.color = '#831843';
    catalogToysContainer.appendChild(noResult);
    return;
  }
  filteredToys.forEach(toy => {
    const card = createToyCard(toy);
    catalogToysContainer.appendChild(card);
  });
}

function openToyModal(toyId) {
  const toy = toys.find(t => t.id === toyId);
  if (!toy) return;

  modalBody.innerHTML = '';

  const img = document.createElement('img');
  img.src = toy.image;
  img.alt = toy.name;
  modalBody.appendChild(img);

  const title = document.createElement('h3');
  title.id = 'modal-title';
  title.textContent = toy.name;
  modalBody.appendChild(title);

  const desc = document.createElement('p');
  desc.textContent = toy.description;
  modalBody.appendChild(desc);

  const age = document.createElement('p');
  age.innerHTML = `<strong>Age Suitability:</strong> ${toy.ageRange}`;
  modalBody.appendChild(age);

  if (toy.skills && toy.skills.length > 0) {
    const skillsTitle = document.createElement('p');
    skillsTitle.innerHTML = '<strong>Skills Developed:</strong>';
    modalBody.appendChild(skillsTitle);

    const skillsList = document.createElement('ul');
    toy.skills.forEach(skill => {
      const li = document.createElement('li');
      li.textContent = skill;
      skillsList.appendChild(li);
    });
    modalBody.appendChild(skillsList);
  }

  if (toy.safetyNotes) {
    const safety = document.createElement('p');
    safety.innerHTML = `<strong>Safety Notes:</strong> ${toy.safetyNotes}`;
    modalBody.appendChild(safety);
  }

  const addToCartBtn = document.createElement('button');
  addToCartBtn.className = 'btn-primary';
  addToCartBtn.textContent = 'Add to Cart';
  addToCartBtn.addEventListener('click', () => {
    addToCart(toy.id);
    closeToyModal();
    openPage('cart');
  });
  modalBody.appendChild(addToCartBtn);

  toyModal.removeAttribute('hidden');
  toyModal.focus();
}

function closeToyModal() {
  toyModal.setAttribute('hidden', '');
  modalBody.innerHTML = '';
}

function addToCart(toyId) {
  if (!cart[toyId]) {
    const toy = toys.find(t => t.id === toyId);
    if (!toy) return;
    cart[toyId] = { toy, quantity: 1 };
  } else {
    cart[toyId].quantity += 1;
  }
  saveCart();
  updateCartCount();
  renderCartItems();
}

function removeFromCart(toyId) {
  delete cart[toyId];
  saveCart();
  updateCartCount();
  renderCartItems();
}

function updateCartQuantity(toyId, quantity) {
  if (quantity < 1) {
    removeFromCart(toyId);
  } else {
    cart[toyId].quantity = quantity;
    saveCart();
    updateCartCount();
    renderCartItems();
  }
}

function renderCartItems() {
  cartItemsContainer.innerHTML = '';
  if (Object.keys(cart).length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'Your cart is empty.';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.color = '#831843';
    cartItemsContainer.appendChild(emptyMsg);
    cartTotalEl.textContent = '0.00';
    return;
  }

  for (const id in cart) {
    const item = cart[id];
    const div = document.createElement('div');
    div.className = 'cart-item';

    const img = document.createElement('img');
    img.src = item.toy.image;
    img.alt = item.toy.name;
    div.appendChild(img);

    const infoDiv = document.createElement('div');
    infoDiv.className = 'cart-item-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'cart-item-name';
    nameEl.textContent = item.toy.name;
    infoDiv.appendChild(nameEl);

    const priceEl = document.createElement('div');
    priceEl.className = 'cart-item-price';
    priceEl.textContent = `$${item.toy.price.toFixed(2)}`;
    infoDiv.appendChild(priceEl);

    const quantityDiv = document.createElement('div');
    quantityDiv.className = 'cart-item-quantity';

    const quantityLabel = document.createElement('label');
    quantityLabel.setAttribute('for', `qty-${id}`);
    quantityLabel.textContent = 'Qty:';
    quantityDiv.appendChild(quantityLabel);

    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.min = '1';
    quantityInput.id = `qty-${id}`;
    quantityInput.value = item.quantity;
    quantityInput.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      if (isNaN(val) || val < 1) {
        e.target.value = item.quantity;
        return;
      }
      updateCartQuantity(id, val);
    });
    quantityDiv.appendChild(quantityInput);

    infoDiv.appendChild(quantityDiv);

    div.appendChild(infoDiv);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'cart-item-remove';
    removeBtn.setAttribute('aria-label', `Remove ${item.toy.name} from cart`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => removeFromCart(id));
    div.appendChild(removeBtn);

    cartItemsContainer.appendChild(div);
  }
  updateCartTotal();
}

function filterToys() {
  const nameFilter = searchNameInput.value.trim().toLowerCase();
  const ageFilter = filterAgeSelect.value;
  const interestFilter = filterInterestSelect.value;
  const categoryFilter = filterCategorySelect.value;
  const priceFilter = filterPriceInput.value;
  const genderFilter = filterGenderSelect.value;

  filteredToys = toys.filter(toy => {
    // Name filter
    if (nameFilter && !toy.name.toLowerCase().includes(nameFilter)) return false;

    // Age filter
    if (ageFilter) {
      // ageRange is string like "3-5" or "13+"
      if (ageFilter === '13+') {
        if (!toy.ageRange.includes('13+')) return false;
      } else {
        // Check if toy age range overlaps with filter range
        const [minAge, maxAge] = ageFilter.split('-').map(Number);
        const toyRange = toy.ageRange.replace('+', '').split('-').map(Number);
        const toyMin = toyRange[0];
        const toyMax = toyRange.length > 1 ? toyRange[1] : 99;
        if (toyMax < minAge || toyMin > maxAge) return false;
      }
    }

    // Interest filter
    if (interestFilter) {
      if (!toy.interests || !toy.interests.includes(interestFilter)) return false;
    }

    // Category filter
    if (categoryFilter) {
      if (toy.category !== categoryFilter) return false;
    }

    // Price filter
    if (priceFilter) {
      const maxPrice = parseFloat(priceFilter);
      if (isNaN(maxPrice)) return false;
      if (toy.price > maxPrice) return false;
    }

    // Gender filter
    if (genderFilter) {
      if (toy.gender !== genderFilter) return false;
    }

    return true;
  });
  renderCatalogToys();
}

function clearFilters() {
  searchNameInput.value = '';
  filterAgeSelect.value = '';
  filterInterestSelect.value = '';
  filterCategorySelect.value = '';
  filterPriceInput.value = '';
  filterGenderSelect.value = '';
  filterToys();
}

// Event listeners
navHomeBtn.addEventListener('click', () => openPage('home'));
navCatalogBtn.addEventListener('click', () => {
  openPage('catalog');
  filterToys();
});
navCartBtn.addEventListener('click', () => {
  openPage('cart');
  renderCartItems();
});

modalCloseBtn.addEventListener('click', closeToyModal);
toyModal.addEventListener('click', (e) => {
  if (e.target === toyModal) closeToyModal();
});

checkoutCloseBtn.addEventListener('click', () => {
  checkoutModal.setAttribute('hidden', '');
});
checkoutDoneBtn.addEventListener('click', () => {
  checkoutModal.setAttribute('hidden', '');
});

checkoutButton.addEventListener('click', () => {
  if (Object.keys(cart).length === 0) {
    alert('Your cart is empty. Please add some toys before checkout.');
    return;
  }
  // Removed showing checkout modal on page load
  checkoutModal.removeAttribute('hidden');
});

searchNameInput.addEventListener('input', filterToys);
filterAgeSelect.addEventListener('change', filterToys);
filterInterestSelect.addEventListener('change', filterToys);
filterCategorySelect.addEventListener('change', filterToys);
filterPriceInput.addEventListener('input', filterToys);
filterGenderSelect.addEventListener('change', filterToys);
clearFiltersBtn.addEventListener('click', clearFilters);

// Category buttons on homepage filter catalog and open catalog page
const categoryButtons = document.querySelectorAll('.category-button');
categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    openPage('catalog');
    filterCategorySelect.value = btn.dataset.category;
    filterToys();
  });
});

// Load toys data
async function loadToysData() {
  try {
    const response = await fetch('data/toys.json');
    if (!response.ok) throw new Error('Failed to load toys data');
    toys = await response.json();
    // Add default skills and safetyNotes if missing
    toys.forEach(toy => {
      if (!toy.skills) toy.skills = [];
      if (!toy.safetyNotes) toy.safetyNotes = '';
    });
    filteredToys = [...toys];
    renderFeaturedToys();
  } catch (err) {
    console.error(err);
    alert('Error loading toys data. Please try again later.');
  }
}

// Initialization
function init() {
  loadCart();
  updateCartCount();
  openPage('home');
  loadToysData();
  // Removed popup on page launch
}

init();
