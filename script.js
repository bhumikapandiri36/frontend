const STORAGE_KEY = 'parkingSpaces';
const FILTER_KEY = 'parkingSearchFilters';
const FILTERED_KEY = 'filteredParkingSpaces';
const SELECTED_SPACE_KEY = 'selectedParkingSpace';
const BOOKINGS_KEY = 'parkingBookings';

const staticParkingSpaces = [
  {
    id: 1,
    location: 'Civic Center Garage',
    slots: 5,
    price: 3.5,
    type: 'car',
    description: 'Secure indoor parking close to downtown.',
    available: true,
  },
  {
    id: 2,
    location: 'Harbor Road Lot',
    slots: 3,
    price: 2.9,
    type: 'car',
    description: 'Open-air lot near the harbor.',
    available: true,
  },
  {
    id: 3,
    location: 'Park Lane Deck',
    slots: 2,
    price: 1.8,
    type: 'bike',
    description: 'Covered parking for bikes and scooters.',
    available: true,
  },
  {
    id: 4,
    location: 'Downtown Square',
    slots: 6,
    price: 4.0,
    type: 'car',
    description: 'Prime city center location with easy access.',
    available: true,
  },
];

const staticVehicles = [
  {
    id: 101,
    model: 'Sedan X',
    seats: 4,
    rate: 120,
    type: 'car',
    description: 'Comfortable sedan with climate control and premium sound.',
  },
  {
    id: 102,
    model: 'City Bike',
    seats: 1,
    rate: 40,
    type: 'bike',
    description: 'Perfect for quick city hops and easy parking.',
  },
  {
    id: 103,
    model: 'SUV Plus',
    seats: 6,
    rate: 180,
    type: 'car',
    description: 'Spacious SUV for family rides and long trips.',
  },
];

let selectedSlot = null;

function getParkingSpaces() {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    saveParkingSpaces(staticParkingSpaces);
    return [...staticParkingSpaces];
  }

  try {
    return JSON.parse(storedValue) || [];
  } catch (error) {
    console.error('Failed to load parking spaces', error);
    return [...staticParkingSpaces];
  }
}

function saveParkingSpaces(spaces) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(spaces));
}

function getBookingHistory() {
  const raw = localStorage.getItem(BOOKINGS_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Failed to parse booking history', error);
    return [];
  }
}

function saveBookingHistory(booking) {
  const history = getBookingHistory();
  history.push(booking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(history));
}

function formatPrice(value) {
  return `₹${Number(value).toFixed(2)}/hr`;
}

function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function showToast(message, isError = false) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'toast-error' : ''}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-hidden');
  }, 2400);
  setTimeout(() => {
    toast.remove();
  }, 3200);
}

function filterSpaces(filters) {
  let spaces = getParkingSpaces();
  if (!filters) return spaces;

  if (filters.location) {
    const query = filters.location.trim().toLowerCase();
    if (query) {
      spaces = spaces.filter((space) => {
        return (
          space.location.toLowerCase().includes(query) ||
          space.description.toLowerCase().includes(query)
        );
      });
    }
  }

  if (filters.type && filters.type !== 'all') {
    spaces = spaces.filter((space) => space.type === filters.type);
  }

  return spaces;
}

function saveSearchFilters(filters) {
  localStorage.setItem(FILTER_KEY, JSON.stringify(filters));
}

function getSearchFilters() {
  try {
    return JSON.parse(localStorage.getItem(FILTER_KEY) || '{}');
  } catch (error) {
    return {};
  }
}

function saveFilteredSpaces(spaces) {
  localStorage.setItem(FILTERED_KEY, JSON.stringify(spaces));
}

function getFilteredSpaces() {
  try {
    return JSON.parse(localStorage.getItem(FILTERED_KEY) || 'null');
  } catch (error) {
    return null;
  }
}

function clearFilteredSpaces() {
  localStorage.removeItem(FILTERED_KEY);
}

