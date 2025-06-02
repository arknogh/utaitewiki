// Main data array to store all entries
let utacolleData = [];

// DOM Elements
const tableBody = document.getElementById('table-body');
const outputCode = document.getElementById('output-code');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const modalTitle = document.getElementById('modal-title');

// Toast notification container
const toastContainer = document.createElement('div');
toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
document.body.appendChild(toastContainer);

// Button Elements
const loadSampleDataBtn = document.getElementById('load-sample-data');
const clearDataBtn = document.getElementById('clear-data');
const addNewEntryBtn = document.getElementById('add-new-entry');
const generateOutputBtn = document.getElementById('generate-output');
const copyOutputBtn = document.getElementById('copy-output');
const cancelEditBtn = document.getElementById('cancel-edit');

// Form Elements
const editId = document.getElementById('edit-id');
const editRanking = document.getElementById('edit-ranking');
const editSongTitle = document.getElementById('edit-song-title');
const editUtaite = document.getElementById('edit-utaite');
const editWikiPage = document.getElementById('edit-wiki-page');
const editVideoId = document.getElementById('edit-video-id');

// Sample JSON data (already provided in your document)
const sampleData = [
  {
    "ranking": 1,
    "song_title": "Butter-Fly -thanks.ver- 歌ってみた",
    "utaite": "[[つきみぐー、]]",
    "video_id": "sm44324666"
  },
  {
    "ranking": 2,
    "song_title": "アンノウン・マザーグース / wowaka",
    "utaite": "[[結城碧]]",
    "video_id": "sm44350006"
  },
  // Sample entries truncated for brevity - will use full data from JSON
];

// Initialize the application
function init() {
  bindEventListeners();
  updateTable();
}

// Bind all event listeners
function bindEventListeners() {
  loadSampleDataBtn.addEventListener('click', loadSampleData);
  clearDataBtn.addEventListener('click', clearData);
  addNewEntryBtn.addEventListener('click', showAddModal);
  generateOutputBtn.addEventListener('click', generateMediaWikiCode);
  copyOutputBtn.addEventListener('click', copyToClipboard);
  cancelEditBtn.addEventListener('click', hideModal);
  editForm.addEventListener('submit', handleFormSubmit);
}

// Load sample data from the JSON
function loadSampleData() {
  // In a real app, you'd fetch this from a file or API
  // For this demo, we'll use the sample data from above
  try {
    // Start with an empty array
    utacolleData = [];
    
    // Process the sample data
    for (const item of sampleData) {
      const entry = processJsonItem(item);
      utacolleData.push(entry);
    }
    
    // Sort by ranking
    utacolleData.sort((a, b) => a.ranking - b.ranking);
    
    // Update the table
    updateTable();
    
    // Show success message
    showToast('Sample data loaded successfully!', 'success');
  } catch (error) {
    console.error('Error loading sample data:', error);
    showToast('Error loading sample data. Check console for details.', 'error');
  }
}

// Process a JSON item into our internal format
function processJsonItem(item) {
  // Extract utaite name from the [[name]] format
  let utaiteName = item.utaite || '';
  let wikiPageName = '';
  
  // Remove the [[ and ]] and check for pipe format
  if (utaiteName.startsWith('[[') && utaiteName.endsWith(']]')) {
    // Remove the surrounding brackets
    utaiteName = utaiteName.substring(2, utaiteName.length - 2);
    
    // Check if it contains a pipe for wiki format [[WikiPage|DisplayName]]
    if (utaiteName.includes('|')) {
      const parts = utaiteName.split('|');
      wikiPageName = parts[0];
      utaiteName = parts[1];
    }
  }
  
  return {
    id: Date.now() + Math.floor(Math.random() * 1000), // Generate a unique ID
    ranking: item.ranking,
    songTitle: item.song_title,
    utaiteName: utaiteName,
    wikiPageName: wikiPageName,
    videoId: item.video_id
  };
}

// Clear all data
function clearData() {
  if (confirm('Are you sure you want to clear all data?')) {
    utacolleData = [];
    updateTable();
    outputCode.value = '';
    showToast('All data has been cleared', 'info');
  }
}

