const parkingSlots = [
  {
    id: 1,
    name: 'Civic Center Garage',
    address: '5th Ave & Main Street',
    status: 'Available',
    price: '₹3.50/hr',
    distance: '0.8 km',
    eta: '4 min',
  },
  {
    id: 2,
    name: 'Harbor Road Lot',
    address: 'Harbor Rd near Terminal',
    status: 'Full',
    price: '₹2.90/hr',
    distance: '1.2 km',
    eta: '7 min',
  },
  {
    id: 3,
    name: 'Park Lane Deck',
    address: 'Park Ln & Elm Street',
    status: 'Available',
    price: '₹4.00/hr',
    distance: '1.6 km',
    eta: '9 min',
  },
  {
    id: 4,
    name: 'Downtown Square',
    address: 'Market Square Center',
    status: 'Available',
    price: '₹3.20/hr',
    distance: '0.5 km',
    eta: '3 min',
  },
];

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

let selectedSlot = null;

function renderParkingSlots(slots) {
  const container = document.getElementById('parkingResults');
  if (!container) return;

  container.innerHTML = slots
    .map((slot) => {
      const tagClass = slot.status === 'Available' ? 'available-tag' : 'full-tag';
      const disabled = slot.status !== 'Available' ? 'disabled' : '';
      return `
        <article class="parking-card">
          <div class="card-title">
            <h3>${slot.name}</h3>
            <span class="variant-tag ${tagClass}">${slot.status}</span>
          </div>
          <p class="card-subtitle">${slot.address}</p>
          <div class="card-meta">
            <span><strong>${slot.price}</strong></span>
            <span>${slot.distance}</span>
            <span>${slot.eta} drive</span>
          </div>
          <div class="card-actions">
            <button class="nav-button" type="button" onclick="navigateTo(${slot.id})">Navigate</button>
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
        <span><strong>Location</strong><strong>${selectedSlot.name}</strong></span>
        <span><strong>Address</strong><strong>${selectedSlot.address}</strong></span>
        <span><strong>Price</strong><strong>${selectedSlot.price}</strong></span>
        <span><strong>ETA</strong><strong>${selectedSlot.eta}</strong></span>
      </div>
      <button class="payment-button" type="button" onclick="completePayment()">Pay $0.00</button>
    </div>
  `;
}

function bookSlot(id) {
  const slot = parkingSlots.find((item) => item.id === id);
  if (!slot || slot.status !== 'Available') return;

  selectedSlot = slot;
  slot.status = 'Booked';
  renderParkingSlots(parkingSlots);
  updateBookingPanel();
  setTimeout(() => {
    alert(`Booking confirmed for ${slot.name}`);
  }, 120);
}

function navigateTo(id) {
  const slot = parkingSlots.find((item) => item.id === id);
  if (!slot) return;
  openMap(`${slot.name} ${slot.address}`);
}

function openMap(query) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(url, '_blank');
}

function completePayment() {
  if (!selectedSlot) return;
  alert(`Payment processed for ${selectedSlot.name}. Enjoy your stay!`);
}

function filterParking() {
  const searchValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const filtered = parkingSlots.filter((slot) => {
    return (
      slot.name.toLowerCase().includes(searchValue) ||
      slot.address.toLowerCase().includes(searchValue) ||
      slot.status.toLowerCase().includes(searchValue)
    );
  });
  renderParkingSlots(filtered.length ? filtered : parkingSlots);
}

window.addEventListener('DOMContentLoaded', () => {
  renderParkingSlots(parkingSlots);
  renderPetrolStations();
  updateBookingPanel();
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterParking);
  }
});
