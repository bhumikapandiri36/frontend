document.addEventListener('DOMContentLoaded', initOwnerDashboard);

let editingSpaceId = null;

function initOwnerDashboard() {
  renderOwnerStatistics();
  renderOwnerListings();

  const form = document.getElementById('ownerForm');
  const resetButton = document.getElementById('resetButton');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      saveOwnerSpace();
    });
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      resetOwnerForm();
      showToast('Form cleared. Ready for a new listing.');
    });
  }
}

function saveOwnerSpace() {
  const locationInput = document.getElementById('locationInput');
  const slotsInput = document.getElementById('slotsInput');
  const priceInput = document.getElementById('priceInput');
  const typeInput = document.getElementById('typeInput');
  const descriptionInput = document.getElementById('descriptionInput');

  if (!locationInput || !slotsInput || !priceInput || !typeInput || !descriptionInput) {
    return;
  }

  const newSpace = {
    id: editingSpaceId || generateUniqueId(),
    location: locationInput.value.trim(),
    slots: Math.max(1, Number(slotsInput.value)),
    price: Number(priceInput.value),
    type: typeInput.value,
    description: descriptionInput.value.trim(),
    available: true,
  };

  if (!newSpace.location) {
    showToast('Please add a valid location.', true);
    return;
  }

  const spaces = getParkingSpaces();

  if (editingSpaceId) {
    const index = spaces.findIndex((space) => space.id === editingSpaceId);
    if (index !== -1) {
      spaces[index] = { ...spaces[index], ...newSpace, available: spaces[index].available };
    }
    showToast('Space updated successfully.');
  } else {
    spaces.unshift(newSpace);
    showToast('Space added successfully.');
  }

  saveParkingSpaces(spaces);
  resetOwnerForm();
  renderOwnerListings();
  renderOwnerStatistics();
}

function renderOwnerListings() {
  const listings = document.getElementById('ownerListings');
  if (!listings) return;

  const spaces = getParkingSpaces();

  if (!spaces.length) {
    listings.innerHTML = '<div class="empty-state"><p>No parking spaces listed yet. Add one to begin.</p></div>';
    return;
  }

  listings.innerHTML = spaces
    .map((space) => {
      const statusLabel = space.available ? 'Available' : 'Booked';
      const statusClass = space.available ? 'available-tag' : 'full-tag';
      const availabilityText = space.available ? `Slots: ${space.slots}` : 'Booked';
      const secondaryButton = space.available ? 'Mark as booked' : 'Mark available';

      return `
        <article class="parking-card">
          <div class="card-title">
            <h3>${space.location}</h3>
            <span class="variant-tag ${statusClass}">${statusLabel}</span>
          </div>
          <p class="card-subtitle">${space.description || 'No description provided.'}</p>
          <div class="card-meta">
            <span><strong>Slots</strong> ${availabilityText}</span>
            <span><strong>Price</strong> ${formatPrice(space.price)}</span>
            <span><strong>Type</strong> ${capitalize(space.type)}</span>
          </div>
          <div class="card-actions">
            <button class="button button-secondary" type="button" onclick="editOwnerSpace(${space.id})">Edit</button>
            <button class="button button-secondary" type="button" onclick="deleteOwnerSpace(${space.id})">Delete</button>
            <button class="button button-primary" type="button" onclick="toggleSpaceAvailability(${space.id})">${secondaryButton}</button>
          </div>
        </article>
      `;
    })
    .join('');
}

function editOwnerSpace(id) {
  const space = getParkingSpaces().find((item) => item.id === id);
  if (!space) return;

  editingSpaceId = id;
  document.getElementById('locationInput').value = space.location;
  document.getElementById('slotsInput').value = space.slots;
  document.getElementById('priceInput').value = space.price;
  document.getElementById('typeInput').value = space.type;
  document.getElementById('descriptionInput').value = space.description;
  showToast('Editing mode enabled for selected space.');
}

function deleteOwnerSpace(id) {
  const confirmDelete = window.confirm('Remove this space from your listings?');
  if (!confirmDelete) return;

  const spaces = getParkingSpaces().filter((space) => space.id !== id);
  saveParkingSpaces(spaces);
  renderOwnerListings();
  renderOwnerStatistics();
  showToast('Space deleted successfully.');
}

function toggleSpaceAvailability(id) {
  const spaces = getParkingSpaces();
  const index = spaces.findIndex((space) => space.id === id);
  if (index === -1) return;

  spaces[index].available = !spaces[index].available;
  if (spaces[index].available && spaces[index].slots < 1) {
    spaces[index].slots = 1;
  }
  saveParkingSpaces(spaces);
  renderOwnerListings();
  renderOwnerStatistics();
  showToast(spaces[index].available ? 'Space marked available.' : 'Space marked booked.');
}

function resetOwnerForm() {
  editingSpaceId = null;
  document.getElementById('ownerForm').reset();
  document.getElementById('typeInput').value = 'car';
}

function renderOwnerStatistics() {
  const spaces = getParkingSpaces();
  const bookings = getBookingHistory();

  document.getElementById('totalListings').textContent = spaces.length;
  document.getElementById('availableCount').textContent = spaces.filter((space) => space.available).reduce((sum, space) => sum + space.slots, 0);
  document.getElementById('bookingCount').textContent = bookings.length;
  document.getElementById('totalEarnings').textContent = `₹${bookings.reduce((sum, item) => sum + Number(item.price), 0).toFixed(2)}`;
}

function generateUniqueId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}