function selectSpaceForBooking(id) {
  localStorage.setItem(SELECTED_SPACE_KEY, String(id));
}

function getSelectedSpaceId() {
  return Number(localStorage.getItem(SELECTED_SPACE_KEY));
}

function getSelectedSpace() {
  const id = getSelectedSpaceId();
  if (!id) return null;
  return getParkingSpaces().find((space) => space.id === id) || null;
}

function bookSpace(id) {
  const spaces = getParkingSpaces();
  const index = spaces.findIndex((space) => space.id === id);
  if (index === -1) return false;

  const space = spaces[index];
  if (!space.available || space.slots < 1) {
    return false;
  }

  if (space.slots > 1) {
    space.slots -= 1;
  } else {
    space.slots = 0;
    space.available = false;
  }

  spaces[index] = space;
  saveParkingSpaces(spaces);
  saveBookingHistory({
    spaceId: id,
    bookedAt: new Date().toISOString(),
    location: space.location,
    type: space.type,
    price: space.price,
  });
  return true;
}

function submitSearch() {
  const location = document.getElementById('searchLocation')?.value || '';
  const type = document.getElementById('searchType')?.value || 'all';
  const date = document.getElementById('searchDate')?.value || '';
  const time = document.getElementById('searchTime')?.value || '';

  const filters = { location, type, date, time };
  saveSearchFilters(filters);
  clearFilteredSpaces();
  window.location.href = 'parsing.html';
}

function clearSearchInputs() {
  const location = document.getElementById('searchLocation');
  const searchType = document.getElementById('searchType');
  const date = document.getElementById('searchDate');
  const time = document.getElementById('searchTime');

  if (location) location.value = '';
  if (searchType) searchType.value = 'all';
  if (date) date.value = '';
  if (time) time.value = '';

  localStorage.removeItem(FILTER_KEY);
  localStorage.removeItem(FILTERED_KEY);
  showToast('Search filters cleared.');
}

function parseSearchAndRedirect() {
  const filters = getSearchFilters();
  const spaces = filterSpaces(filters);
  saveFilteredSpaces(spaces);
  setTimeout(() => {
    window.location.href = 'vehicle.html';
  }, 420);
}

function renderVehicleCards(vehicles) {
  const container = document.getElementById('vehicleGrid');
  if (!container) return;

  container.innerHTML = vehicles
    .map((vehicle) => `
      <article class="parking-card">
        <div class="card-title">
          <h3>${vehicle.model}</h3>
          <span class="variant-tag available-tag">${capitalize(vehicle.type)}</span>
        </div>
        <p class="card-subtitle">${vehicle.description}</p>
        <div class="card-meta">
          <span><strong>Seats</strong> ${vehicle.seats}</span>
          <span><strong>Rate</strong> ₹${vehicle.rate}/hr</span>
        </div>
      </article>
    `)
    .join('');
}

function renderOwnerSpaceCards(spaces) {
  const container = document.getElementById('ownerSpaceGrid');
  if (!container) return;

  if (!spaces.length) {
    container.innerHTML = '<div class="empty-state"><p>No available owner spaces match your criteria.</p></div>';
    return;
  }

  container.innerHTML = spaces
    .filter((space) => space.available)
    .map((space) => `
      <article class="parking-card">
        <div class="card-title">
          <h3>${space.location}</h3>
          <span class="variant-tag available-tag">Available</span>
        </div>
        <p class="card-subtitle">${space.description}</p>
        <div class="card-meta">
          <span><strong>Slots</strong> ${space.slots}</span>
          <span><strong>Type</strong> ${capitalize(space.type)}</span>
          <span><strong>Price</strong> ${formatPrice(space.price)}</span>
        </div>
        <div class="card-actions">
          <button class="button button-primary" type="button" onclick="selectAndRedirectToConfirm(${space.id})">Book Now</button>
        </div>
      </article>
    `)
    .join('');
}

