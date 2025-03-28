document.addEventListener('DOMContentLoaded', function() {
    // Data store
    let playlist = [];
    let nextId = 1;
    
    // DOM elements
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const parseBtn = document.getElementById('parse-btn');
    const addBtn = document.getElementById('add-btn');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const clearInputBtn = document.getElementById('clear-input-btn');
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
    
    // Parse raw playlist data from the provided text
    parseInitialPlaylist();
    
    // Event Listeners
    parseBtn.addEventListener('click', parseEntry);
    addBtn.addEventListener('click', openAddModal);
    generateBtn.addEventListener('click', generateOutput);
    copyBtn.addEventListener('click', copyToClipboard);
    clearInputBtn.addEventListener('click', () => { inputText.value = ''; });
    clearOutputBtn.addEventListener('click', () => { outputText.value = ''; });
    entryForm.addEventListener('submit', saveEntry);
    modalCancel.addEventListener('click', closeModal);
    deleteCancel.addEventListener('click', closeDeleteModal);
    deleteConfirm.addEventListener('click', confirmDelete);
    searchInput.addEventListener('input', filterEntries);
    yearFilter.addEventListener('change', filterEntries);
    resetFilterBtn.addEventListener('click', resetFilters);
    
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
    }
    
    // Parse a single entry from the input
    function parseEntry() {
        const text = inputText.value.trim();
        if (!text) return;
        
        try {
            const entry = parseEntryLine(text);
            if (entry) {
                entry.id = nextId++;
                playlist.push(entry);
                renderTable();
                populateYearFilter();
                inputText.value = '';
            }
        } catch (e) {
            alert(`Error parsing entry: ${e.message}`);
        }
    }
    
    // Parse a single entry line and return an entry object
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
            entry.number = line.startsWith('# ') ? 1 : 0;
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
        
        // Handle additional information - this is everything else except for some common patterns
        content = content.trim();
        
        // Handle feat. artists and similar patterns before the date
        const featMatch = content.match(/feat\.\s+(.+?)\s+\(\d{4}/i);
        if (featMatch) {
            const featText = featMatch[1];
            // Remove this part from the date match but keep it for additional info
            content = content.replace(`feat. ${featText}`, '').trim();
            entry.additional += `feat. ${featText} `;
        }
        
        // Handle (singers x singers) pattern before the date
        const singersMatch = content.match(/\(([^)]+)\)\s+\(\d{4}/);
        if (singersMatch) {
            const singersText = singersMatch[1];
            // Remove this part from the date match but keep it for additional info
            content = content.replace(`(${singersText})`, '').trim();
            entry.additional += `(${singersText}) `;
        }
        
        // Handle other information
        if (content) {
            entry.additional += content;
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
            alert('Title is required');
            return;
        }
        
        if (id) {
            // Edit existing entry
            const index = playlist.findIndex(e => e.id === id);
            if (index !== -1) {
                entry.id = id;
                playlist[index] = entry;
            }
        } else {
            // Add new entry
            entry.id = nextId++;
            playlist.push(entry);
        }
        
        closeModal();
        renderTable();
        populateYearFilter();
    }
    
    // Open delete modal
    function openDeleteModal(id) {
        deleteEntryId.value = id;
        deleteModal.classList.remove('hidden');
    }
    
    // Close delete modal
    function closeDeleteModal() {
        deleteModal.classList.add('hidden');
    }
    
    // Confirm delete
    function confirmDelete() {
        const id = parseInt(deleteEntryId.value);
        const index = playlist.findIndex(e => e.id === id);
        
        if (index !== -1) {
            playlist.splice(index, 1);
            renderTable();
            populateYearFilter();
        }
        
        closeDeleteModal();
    }
    
    // Generate output
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
    }
    
    // Copy to clipboard
    function copyToClipboard() {
        outputText.select();
        document.execCommand('copy');
        
        // Show feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.disabled = true;
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.disabled = false;
        }, 2000);
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
    
    // Reset filters
    function resetFilters() {
        searchInput.value = '';
        yearFilter.selectedIndex = 0;
        renderTable();
    }
    const resetAllBtn = document.getElementById('reset-all-btn');
    resetAllBtn.addEventListener('click', resetAll);
    
    // Add this function to reset everything
    function resetAll() {
      if (confirm('Are you sure you want to reset everything? This will clear all playlist entries and cannot be undone.')) {
        // Clear the playlist array
        playlist = [];
        nextId = 1;
        
        // Clear the input and output fields
        inputText.value = '';
        outputText.value = '';
        
        // Reset filters
        searchInput.value = '';
        yearFilter.selectedIndex = 0;
        
        // Re-render the table and reset year filter options
        renderTable();
        populateYearFilter();
      }
    }
});