// Update the table with current data
function updateTable() {
  // Clear existing rows
  tableBody.innerHTML = '';
  
  // Check if we have data
  if (utacolleData.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="6" class="px-4 py-4 text-center text-gray-500">
        No data available. Load sample data or add entries.
      </td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }
  
  // Sort by ranking
  utacolleData.sort((a, b) => a.ranking - b.ranking);
  
  // Add rows for each data item
  utacolleData.forEach(item => {
    const row = document.createElement('tr');
    row.className = 'border-t border-gray-200';
    row.innerHTML = `
      <td class="px-4 py-3 text-sm">${item.ranking}</td>
      <td class="px-4 py-3 text-sm">${escapeHtml(item.songTitle)}</td>
      <td class="px-4 py-3 text-sm">${escapeHtml(item.utaiteName)}</td>
      <td class="px-4 py-3 text-sm">${escapeHtml(item.wikiPageName || '-')}</td>
      <td class="px-4 py-3 text-sm">${escapeHtml(item.videoId)}</td>
      <td class="px-4 py-3 text-sm">
        <button class="edit-btn bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs mr-1" data-id="${item.id}">
          Edit
        </button>
        <button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs" data-id="${item.id}">
          Delete
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
  
  // Add event listeners to the edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      showEditModal(id);
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      deleteEntry(id);
    });
  });
}

// Show the add new entry modal
function showAddModal() {
  modalTitle.textContent = 'Add New Entry';
  editId.value = '';
  editRanking.value = utacolleData.length > 0 ? Math.max(...utacolleData.map(item => item.ranking)) + 1 : 1;
  editSongTitle.value = '';
  editUtaite.value = '';
  editWikiPage.value = '';
  editVideoId.value = '';
  editModal.classList.remove('hidden');
}

// Show the edit modal for a specific entry
function showEditModal(id) {
  const item = utacolleData.find(entry => entry.id.toString() === id);
  if (!item) return;
  
  modalTitle.textContent = 'Edit Entry';
  editId.value = item.id;
  editRanking.value = item.ranking;
  editSongTitle.value = item.songTitle;
  editUtaite.value = item.utaiteName;
  editWikiPage.value = item.wikiPageName || '';
  editVideoId.value = item.videoId;
  editModal.classList.remove('hidden');
}

// Hide the modal
function hideModal() {
  editModal.classList.add('hidden');
}

// Handle form submission (add/edit)
function handleFormSubmit(e) {
  e.preventDefault();
  
  const id = editId.value;
  const newEntry = {
    id: id ? parseInt(id) : Date.now() + Math.floor(Math.random() * 1000),
    ranking: parseInt(editRanking.value),
    songTitle: editSongTitle.value.trim(),
    utaiteName: editUtaite.value.trim(),
    wikiPageName: editWikiPage.value.trim(),
    videoId: editVideoId.value.trim()
  };
  
  if (id) {
    // Edit existing entry
    const index = utacolleData.findIndex(item => item.id.toString() === id);
    if (index !== -1) {
      utacolleData[index] = newEntry;
      showToast(`Entry #${newEntry.ranking} has been updated`, 'success');
    }
  } else {
    // Add new entry
    utacolleData.push(newEntry);
    showToast(`Entry #${newEntry.ranking} has been added`, 'success');
  }
  
  // Update the table and hide the modal
  updateTable();
  hideModal();
}

// Delete an entry
function deleteEntry(id) {
  if (confirm('Are you sure you want to delete this entry?')) {
    const deletedItem = utacolleData.find(item => item.id.toString() === id);
    utacolleData = utacolleData.filter(item => item.id.toString() !== id);
    updateTable();
    showToast(`Entry #${deletedItem?.ranking || 'unknown'} has been deleted`, 'info');
  }
}

// Generate MediaWiki code
function generateMediaWikiCode() {
  if (utacolleData.length === 0) {
    showToast('No data to generate MediaWiki code from. Please add entries first.', 'error');
    return;
  }
  
  // Sort by ranking
  utacolleData.sort((a, b) => a.ranking - b.ranking);
  
  // Start with the table header
  let wikiCode = '{| class="wikitable datatable" data-page-length="100" data-order=\'[[0, "asc"]]\'\n';
  wikiCode += '! 順位\n! 動画タイトル\n! 投稿者\n! 動画リンク\n';
  wikiCode += '|-\n';
  
  // Add each row
  utacolleData.forEach(item => {
    let utaiteCode;
    if (item.wikiPageName) {
      // Has wiki page
      utaiteCode = `[[${item.wikiPageName}|${item.utaiteName}]]`;
    } else {
      // No wiki page
      utaiteCode = `[[${item.utaiteName}]]`;
    }
    
    wikiCode += `{{FUCE|${item.ranking}|${item.songTitle}|${utaiteCode} |${item.videoId}}}\n`;
  });
  
  // Close the table
  wikiCode += '|}';
  
  // Set the output
  outputCode.value = wikiCode;
}

// Copy output to clipboard
function copyToClipboard() {
  if (!outputCode.value) {
    showToast('No output to copy. Generate MediaWiki code first.', 'error');
    return;
  }
  
  outputCode.select();
  document.execCommand('copy');
  showToast('MediaWiki code copied to clipboard!', 'success');
}

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Show toast notification
function showToast(message, type = 'info') {
  // Create toast element
  const toast = document.createElement('div');
  
  // Set classes based on type
  let bgColor, textColor, borderColor;
  switch (type) {
    case 'success':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      borderColor = 'border-green-400';
      break;
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      borderColor = 'border-red-400';
      break;
    case 'warning':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      borderColor = 'border-yellow-400';
      break;
    case 'info':
    default:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      borderColor = 'border-blue-400';
      break;
  }
  
  // Apply classes
  toast.className = `${bgColor} ${textColor} border ${borderColor} px-4 py-3 rounded shadow-md max-w-xs`;
  toast.style.transition = 'all 0.3s ease';
  
  // Set content
  toast.innerHTML = `
    <div class="flex items-center justify-between">
      <span>${message}</span>
      <button class="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none">
        <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
        </svg>
      </button>
    </div>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Add click handler to close button
  toast.querySelector('button').addEventListener('click', () => {
    removeToast(toast);
  });
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    removeToast(toast);
  }, 3000);
}

// Remove toast with animation
function removeToast(toast) {
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(-10px)';
  
  setTimeout(() => {
    toast.remove();
  }, 300);
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);

// For development purposes, loading the sample data
window.addEventListener('load', function() {
  // Fetch the sample data from your JSON file
  fetch('utacolle2024falltop100.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
        // Fall back to sample data
        return { json: () => Promise.resolve(sampleData) };
      }
      return response.json();
    })
    .then(data => {
      sampleData.length = 0;
      sampleData.push(...data);
    })
    .catch(error => {
      console.warn('Could not load JSON file:', error);
      // We already have some sample data defined above, so we can still function
    });
});
