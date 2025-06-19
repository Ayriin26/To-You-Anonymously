// ✅ Axios instance
const API = window.axios.create({
    baseURL: 'https://to-you-anonymously-backend.onrender.com',
    headers: { 'Content-Type': 'application/json' }
  });
  
  // ✅ Get DOM elements
  const form = document.getElementById("noteForm");
  const senderInput = document.getElementById("senderName");
  const messageInput = document.getElementById("message");
  const notesContainer = document.getElementById("notesContainer");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const noteModal = document.getElementById("noteModal");
  const closeModalBtn = document.querySelector(".close");
  const searchInput = document.getElementById("searchInput");
  
  let notes = [];
  
  // ✅ Show the modal when ➕ is clicked
  addNoteBtn.addEventListener("click", () => {
    noteModal.style.display = "block";
  });
  
  // ✅ Hide the modal when ✖ is clicked
  closeModalBtn.addEventListener("click", () => {
    noteModal.style.display = "none";
  });
  
  // ✅ Hide modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === noteModal) {
      noteModal.style.display = "none";
    }
  });
  
  // ✅ Fetch notes from backend
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
  
  // ✅ Create a new note
  async function createNote(noteData) {
    try {
      const response = await API.post('/api/notes', noteData);
      if (response.data.success) {
        notes.unshift(response.data.data);
        displayNotes(notes);
      }
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Error creating note. Please try again.");
    }
  }
  
  // ✅ Display notes on screen
  function displayNotes(filteredNotes) {
    notesContainer.innerHTML = "";
  
    if (!filteredNotes.length) {
      notesContainer.innerHTML = "<p class='no-notes'>No notes found.</p>";
      return;
    }
  
    filteredNotes.forEach((note) => {
      const div = document.createElement("div");
      div.className = "note";
      div.innerHTML = `
        <p class="message">${note.message}</p>
        <p class="sender">— From ${note.name || "Anonymous"}</p>
      `;
      notesContainer.appendChild(div);
    });
  }
  
  // ✅ Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const noteData = {
      name: senderInput.value.trim(),
      message: messageInput.value.trim()
    };
  
    if (!noteData.message) {
      alert("Message is required.");
      return;
    }
  
    await createNote(noteData);
    senderInput.value = "";
    messageInput.value = "";
    noteModal.style.display = "none";
  });
  
  // ✅ Search functionality
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filtered = notes.filter((n) =>
      (n.name || "").toLowerCase().includes(query) ||
      (n.message || "").toLowerCase().includes(query)
    );
    displayNotes(filtered);
  });
  
  // ✅ Fallback error message
  function showError(msg) {
    notesContainer.innerHTML = `<p class="error">${msg}</p>`;
  }
  
  // ✅ Load on start
  fetchNotes();
  