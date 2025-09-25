// Set your Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWpzdWplIiwiYSI6ImNtYWZscGlteDA0Mmwya3B6OTI0dzN6cDUifQ.0uD3Qj3xyq3IsF1ziZ1ZyQ';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-73.989723, 40.741112], // Manhattan
  zoom: 12
});

// List of cafes backend update
let cafes = [];

fetch('/api/cafes')
  .then(res => res.json())
  .then(data => {
    cafes = data;
    displayMarkers(cafes);
  })
  .catch(err => {
    console.error("Failed to load cafes:", err);
    alert("Error loading cafe data.");
  });

// Store marker objects to control them later
let markers = [];

// Create and display markers on the map
function displayMarkers(filteredCafes) {
  // Remove existing markers
  markers.forEach(marker => marker.remove());
  markers = [];

  filteredCafes.forEach(cafe => {
    const el = document.createElement('div');
    el.className = 'custom-pin';
    el.innerHTML = `
      <div class="pin-container">
        <img src="${cafe.logo}" alt="${cafe.name} Logo" />
      </div>
    `;

    const marker = new mapboxgl.Marker(el)
      .setLngLat(cafe.coords)
      .setPopup(new mapboxgl.Popup().setHTML(createPopupHTML(cafe)))
      .addTo(map);

    markers.push(marker);
  });
}

// Generate popup HTML
function createPopupHTML(cafe) {
  return `
    <div class="popup-card">
      <div class="popup-header">
        <div class="logo-frame">
          <img src="${cafe.logo}" alt="${cafe.name} logo" class="popup-logo"/>
        </div>
        <h3 class="popup-name">${cafe.name}</h3>
      </div>
      <p class="popup-review">"${cafe.founderReview}"</p>
      <div class="popup-meta">
        <span class="popup-rating">⭐ ${cafe.rating}/5</span>
        <div class="popup-tags">
          ${cafe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

// Initially show all cafes
displayMarkers(cafes);

// Tag toggle logic
const tagOptions = document.querySelectorAll('.tag-option');
const applyBtn = document.getElementById('applyFilters');
const filterModal = document.getElementById('filterModal');
 const filterBtn = document.getElementById('filterBtn'); 

const addCafeBtn = document.getElementById('addCafeBtn');
const addCafeModal = document.getElementById('addCafeModal');
const addCafeForm = document.getElementById('addCafeForm');

// Toggle modal
 filterBtn.addEventListener('click', () => {
  filterModal.classList.toggle('hidden');
 });

// Toggle tag selection
tagOptions.forEach(option => {
  option.addEventListener('click', () => {
    option.classList.toggle('selected');
  });
});

// Apply filter logic
function applyFilters() {
    const selectedTags = Array.from(document.querySelectorAll('.tag-option.selected'))
                              .map(el => el.dataset.tag);
  
    const filtered = selectedTags.length === 0
      ? cafes // if no filters, show all
      : cafes.filter(cafe =>
          selectedTags.every(tag => cafe.tags.includes(tag))
        );
  
    displayMarkers(filtered);
  }
  
  
// Close modal if clicking outside modal-content
filterModal.addEventListener('click', (event) => {
    if (!event.target.closest('.modal-content')) {
      filterModal.classList.add('hidden');
      applyFilters();
    }
  });
  
  // Close on Escape key
  addCafeModal.addEventListener('click', (event) => {
    if (!event.target.closest('.modal-content')) {
      addCafeModal.classList.add('hidden');
    }
  });
  
  // Show modal
  addCafeBtn.addEventListener('click', () => {
    addCafeModal.classList.remove('hidden');
  });
  
  // Close on outside click
  addCafeModal.addEventListener('click', (e) => {
    if (!e.target.closest('.modal-content')) {
      addCafeModal.classList.add('hidden');
    }
  });
  
  
  // Handle form submission
  addCafeForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const name = document.getElementById('cafeName').value;
    const address = document.getElementById('cafeAddress').value;
    const review = document.getElementById('cafeReview').value;
    const rating = parseFloat(document.getElementById('cafeRating').value);
    const tags = Array.from(addCafeForm.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    const logo = document.getElementById('cafeLogo').value;

  
    // Use Mapbox Geocoding API to convert address to coordinates
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`)
      .then(res => res.json())
      .then(data => {
        if (!data.features.length) {
          alert("Could not find location. Try a more specific address.");
          return;
        }
  
        const [lng, lat] = data.features[0].center;
  
        const newCafe = {
          name,
          coords: [lng, lat],
          founderReview: review,
          rating,
          tags, 
          logo
        };
  
        fetch('/api/cafes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCafe)
        })
        .then(res => {
          if (!res.ok) throw new Error('Failed to save cafe');
          cafes.push(newCafe);
          displayMarkers(cafes);
          addCafeForm.reset();
          addCafeModal.classList.add('hidden');
        })
        .catch(err => alert("Error saving cafe: " + err.message));        
  
  
      })
      .catch(err => {
        console.error("❌ Fetch failed:", err);
        alert("Error loading cafe data: " + err.message);
      });      
  });
  
  
