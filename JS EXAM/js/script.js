const KEY = 'bakeryProducts_v2';
const FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#DDE9C9"/><text x="200" y="165" font-size="60" text-anchor="middle">🥐</text></svg>',
  );
const SEED = [
  {
    id: 1,
    title: 'Butter Croissant',
    price: 80,
    image: 'images/croissant.jpg',
    category: 'Pastry',
  },
  {
    id: 2,
    title: 'Berry Cheesecake',
    price: 720,
    image: 'images/cheesecake.jpg',
    category: 'Dessert',
  },
  {
    id: 3,
    title: 'Chocolate Walnut Cake',
    price: 650,
    image: 'images/choco-walnut-cake.jpg',
    category: 'Cake',
  },
  {
    id: 4,
    title: 'Chocolate Mousse Cake',
    price: 700,
    image: 'images/mousse-cake.jpg',
    category: 'Cake',
  },
  {
    id: 5,
    title: 'Glazed Donuts (3 pcs)',
    price: 180,
    image: 'images/donuts.jpg',
    category: 'Pastry',
  },
  {
    id: 6,
    title: 'Breakfast Croissant Platter',
    price: 350,
    image: 'images/breakfast-platter.jpg',
    category: 'Pastry',
  },
  {
    id: 7,
    title: 'Caramel Chocolate Slice',
    price: 160,
    image: 'images/caramel-slice.jpg',
    category: 'Dessert',
  },
  {
    id: 8,
    title: 'Walnut Caramel Cake',
    price: 780,
    image: 'images/walnut-caramel-cake.jpg',
    category: 'Cake',
  },
  {
    id: 9,
    title: 'Marble Bundt Cake',
    price: 450,
    image: 'images/marble-bundt.jpg',
    category: 'Cake',
  },
  {
    id: 10,
    title: 'Strawberry Red Velvet',
    price: 550,
    image: 'images/strawberry-cake.jpg',
    category: 'Dessert',
  },
];

// ---------- Local storage ----------
function loadProducts() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(data)) return data;
  } catch (e) {}
  saveProducts(SEED);
  return [...SEED];
}
function saveProducts(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

let products = loadProducts();
let editingId = null;
const $ = (id) => document.getElementById(id);
const isManage = !!$('productForm');

// ---------- Display ----------
function addProductToList(p, container) {
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `<img src="${p.image || FALLBACK}" alt="">
    <div class="body"><span class="tag"></span><h3></h3><p class="price">₹${Number(p.price).toFixed(2)}</p>
    ${isManage ? '<div class="actions"><button class="btn sm ghost" data-edit>Edit</button><button class="btn sm del" data-del>Delete</button></div>' : ''}</div>`;
  card.querySelector('img').onerror = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK;
  };
  card.querySelector('img').alt = p.title;
  card.querySelector('.tag').textContent = p.category; // textContent avoids HTML injection
  card.querySelector('h3').textContent = p.title;
  if (isManage) {
    card.querySelector('[data-edit]').onclick = () => editProduct(p.id);
    card.querySelector('[data-del]').onclick = () => deleteProduct(p.id);
  }
  container.appendChild(card);
}

function render() {
  const box = $('productList');
  if (!box) return;
  const q = $('search').value.trim().toLowerCase(),
    cat = $('category').value,
    sort = $('sort').value;
  let list = products.filter(
    (p) => p.title.toLowerCase().includes(q) && (!cat || p.category === cat),
  );
  if (sort === 'asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'desc') list.sort((a, b) => b.price - a.price);
  box.innerHTML = '';
  if (!list.length)
    box.innerHTML =
      '<p class="empty">No products match. Try a different search or add a new product.</p>';
  list.forEach((p) => addProductToList(p, box));
}

function fillCategories() {
  const sel = $('category');
  if (!sel) return;
  const current = sel.value;
  const cats = [...new Set(products.map((p) => p.category))];
  sel.innerHTML =
    '<option value="">All categories</option>' +
    cats.map((c) => `<option>${c}</option>`).join('');
  sel.value = cats.includes(current) ? current : '';
}

// ---------- CRUD ----------
function addProduct() {
  const title = $('title').value.trim(),
    price = parseFloat($('price').value);
  if (!title || isNaN(price) || price < 0) {
    $('error').textContent = 'Enter a product title and a valid price.';
    return;
  }
  const product = {
    id: editingId ?? Date.now(),
    title,
    price,
    image: $('image').value.trim(),
    category: $('formCategory').value,
  };
  if (editingId !== null)
    products = products.map((p) => (p.id === editingId ? product : p));
  else products.push(product);
  saveProducts(products);
  resetForm();
  fillCategories();
  render();
}

function editProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) return;
  editingId = id;
  $('title').value = p.title;
  $('price').value = p.price;
  $('image').value = p.image;
  $('formCategory').value = p.category;
  $('formTitle').textContent = 'Edit product';
  $('submitBtn').textContent = 'Save changes';
  $('cancelBtn').hidden = false;
  $('productForm').scrollIntoView({ behavior: 'smooth' });
}

function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  products = products.filter((p) => p.id !== id);
  saveProducts(products);
  fillCategories();
  render();
}

function resetForm() {
  $('productForm').reset();
  $('error').textContent = '';
  editingId = null;
  $('formTitle').textContent = 'Add a product';
  $('submitBtn').textContent = 'Add product';
  $('cancelBtn').hidden = true;
}

// ---------- Init ----------
document.querySelectorAll('.nav nav a').forEach((a) => {
  if (
    location.pathname.endsWith(a.getAttribute('href')) ||
    (a.dataset.p === 'index' && /\/$/.test(location.pathname))
  )
    a.classList.add('on');
});
if (isManage) {
  $('productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addProduct();
  });
  $('cancelBtn').onclick = resetForm;
}
['search', 'category', 'sort'].forEach(
  (id) => $(id) && $(id).addEventListener('input', render),
);
fillCategories();
render();
if ($('featured'))
  products.slice(0, 4).forEach((p) => addProductToList(p, $('featured')));
