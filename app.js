// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const addNoteBtn = document.getElementById('addNoteBtn');
const modal = document.getElementById('noteModal');
const closeBtn = document.querySelector('.close');
const noteForm = document.getElementById('noteForm');
const searchInput = document.getElementById('searchInput');
const notesContainer = document.getElementById('notesContainer');

// State
let notes = [];
let likedNotes = JSON.parse(localStorage.getItem('liked-notes')) || [];

// Event Listeners
document.addEventListener('DOMContentLoaded', fetchNotes);
addNoteBtn.addEventListener('click', openModal);
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => e.target === modal && closeModal());
noteForm.addEventListener('submit', handleSubmit);
searchInput.addEventListener('input', handleSearch);

// API Functions
async function fetchNotes() {
    try {
        const response = await fetch(`${API_BASE_URL}/notes`);
        if (!response.ok) throw new Error('Failed to fetch notes');
        
        const data = await response.json();
        if (data.success) {
            notes = data.data;
            displayNotes(notes);
        }
    } catch (error) {
        console.error('Error fetching notes:', error);
        showError('Failed to load notes. Please try again later.');
    }
}

async function createNote(noteData) {
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create note');
        }

        const data = await response.json();
        if (data.success) {
            // Add the new note to the beginning of the array
            notes.unshift(data.data);
            displayNotes(notes);
            return true;
        }
    } catch (error) {
        console.error('Error creating note:', error);
        throw error;
    }
}

// UI Functions
function openModal() {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    noteForm.reset();
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const recipient = document.getElementById('recipientName').value.trim();
    const message = document.getElementById('message').value.trim();
    const sender = document.getElementById('senderName').value.trim();
    
    if (!recipient || !message) {
        showError('Please fill in all required fields');
        return;
    }
    
    const submitBtn = noteForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    try {
        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        await createNote({
            toName: recipient,
            message,
            fromName: sender || 'Anonymous'
        });
        
        // Close modal and show success message
        closeModal();
        showSuccess('Your note has been sent!');
        
        // Hide empty state if this is the first note
        const emptyState = document.querySelector('.empty-state');
        if (emptyState) emptyState.style.display = 'none';
    } catch (error) {
        showError(error.message || 'Failed to send note. Please try again.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

function displayNotes(notesToDisplay) {
    if (!notesToDisplay || notesToDisplay.length === 0) {
        showEmptyState();
        return;
    }
    
    // Clear existing notes
    notesContainer.innerHTML = '';
    
    notesToDisplay.forEach(note => {
        const noteElement = createNoteElement(note);
        notesContainer.appendChild(noteElement);
    });
}

function createNoteElement(note) {
    const noteElement = document.createElement('div');
    noteElement.className = `note-card ${note.color || (Math.random() > 0.5 ? 'pink' : 'blue')}-note`;
    noteElement.dataset.id = note._id;
    
    const formattedDate = formatDate(note.createdAt);
    const isLiked = likedNotes.includes(note._id);
    
    noteElement.innerHTML = `
        <p class="note-message">${escapeHtml(note.message)}</p>
        <p class="note-recipient">To: ${escapeHtml(note.toName)}</p>
        <p class="note-sender">From: ${escapeHtml(note.fromName || 'Anonymous')}</p>
        <div class="note-footer">
            <span class="note-date">${formattedDate}</span>
            <div class="note-actions">
                <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${note._id}">
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                    <span class="like-count">${note.likes || 0}</span>
                </button>
            </div>
        </div>
    `;
    
    // Add event listener to the like button
    const likeBtn = noteElement.querySelector('.like-btn');
    if (likeBtn) {
        likeBtn.addEventListener('click', (e) => toggleLike(note._id, e));
    }
    
    return noteElement;
}

function toggleLike(noteId, event) {
    event.stopPropagation();
    
    const likeBtn = event.currentTarget;
    const likeIcon = likeBtn.querySelector('i');
    const likeCount = likeBtn.querySelector('.like-count');
    
    if (likedNotes.includes(noteId)) {
        // Unlike
        const index = likedNotes.indexOf(noteId);
        likedNotes.splice(index, 1);
        likeBtn.classList.remove('liked');
        likeIcon.classList.replace('fas', 'far');
    } else {
        // Like
        likedNotes.push(noteId);
        likeBtn.classList.add('liked');
        likeIcon.classList.replace('far', 'fas');
        
        // Add animation
        likeBtn.style.transform = 'scale(1.2)';
        setTimeout(() => {
            likeBtn.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Update like count display
    const currentLikes = parseInt(likeCount.textContent) || 0;
    likeCount.textContent = likedNotes.includes(noteId) ? currentLikes + 1 : Math.max(0, currentLikes - 1);
    
    // Save liked notes to localStorage
    localStorage.setItem('liked-notes', JSON.stringify(likedNotes));
}

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        displayNotes(notes);
        return;
    }
    
    const filteredNotes = notes.filter(note => 
        note.toName.toLowerCase().includes(searchTerm) ||
        note.message.toLowerCase().includes(searchTerm) ||
        (note.fromName && note.fromName.toLowerCase().includes(searchTerm))
    );
    
    if (filteredNotes.length === 0) {
        showEmptyState(true);
    } else {
        displayNotes(filteredNotes);
    }
}

// Utility Functions
function showEmptyState(noResults = false) {
    notesContainer.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-${noResults ? 'search' : 'feather-alt'}"></i>
            <h2>${noResults ? 'No notes found' : 'Spread Kindness'}</h2>
            <p>${noResults ? 'Try a different search term' : 'Be the first to leave a heartfelt note for someone special. Your words might be exactly what they need to hear today.'}</p>
        </div>
    `;
}

function showError(message) {
    // You can implement a more sophisticated notification system
    alert(`Error: ${message}`);
}

function showSuccess(message) {
    // You can implement a more sophisticated notification system
    alert(`Success: ${message}`);
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Add some CSS for the note colors and animations
const style = document.createElement('style');
style.textContent = `
    .pink-note { 
        background-color: var(--note-pink);
        border-color: #f8bbd0;
    }
    .blue-note { 
        background-color: var(--note-blue);
        border-color: #bbdefb;
    }
    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: var(--text-secondary);
    }
    .empty-state i {
        font-size: 48px;
        color: #e0e0e0;
        margin-bottom: 20px;
    }
    .empty-state h2 {
        font-family: 'Playfair Display', serif;
        color: var(--text-color);
        margin-bottom: 15px;
    }
    .empty-state p {
        max-width: 500px;
        margin: 0 auto;
        font-size: 1.1rem;
        line-height: 1.6;
    }
    .like-btn {
        transition: all 0.2s ease;
    }
    .like-btn.liked {
        color: var(--like-color);
    }
    .like-btn i {
        transition: transform 0.2s ease;
    }
    .fa-spin {
        margin-right: 8px;
    }
`;
document.head.appendChild(style);
