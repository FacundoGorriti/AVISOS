const form = document.getElementById("noticeForm");
const noticeList = document.getElementById("noticeList");
const emptyState = document.getElementById("emptyState");
const clearBtn = document.getElementById("clearBtn");
const messageInput = document.getElementById("message");
const charCount = document.getElementById("charCount");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const totalNotices = document.getElementById("totalNotices");
const urgentNotices = document.getElementById("urgentNotices");

let notices = JSON.parse(localStorage.getItem("premiumNotices")) || [];

const categoryStyles = {
  General: {
    accent: "#f59e0b",
    soft: "rgba(245, 158, 11, .12)",
    pillBg: "rgba(245, 158, 11, .13)",
    pillText: "#fde68a",
    pillBorder: "rgba(245, 158, 11, .22)"
  },
  Urgente: {
    accent: "#ef4444",
    soft: "rgba(239, 68, 68, .13)",
    pillBg: "rgba(239, 68, 68, .13)",
    pillText: "#fecaca",
    pillBorder: "rgba(239, 68, 68, .24)"
  },
  Evento: {
    accent: "#38bdf8",
    soft: "rgba(56, 189, 248, .12)",
    pillBg: "rgba(56, 189, 248, .13)",
    pillText: "#bae6fd",
    pillBorder: "rgba(56, 189, 248, .22)"
  },
  Recordatorio: {
    accent: "#22c55e",
    soft: "rgba(34, 197, 94, .12)",
    pillBg: "rgba(34, 197, 94, .13)",
    pillText: "#bbf7d0",
    pillBorder: "rgba(34, 197, 94, .22)"
  },
  Mantenimiento: {
    accent: "#a78bfa",
    soft: "rgba(167, 139, 250, .12)",
    pillBg: "rgba(167, 139, 250, .13)",
    pillText: "#ddd6fe",
    pillBorder: "rgba(167, 139, 250, .22)"
  }
};

const saveNotices = () => {
  localStorage.setItem("premiumNotices", JSON.stringify(notices));
};

const escapeHTML = (text) => {
  return text.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return entities[char];
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);

  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const updateStats = () => {
  totalNotices.textContent = notices.length;
  urgentNotices.textContent = notices.filter((notice) => notice.category === "Urgente").length;
};

const getFilteredNotices = () => {
  const search = searchInput.value.toLowerCase().trim();
  const category = filterCategory.value;

  return notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(search) ||
      notice.author.toLowerCase().includes(search) ||
      notice.message.toLowerCase().includes(search);

    const matchesCategory = category === "Todas" || notice.category === category;

    return matchesSearch && matchesCategory;
  });
};

const renderNotices = () => {
  const filteredNotices = getFilteredNotices();
  noticeList.innerHTML = "";

  updateStats();

  if (filteredNotices.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  filteredNotices.forEach((notice) => {
    const styles = categoryStyles[notice.category] || categoryStyles.General;
    const card = document.createElement("article");

    card.className = "notice-card";
    card.style.setProperty("--accent", styles.accent);
    card.style.setProperty("--accent-soft", styles.soft);
    card.style.setProperty("--pill-bg", styles.pillBg);
    card.style.setProperty("--pill-text", styles.pillText);
    card.style.setProperty("--pill-border", styles.pillBorder);

    card.innerHTML = `
      <div class="notice-head">
        <span class="pill">${escapeHTML(notice.category)}</span>
        <span class="date">${formatDate(notice.createdAt)}</span>
      </div>

      <h3>${escapeHTML(notice.title)}</h3>
      <p>${escapeHTML(notice.message)}</p>

      <div class="notice-foot">
        <span>Por <strong>${escapeHTML(notice.author)}</strong></span>
        <button class="delete-card" type="button" data-id="${notice.id}">Eliminar</button>
      </div>
    `;

    noticeList.appendChild(card);
  });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const author = document.getElementById("author").value.trim();
  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const message = messageInput.value.trim();

  if (!author || !title || !message) {
    alert("Completá todos los campos antes de publicar.");
    return;
  }

  const newNotice = {
    id: Date.now(),
    author,
    title,
    category,
    message,
    createdAt: new Date().toISOString()
  };

  notices.push(newNotice);
  saveNotices();
  renderNotices();

  form.reset();
  charCount.textContent = "0";
});

noticeList.addEventListener("click", (event) => {
  if (!event.target.classList.contains("delete-card")) return;

  const id = Number(event.target.dataset.id);
  notices = notices.filter((notice) => notice.id !== id);
  saveNotices();
  renderNotices();
});

clearBtn.addEventListener("click", () => {
  if (notices.length === 0) return;

  const confirmClear = confirm("¿Seguro que querés borrar todos los avisos?");

  if (confirmClear) {
    notices = [];
    saveNotices();
    renderNotices();
  }
});

messageInput.addEventListener("input", () => {
  charCount.textContent = messageInput.value.length;
});

searchInput.addEventListener("input", renderNotices);
filterCategory.addEventListener("change", renderNotices);

renderNotices();