function selectAndRedirectToConfirm(id) {
  selectSpaceForBooking(id);
  window.location.href = 'confirm.html';
}

function renderParkingSlots(slots) {
  const container = document.getElementById('parkingResults');
  if (!container) return;

  container.innerHTML = slots
    .map((slot) => {
      const status = slot.available ? 'Available' : 'Booked';
      const tagClass = slot.available ? 'available-tag' : 'full-tag';
      const disabled = !slot.available ? 'disabled' : '';
      return `
        <article class="parking-card">
          <div class="card-title">
            <h3>${slot.location}</h3>
            <span class="variant-tag ${tagClass}">${status}</span>
          </div>
          <p class="card-subtitle">${slot.description || 'No details available.'}</p>
          <div class="card-meta">
            <span><strong>${formatPrice(slot.price)}</strong></span>
            <span>${slot.slots} slot(s) left</span>
            <span>${capitalize(slot.type)}</span>
          </div>
          <div class="card-actions">
            <button class="nav-button" type="button" onclick="navigateTo('${slot.location}')">Navigate</button>
            <button class="book-button" type="button" onclick="bookSlot(${slot.id})" ${disabled}>Book slot</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function renderPetrolStations() {
  const container = document.getElementById('petrolResults');
  if (!container) return;

  const petrolStations = [
    {
      id: 1,
      name: 'Ace Fuel Station',
      address: '190 River Road',
      open: 'Open now',
      price: '₹1.25/L',
    },
    {
      id: 2,
      name: 'Greenway Petrol',
      address: '84 Maple Avenue',
      open: 'Open now',
      price: '₹1.29/L',
    },
    {
      id: 3,
      name: 'Sunrise Fuel',
      address: '310 Oak Boulevard',
      open: 'Closes 10PM',
      price: '₹1.27/L',
    },
  ];

  container.innerHTML = petrolStations
    .map(
      (station) => `
        <article class="petrol-card">
          <div class="card-title">
            <h3>${station.name}</h3>
            <span class="variant-tag available-tag">${station.open}</span>
          </div>
          <p class="card-subtitle">${station.address}</p>
          <div class="card-meta">
            <span>${station.price}</span>
            <span>Nearby</span>
          </div>
          <div class="card-actions">
            <button class="nav-button" type="button" onclick="openMap('${station.name} ${station.address}')">Navigate</button>
          </div>
        </article>
      `
    )
    .join('');
}

function updateBookingPanel() {
  const panel = document.getElementById('bookingSummary');
  if (!panel) return;

  if (!selectedSlot) {
    panel.innerHTML = `
      <div class="booking-card">
        <h3>Booking ready</h3>
        <p>Select a parking slot above to reserve it and complete digital payment.</p>
        <button class="payment-button" type="button" disabled>Pay now</button>
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    <div class="booking-card">
      <h3>Confirm your booking</h3>
      <div class="booking-summary">
        <span><strong>Location</strong><strong>${selectedSlot.location}</strong></span>
        <span><strong>Price</strong><strong>${formatPrice(selectedSlot.price)}</strong></span>
        <span><strong>Slots left</strong><strong>${selectedSlot.slots}</strong></span>
        <span><strong>Type</strong><strong>${capitalize(selectedSlot.type)}</strong></span>
      </div>
      <button class="payment-button" type="button" onclick="completePayment()">Pay now</button>
    </div>
  `;
}

function bookSlot(id) {
  const success = bookSpace(id);
  if (!success) return;

  selectedSlot = getParkingSpaces().find((space) => space.id === id);
  renderParkingSlots(getParkingSpaces());
  updateBookingPanel();
  showToast(`Booking confirmed for ${selectedSlot.location}`);
}

function navigateTo(query) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(url, '_blank');
}

function openMap(query) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(url, '_blank');
}

function completePayment() {
  if (!selectedSlot) return;
  alert(`Payment processed for ${selectedSlot.location}. Enjoy your stay!`);
}

function filterParking() {
  const searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const filtered = getParkingSpaces().filter((slot) => {
    return (
      slot.location.toLowerCase().includes(searchValue) ||
      slot.description.toLowerCase().includes(searchValue) ||
      (slot.available ? 'available' : 'booked').includes(searchValue)
    );
  });
  renderParkingSlots(filtered.length ? filtered : getParkingSpaces());
}

function initVehiclePage() {
  renderVehicleCards(staticVehicles);

  const filters = getFilteredSpaces();
  const availableSpaces = filters && filters.length ? filters.filter((space) => space.available) : getParkingSpaces().filter((space) => space.available);
  renderOwnerSpaceCards(availableSpaces);

  const input = document.getElementById('vehiclesSearchInput');
  const typeFilter = document.getElementById('vehiclesTypeFilter');
  if (input) {
    input.addEventListener('input', () => updateVehicleView(input.value, typeFilter?.value || 'all'));
  }
  if (typeFilter) {
    typeFilter.addEventListener('change', () => updateVehicleView(input?.value || '', typeFilter.value));
  }
}

function updateVehicleView(searchText, vehicleType) {
  const baseSpaces = getFilteredSpaces() || getParkingSpaces();
  let results = baseSpaces.filter((space) => space.available);

  if (vehicleType && vehicleType !== 'all') {
    results = results.filter((space) => space.type === vehicleType);
  }
  if (searchText) {
    const query = searchText.trim().toLowerCase();
    results = results.filter((space) => {
      return space.location.toLowerCase().includes(query) || space.description.toLowerCase().includes(query);
    });
  }

  renderOwnerSpaceCards(results);
}

function renderConfirmationPanel() {
  const panel = document.getElementById('confirmationPanel');
  if (!panel) return;

  const booking = getSelectedSpace();
  if (!booking) {
    panel.innerHTML = `
      <div class="hero-card">
        <h2>Nothing selected</h2>
        <p class="section-intro">Go back to search and choose a parking space to confirm your booking.</p>
        <div class="card-actions">
          <button class="button button-secondary" type="button" onclick="window.location.href='search.html'">Search again</button>
        </div>
      </div>
    `;
    return;
  }

  panel.innerHTML = `
    <div class="hero-card">
      <span class="eyebrow">Booking summary</span>
      <h2>${booking.location}</h2>
      <p class="section-intro">Review your selected space and confirm to reserve it instantly.</p>
      <div class="booking-card">
        <div class="booking-summary">
          <span><strong>Location</strong><strong>${booking.location}</strong></span>
          <span><strong>Type</strong><strong>${capitalize(booking.type)}</strong></span>
          <span><strong>Slots left</strong><strong>${booking.slots}</strong></span>
          <span><strong>Price</strong><strong>${formatPrice(booking.price)}</strong></span>
        </div>
        <div class="card-actions">
          <button class="button button-secondary" type="button" onclick="window.location.href='vehicle.html'">Back to spaces</button>
          <button class="button button-primary" type="button" onclick="confirmBooking()">Confirm booking</button>
        </div>
      </div>
    </div>
  `;
}

function confirmBooking() {
  const space = getSelectedSpace();
  if (!space) return;

  const success = bookSpace(space.id);
  if (!success) {
    showToast('Unable to confirm booking. Space may no longer be available.', true);
    return;
  }

  showToast('Booking confirmed and saved.', false);
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 700);
}

function initCommonPage() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterParking);
  }

  if (document.getElementById('vehicleGrid')) {
    initVehiclePage();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('parkingResults')) {
    renderParkingSlots(getParkingSpaces());
    updateBookingPanel();
  }

  if (document.getElementById('petrolResults')) {
    renderPetrolStations();
  }

  initCommonPage();
});
