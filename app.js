
// ✅ Base API configuration
const API = window.axios.create({
  baseURL: 'https://to-you-anonymously-backend.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

const form = document.getElementById("noteForm");
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const notesContainer = document.getElementById("notes");
const searchInput = document.getElementById("searchInput");
const addNoteBtn = document.getElementById("addNoteBtn");
const noteFormContainer = document.querySelector(".note-form-container");
const closeFormBtn = document.querySelector(".close-form");
let notes = [];

// ✅ Axios-based fetch
async function fetchNotes() {
  try {
    const response = await API.get('/api/notes');
    if (response.data.success) {
      notes = response.data.data;
      displayNotes(notes);
    }
  } catch (error) {
    console.error("Error fetching notes:", error);
    showError("Failed to load notes. Please try again later.");
  }
}

// ✅ Axios-based create
async function createNote(noteData) {
  try {
    const response = await API.post('/api/notes', noteData);
    if (response.data.success) {
      notes.unshift(response.data.data);
      displayNotes(notes);
      return true;
    }
  } catch (error) {
    const errMsg = error.response?.data?.message || 'Failed to create note';
    console.error("Error creating note:", errMsg);
    throw new Error(errMsg);
  }
}

function displayNotes(filteredNotes) {
  notesContainer.innerHTML = "";

  if (filteredNotes.length === 0) {
    notesContainer.innerHTML = `<p class="no-notes">No notes found.</p>`;
    return;
  }

  filteredNotes.forEach((note) => {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note");

    const messageElement = document.createElement("p");
    messageElement.classList.add("message");
    messageElement.textContent = note.message;

    const senderElement = document.createElement("p");
    senderElement.classList.add("sender");
    senderElement.textContent = note.name
      ? `— From ${note.name}`
      : "— From Anonymous";

    noteElement.appendChild(messageElement);
    noteElement.appendChild(senderElement);
    notesContainer.appendChild(noteElement);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const noteData = {
    name: nameInput.value,
    message: messageInput.value,
  };

  try {
    await createNote(noteData);
    nameInput.value = "";
    messageInput.value = "";
    hideForm();
  } catch (error) {
    alert(error.message);
  }
});

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredNotes = notes.filter((note) =>
    (note.name || "").toLowerCase().includes(searchTerm)
  );
  displayNotes(filteredNotes);
});

addNoteBtn.addEventListener("click", () => {
  noteFormContainer.style.display = "block";
});

closeFormBtn.addEventListener("click", () => {
  hideForm();
});

function hideForm() {
  noteFormContainer.style.display = "none";
  nameInput.value = "";
  messageInput.value = "";
}

function showError(message) {
  notesContainer.innerHTML = `<p class="error">${message}</p>`;
}

// Initial load
fetchNotes();
