// Create a hidden file input element
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.json';
fileInput.style.display = 'none';
fileInput.id = 'json-file-input';
document.body.appendChild(fileInput);

// Create import button
function createImportButton() {
  // Find the container where the Load Sample Data button is
  const importContainer = document.querySelector('#load-sample-data').parentElement;
  
  // Create the import button
  const importButton = document.createElement('button');
  importButton.id = 'import-json';
  importButton.className = 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded';
  importButton.textContent = 'Import JSON';
  
  // Add it to the container
  importContainer.appendChild(importButton);
  
  // Add event listener
  importButton.addEventListener('click', () => {
    fileInput.click();
  });
}

// Handle file selection
fileInput.addEventListener('change', function(event) {
  const file = event.target.files[0];
  
  if (file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      try {
        const jsonData = JSON.parse(e.target.result);
        importJsonData(jsonData);
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        showToast('Error parsing JSON file. Please make sure it\'s valid JSON.', 'error');
      }
    };
    
    reader.onerror = function() {
      showToast('Error reading file. Please try again.', 'error');
    };
    
    reader.readAsText(file);
  }
  
  // Reset file input so the same file can be selected again
  fileInput.value = '';
});

// Import JSON data
function importJsonData(jsonData) {
  try {
    // Validate data structure
    if (!Array.isArray(jsonData)) {
      showToast('Invalid JSON format. Expected an array of entries.', 'error');
      return;
    }
    
    // Check if file has the expected structure
    const hasValidStructure = jsonData.every(item => 
      item.hasOwnProperty('ranking') && 
      item.hasOwnProperty('song_title') && 
      item.hasOwnProperty('utaite') && 
      item.hasOwnProperty('video_id')
    );
    
    if (!hasValidStructure) {
      showToast('Invalid JSON format. Missing required fields in some entries.', 'error');
      return;
    }
    
    // Clear current data if there are any items in the JSON
    if (jsonData.length > 0) {
      utacolleData = [];
    }
    
    // Process the data
    for (const item of jsonData) {
      const entry = processJsonItem(item);
      utacolleData.push(entry);
    }
    
    // Sort by ranking
    utacolleData.sort((a, b) => a.ranking - b.ranking);
    
    // Update the table
    updateTable();
    
    // Show success message
    showToast(`Successfully imported ${jsonData.length} entries from JSON file.`, 'success');
  } catch (error) {
    console.error('Error importing JSON data:', error);
    showToast('Error importing JSON data. Check console for details.', 'error');
  }
}

// Initialize the import button when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  createImportButton();
});
