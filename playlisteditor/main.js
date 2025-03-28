document.addEventListener('DOMContentLoaded', function() {
    // Add toaster container to HTML
    const toasterContainer = document.createElement('div');
    toasterContainer.id = 'toaster-container';
    toasterContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(toasterContainer);

    // Toast notification function
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        const toastId = 'toast-' + Date.now();
        toast.id = toastId;
        
        // Set toast classes based on type
        let bgColor, textColor, borderColor;
        switch (type) {
            case 'success':
                bgColor = 'bg-green-100';
                textColor = 'text-green-800';
                borderColor = 'border-green-500';
                break;
            case 'error':
                bgColor = 'bg-red-100';
                textColor = 'text-red-800';
                borderColor = 'border-red-500';
                break;
            case 'warning':
                bgColor = 'bg-yellow-100';
                textColor = 'text-yellow-800'; 
                borderColor = 'border-yellow-500';
                break;
            default:
                bgColor = 'bg-blue-100';
                textColor = 'text-blue-800';
                borderColor = 'border-blue-500';
        }
        
        toast.className = `${bgColor} ${textColor} ${borderColor} px-4 py-3 rounded-md shadow-md border-l-4 transform transition-all duration-300 ease-in-out opacity-0 translate-x-full w-72`;
        toast.innerHTML = `
            <div class="flex justify-between items-center">
                <span>${message}</span>
                <button class="ml-2 text-gray-600 hover:text-gray-800 focus:outline-none" onclick="document.getElementById('${toastId}').remove()">
                    &times;
                </button>
            </div>
        `;
        
        toasterContainer.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('opacity-0', 'translate-x-full');
        }, 10);
        
        // Animate out and remove after duration
        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-x-full');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    // Data store
    let playlist = [];
    let nextId = 1;
    
    // DOM elements
    //const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    //const parseBtn = document.getElementById('parse-btn');
    const addBtn = document.getElementById('add-btn');
    const importRawBtn = document.getElementById('import-raw-btn');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    // const clearInputBtn = document.getElementById('clear-input-btn');
    const clearOutputBtn = document.getElementById('clear-output-btn');
    const playlistTable = document.getElementById('playlist-table');
    const entryModal = document.getElementById('entry-modal');
    const modalTitle = document.getElementById('modal-title');
    const entryForm = document.getElementById('entry-form');
    const entryId = document.getElementById('entry-id');
    const entryNumber = document.getElementById('entry-number');
    const entryTitle = document.getElementById('entry-title');
    const entryYoutube = document.getElementById('entry-youtube');
    const entryNnd = document.getElementById('entry-nnd');
    const entryDate = document.getElementById('entry-date');
    const entryAdditional = document.getElementById('entry-additional');
    const modalCancel = document.getElementById('modal-cancel');
    const deleteModal = document.getElementById('delete-modal');
    const deleteEntryId = document.getElementById('delete-entry-id');
    const deleteCancel = document.getElementById('delete-cancel');
    const deleteConfirm = document.getElementById('delete-confirm');
    const searchInput = document.getElementById('search-input');
    const yearFilter = document.getElementById('year-filter');
    const resetFilterBtn = document.getElementById('reset-filter-btn');
    const rawDataModal = document.getElementById('raw-data-modal');
    const rawDataInput = document.getElementById('raw-data-input');
    const rawDataCancel = document.getElementById('raw-data-cancel');
    const rawDataImport = document.getElementById('raw-data-import');
    
    // Parse raw playlist data from the provided text
    parseInitialPlaylist();
    
    // Event Listeners
    // parseBtn.addEventListener('click', parseEntry);
    addBtn.addEventListener('click', openAddModal);
    importRawBtn.addEventListener('click', openRawDataModal);
    generateBtn.addEventListener('click', generateOutput);
    copyBtn.addEventListener('click', copyToClipboard);
    // clearInputBtn.addEventListener('click', () => { 
    //     inputText.value = ''; 
    //     showToast('Input cleared', 'info');
    // });
    clearOutputBtn.addEventListener('click', () => { 
        outputText.value = ''; 
        showToast('Output cleared', 'info');
    });
    entryForm.addEventListener('submit', saveEntry);
    modalCancel.addEventListener('click', closeModal);
    deleteCancel.addEventListener('click', closeDeleteModal);
    deleteConfirm.addEventListener('click', confirmDelete);
    searchInput.addEventListener('input', filterEntries);
    yearFilter.addEventListener('change', filterEntries);
    resetFilterBtn.addEventListener('click', resetFilters);
    rawDataCancel.addEventListener('click', closeRawDataModal);
    rawDataImport.addEventListener('click', importRawData);
    
    const resetAllBtn = document.getElementById('reset-all-btn');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', resetAll);
    } else {
        console.error("Element with id 'reset-all-btn' not found");
    }
    
    // Parse initial playlist
    function parseInitialPlaylist() {
        const playlistData = `{{Playlist|content = 
# "Connecting❀Flowers' edition" {{nnd|sm26349261}} feat. [[Izu]], [[Houkago no Aitsu]], Wolpis Kater, [[Ikasan]], [[Mikaru]], [[Risru]], [[Kyaren.]] and [[Kurokumo]] (2015.05.27)
# "Sore ga Anata no Shiawase to Shite mo" {{nnd|sm26442500}} (Even if that is Your Happiness) (2015.06.10)
# "Rokuchounen to Ichiya Monogatari" {{nnd|sm26582278}} (Six Trillion Years and Overnight Story) (2015.06.27)
# "Balleriko" {{nnd|sm26802476}} (Ballerina Girl) (2015.07.28)
# "Logic Agent" {{nnd|sm26860572}} (2015.08.05)
# "Souzou Forest" {{nnd|sm26918252}} (Imagination Forest) (Entry of [[Utattemita Tours/2015#KagePro Utattemita Tour|KagePro Utattemita Tour]]) (2015.08.16)
# "Kuusou Ressha" {{yt|gcCqclvIcn4}} {{nnd|sm27099984}} (Sky Symphony Train) (2015.09.06)
# "Kokoronashi" {{nnd|sm27216963}} (No Heart) (2015.09.23)
# "Hana Fubuki" {{nnd|sm27286744}} ([[wikipedia:Touken Ranbu|Touken Ranbu]] song; Original Song with {{VW|PolyphonicBranch}}) (2015.10.03)
# "Sekai wo Kowashite Iru" {{nnd|sm27333213}} (Terminating the World) (2015.10.10)

}}`;

        const lines = playlistData.split('\n');
        // Skip the first line and the last line (playlist template start/end)
        for (let i = 1; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#')) {
                try {
                    const entry = parseEntryLine(line);
                    if (entry) {
                        entry.id = nextId++;
                        playlist.push(entry);
                    }
                } catch (e) {
                    console.error(`Error parsing line ${i + 1}: ${line}`, e);
                }
            }
        }
        
        renderTable();
        populateYearFilter();
        showToast('Playlist data loaded successfully', 'success');
    }
    
    // Parse entry line function
    function parseEntryLine(line) {
        if (!line.startsWith('#')) {
            throw new Error('Entry must start with #');
        }
        
        // Basic structure
        const entry = {
            number: 0,
            title: '',
            youtube: '',
            nnd: '',
            date: '',
            additional: ''
        };
        
        // Extract number
        const numberMatch = line.match(/^#\s*(\d+)?/);
        if (numberMatch && numberMatch[1]) {
            entry.number = parseInt(numberMatch[1]);
        } else {
            // Extract the number from the position in the list
            entry.number = line.startsWith('# ') ? playlist.length + 1 : 0;
        }
        
        // Remove the number part
        let content = line.replace(/^#\s*(\d+)?\s*/, '').trim();
        
        // Extract title
        let titleMatch;
        if (content.startsWith('"') && (titleMatch = content.match(/^"([^"]+)"/))) {
            entry.title = titleMatch[1];
            content = content.substring(titleMatch[0].length).trim();
        } else if (content.startsWith('[') && (titleMatch = content.match(/^\[([^\]]+)\s+([^\]]+)\]/))) {
            // Handle link format [https://youtu.be/ygKLcVPYpcY Jigsaw Puzzle]
            const linkParts = titleMatch[1].split(' ');
            const url = linkParts[0];
            entry.title = titleMatch[2];
            
            // Extract YouTube ID from URL
            const ytIdMatch = url.match(/youtu\.be\/([^?&]+)|youtube\.com\/watch\?v=([^&]+)/);
            if (ytIdMatch) {
                entry.youtube = ytIdMatch[1] || ytIdMatch[2];
            }
            
            content = content.substring(titleMatch[0].length).trim();
        }
        
        // Extract YouTube ID
        const ytMatch = content.match(/{{yt\|([^}]+)}}/);
        if (ytMatch) {
            entry.youtube = ytMatch[1];
            content = content.replace(ytMatch[0], '').trim();
        }
        
        // Extract NND ID
        const nndMatch = content.match(/{{nnd\|([^}]+)}}/);
        if (nndMatch) {
            entry.nnd = nndMatch[1];
            content = content.replace(nndMatch[0], '').trim();
        }
        
        // Extract date (YYYY.MM.DD)
        const dateMatch = content.match(/\((\d{4}\.\d{2}\.\d{2})\)/);
        if (dateMatch) {
            entry.date = dateMatch[1];
            content = content.replace(dateMatch[0], '').trim();
        }
        
        // Extract date with non-standard format
        if (!entry.date) {
            const altDateMatch = content.match(/\((\d{4})[.-](\d{1,2})[.-](\d{1,2})\)/);
            if (altDateMatch) {
                const year = altDateMatch[1];
                const month = altDateMatch[2].padStart(2, '0');
                const day = altDateMatch[3].padStart(2, '0');
                entry.date = `${year}.${month}.${day}`;
                content = content.replace(altDateMatch[0], '').trim();
            }
        }
        
        // Handle community only tag
        if (content.includes("'''(Community only)'''")) {
            entry.additional += "(Community only) ";
            content = content.replace("'''(Community only)'''", '').trim();
        }
        
        // Process remaining content for additional info
        if (content) {
            // Handle feat. pattern
            const featMatch = content.match(/feat\.\s+(.+?)(?:\s+\(\d{4}|\s*$)/i);
            if (featMatch) {
                entry.additional += `feat. ${featMatch[1]} `;
                content = content.replace(featMatch[0], '').trim();
            }
            
            // Handle translations in parentheses
            const translationMatch = content.match(/\(([^)]+)\)(?!\s*\(\d{4})/);
            if (translationMatch) {
                entry.additional += `(${translationMatch[1]}) `;
                content = content.replace(translationMatch[0], '').trim();
            }
            
            // Add any remaining content
            if (content) {
                entry.additional += content;
            }
        }
        
        // Clean up additional info
        entry.additional = entry.additional.trim();
        
        // If entry has minimum required data
        if (entry.title) {
            return entry;
        }
        
        return null;
    }
    
    // Render the table
    function renderTable() {
        playlistTable.innerHTML = '';
        
        // Get current filter values
        const searchTerm = searchInput.value.toLowerCase();
        const yearValue = yearFilter.value;
        
        // Filter the playlist
        const filteredPlaylist = playlist.filter(entry => {
            // Apply year filter
            if (yearValue && !entry.date.startsWith(yearValue)) {
                return false;
            }
            
            // Apply search filter
            if (searchTerm) {
                return (
                    entry.title.toLowerCase().includes(searchTerm) ||
                    entry.additional.toLowerCase().includes(searchTerm) ||
                    entry.youtube.toLowerCase().includes(searchTerm) ||
                    entry.nnd.toLowerCase().includes(searchTerm) ||
                    entry.date.includes(searchTerm)
                );
            }
            
            return true;
        });
        
        // Check if playlist is empty
        if (filteredPlaylist.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="7" class="py-8 text-center text-gray-500 italic">No playlist entries found. Add new entries using the form above.</td>`;
            playlistTable.appendChild(emptyRow);
            return;
        }
        
        // Sort by number
        filteredPlaylist.sort((a, b) => a.number - b.number);
        
        // Create table rows
        filteredPlaylist.forEach(entry => {
            const row = document.createElement('tr');
            row.className = 'entry-row';
            row.dataset.id = entry.id;
            
            row.innerHTML = `
                <td class="py-3 px-4 border-b">${entry.number}</td>
                <td class="py-3 px-4 border-b">${entry.title}</td>
                <td class="py-3 px-4 border-b">
                    ${entry.youtube ? `<a href="https://youtu.be/${entry.youtube}" target="_blank" class="text-blue-600 hover:text-blue-800">${entry.youtube}</a>` : ''}
                </td>
                <td class="py-3 px-4 border-b">
                    ${entry.nnd ? `<span class="text-gray-700">${entry.nnd}</span>` : ''}
                </td>
                <td class="py-3 px-4 border-b">${entry.date}</td>
                <td class="py-3 px-4 border-b">${entry.additional}</td>
                <td class="py-3 px-4 border-b text-center">
                    <button data-id="${entry.id}" class="edit-btn text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                    <button data-id="${entry.id}" class="delete-btn text-red-600 hover:text-red-800">Delete</button>
                </td>
            `;
            
            playlistTable.appendChild(row);
        });
        
        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                openEditModal(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.dataset.id);
                openDeleteModal(id);
            });
        });
    }
    
    // Open add modal
    function openAddModal() {
        modalTitle.textContent = 'Add New Entry';
        entryId.value = '';
        
        // Set next available number
        const nextNumber = playlist.length > 0 
            ? Math.max(...playlist.map(entry => entry.number)) + 1 
            : 1;
        
        entryNumber.value = nextNumber;
        entryTitle.value = '';
        entryYoutube.value = '';
        entryNnd.value = '';
        entryDate.value = '';
        entryAdditional.value = '';
        
        entryModal.classList.remove('hidden');
    }
    
    // Open edit modal
    function openEditModal(id) {
        const entry = playlist.find(e => e.id === id);
        if (!entry) return;
        
        modalTitle.textContent = 'Edit Entry';
        entryId.value = entry.id;
        entryNumber.value = entry.number;
        entryTitle.value = entry.title;
        entryYoutube.value = entry.youtube;
        entryNnd.value = entry.nnd;
        entryDate.value = entry.date;
        entryAdditional.value = entry.additional;
        
        entryModal.classList.remove('hidden');
    }
    
    // Close modal
    function closeModal() {
        entryModal.classList.add('hidden');
    }
    
    // Save entry
    function saveEntry(e) {
        e.preventDefault();
        
        const id = entryId.value ? parseInt(entryId.value) : null;
        const entry = {
            number: parseInt(entryNumber.value) || 0,
            title: entryTitle.value,
            youtube: entryYoutube.value,
            nnd: entryNnd.value,
            date: entryDate.value,
            additional: entryAdditional.value
        };
        
        if (!entry.title) {
            showToast('Title is required', 'error');
            return;
        }
        
        if (id) {
            // Edit existing entry
            const index = playlist.findIndex(e => e.id === id);
            if (index !== -1) {
                entry.id = id;
                playlist[index] = entry;
                showToast(`"${entry.title}" has been updated`, 'success');
            }
        } else {
            // Add new entry
            entry.id = nextId++;
            playlist.push(entry);
            showToast(`"${entry.title}" has been added`, 'success');
        }
        
        closeModal();
        renderTable();
        populateYearFilter();
    }
    
    // Open delete modal with enhanced information
    function openDeleteModal(id) {
        const entry = playlist.find(e => e.id === id);
        if (!entry) return;
        
        // Update delete modal with entry information
        const deleteTitle = document.getElementById('delete-modal-title');
        const deleteDescription = document.getElementById('delete-modal-description');
        
        deleteTitle.textContent = `Delete "${entry.title}"?`;
        deleteDescription.innerHTML = `
            <p class="mb-2">You are about to delete the following entry:</p>
            <div class="bg-gray-100 p-3 rounded mb-4">
                <p><strong>Title:</strong> ${entry.title}</p>
                <p><strong>Date:</strong> ${entry.date || 'N/A'}</p>
            </div>
            <p class="text-red-600">This action cannot be undone.</p>
        `;
        
        deleteEntryId.value = id;
        deleteModal.classList.remove('hidden');
    }
    
    // Close delete modal
    function closeDeleteModal() {
        deleteModal.classList.add('hidden');
    }
    
    // Confirm delete with toaster notification
    function confirmDelete() {
        const id = parseInt(deleteEntryId.value);
        const index = playlist.findIndex(e => e.id === id);
        
        if (index !== -1) {
            const deletedEntry = playlist[index];
            playlist.splice(index, 1);
            renderTable();
            populateYearFilter();
            
            // Show toast notification
            showToast(`"${deletedEntry.title}" has been deleted successfully.`, 'success');
        }
        
        closeDeleteModal();
    }
    
    // Generate output with toaster notification
    function generateOutput() {
        // Sort by number
        const sortedPlaylist = [...playlist].sort((a, b) => a.number - b.number);
        
        // Generate output text
        let output = '{{Playlist|content = \n';
        
        sortedPlaylist.forEach(entry => {
            let line = `# "${entry.title}"`;
            
            // Add YouTube
            if (entry.youtube) {
                line += ` {{yt|${entry.youtube}}}`;
            }
            
            // Add NND
            if (entry.nnd) {
                line += ` {{nnd|${entry.nnd}}}`;
            }
            
            // Add additional info before date if it doesn't have parentheses
            if (entry.additional && !entry.additional.includes('(') && !entry.additional.includes(')')) {
                line += ` ${entry.additional}`;
            }
            
            // Add date
            if (entry.date) {
                line += ` (${entry.date})`;
            }
            
            // Add additional info after date if it has parentheses
            if (entry.additional && (entry.additional.includes('(') || entry.additional.includes(')'))) {
                line += ` ${entry.additional}`;
            }
            
            output += line + '\n';
        });
        
        output += '}}';
        outputText.value = output;
        
        showToast('Output generated successfully', 'success');
    }
    
    // Copy to clipboard with toaster notification
    function copyToClipboard() {
        outputText.select();
        document.execCommand('copy');
        showToast('Output copied to clipboard!', 'success');
    }
    
    // Populate year filter
    function populateYearFilter() {
        const years = new Set();
        
        playlist.forEach(entry => {
            if (entry.date) {
                const year = entry.date.split('.')[0];
                if (year) {
                    years.add(year);
                }
            }
        });
        
        // Clear existing options except the first one
        while (yearFilter.options.length > 1) {
            yearFilter.options.remove(1);
        }
        
        // Add new options
        Array.from(years).sort().forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }
    
    // Filter entries
    function filterEntries() {
        renderTable();
    }
    
    // Reset filters with toaster notification
    function resetFilters() {
        searchInput.value = '';
        yearFilter.selectedIndex = 0;
        renderTable();
        showToast('Filters have been reset', 'info');
    }
    
    // Open raw data import modal
    function openRawDataModal() {
        rawDataInput.value = '';
        rawDataModal.classList.remove('hidden');
    }

    // Close raw data import modal
    function closeRawDataModal() {
        rawDataModal.classList.add('hidden');
    }

    // Import raw data
    function importRawData() {
        const rawData = rawDataInput.value.trim();
        
        if (!rawData) {
            showToast('Please enter playlist data to import', 'warning');
            return;
        }
        
        try {
            // Check if the data has the expected format
            if (!rawData.startsWith('{{Playlist|content') && !rawData.includes('#')) {
                throw new Error('Invalid playlist format');
            }
            
            // Parse the playlist entries
            const entries = parseRawPlaylist(rawData);
            
            if (entries.length === 0) {
                throw new Error('No valid entries found');
            }
            
            // Add entries to the playlist
            let addedCount = 0;
            
            entries.forEach(entry => {
                if (entry && entry.title) {
                    entry.id = nextId++;
                    playlist.push(entry);
                    addedCount++;
                }
            });
            
            // Close modal, render table, update filter
            closeRawDataModal();
            renderTable();
            populateYearFilter();
            
            // Show success toast
            showToast(`Successfully imported ${addedCount} entries`, 'success');
        } catch (e) {
            showToast(`Error importing data: ${e.message}`, 'error');
        }
    }

    // Parse raw playlist data
    function parseRawPlaylist(rawData) {
        const entries = [];
        
        // Extract the content between the playlist tags
        let content = rawData;
        const playlistMatch = rawData.match(/{{Playlist\|content\s*=\s*([\s\S]*?)}}$/);
        
        if (playlistMatch && playlistMatch[1]) {
            content = playlistMatch[1];
        }
        
        // Split into lines
        const lines = content.split('\n');
        
        // Process each line
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Skip empty lines
            if (!line || !line.startsWith('#')) continue;
            
            try {
                const entry = parseEntryLine(line);
                if (entry) {
                    entries.push(entry);
                }
            } catch (e) {
                console.error(`Error parsing line ${i + 1}: ${line}`, e);
            }
        }
        
        return entries;
    }
    
    // Improved resetAll function with better confirmation
    function resetAll() {
        // Create and show the custom confirmation dialog
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
        confirmDialog.id = 'reset-confirm-dialog';
        
        confirmDialog.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 class="text-xl font-bold mb-4 text-red-600">Reset Everything</h2>
                <p class="mb-6">This will permanently delete all ${playlist.length} playlist entries. This action cannot be undone.</p>
                <div class="flex justify-end space-x-2">
                    <button id="reset-cancel" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200">Cancel</button>
                    <button id="reset-confirm" class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">Reset All Data</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmDialog);
        
        // Add event listeners to the buttons
        document.getElementById('reset-cancel').addEventListener('click', () => {
            document.getElementById('reset-confirm-dialog').remove();
        });
        
        document.getElementById('reset-confirm').addEventListener('click', () => {
            // Clear the playlist array
            const entryCount = playlist.length;
            playlist = [];
            nextId = 1;
            
            // Clear the input and output fields
            // inputText.value = '';
            outputText.value = '';
            
            // Reset filters
            searchInput.value = '';
            yearFilter.selectedIndex = 0;
            
            // Re-render the table and reset year filter options
            renderTable();
            populateYearFilter();
            
            // Remove the dialog
            document.getElementById('reset-confirm-dialog').remove();
            
            // Show success toast
            showToast(`All ${entryCount} playlist entries have been reset.`, 'success');
        });
    }
});
