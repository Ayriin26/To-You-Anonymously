// ✅ Base API configuration
const API = window.axios.create({
    baseURL: 'https://to-you-anonymously-backend.onrender.com',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  // ✅ DOM Elements
  const form = document.getElementById("noteForm");
  const recipientInput = document.getElementById("recipientName");
  const senderInput = document.getElementById("senderName");
  const messageInput = document.getElementById("message");
  const notesContainer = document.getElementById("notesContainer");
  const searchInput = document.getElementById("searchInput");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const noteModal = document.getElementById("noteModal");
  const closeModalBtn = document.querySelector(".close");
  
  let notes = [];
  
  // ✅ Show modal
  addNoteBtn.addEventListener("click", () => {
    noteModal.style.display = "block";
  });
  
  // ✅ Hide modal
  closeModalBtn.addEventListener("click", () => {
    noteModal.style.display = "none";
  });
  
  // ✅ Hide modal on outside click
  window.addEventListener("click", (e) => {
    if (e.target === noteModal) {
      noteModal.style.display = "none";
    }
  });
  
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
  
  // ✅ Form submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const noteData = {
      recipient: recipientInput.value.trim(),
      message: messageInput.value.trim(),
      name: senderInput.value.trim()
    };
  
    if (!noteData.recipient || !noteData.message) {
      alert("Recipient and message are required.");
      return;
    }
  
    try {
      await createNote(noteData);
      recipientInput.value = "";
      messageInput.value = "";
      senderInput.value = "";
      noteModal.style.display = "none";
    } catch (error) {
      alert(error.message);
    }
  });
  
  // ✅ Search by name or message
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredNotes = notes.filter((note) =>
      (note.name || "").toLowerCase().includes(searchTerm) ||
      (note.message || "").toLowerCase().includes(searchTerm)
    );
    displayNotes(filteredNotes);
  });
  
  function showError(message) {
    notesContainer.innerHTML = `<p class="error">${message}</p>`;
  }
  
  // ✅ Initial load
  fetchNotes();
  