document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("plant-form");
  const plantsGrid = document.getElementById("plants-grid");
  const calendarDays = document.getElementById("calendar-days");
  const monthYearDisplay = document.getElementById("current-month-year");
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  // Modal elements
  const dayModal = document.getElementById("day-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const modalDateTitle = document.getElementById("modal-date-title");
  const modalEventsList = document.getElementById("modal-events-list");

  // Load existing plants from localStorage
  let plants = JSON.parse(localStorage.getItem("mamanPlantes")) || [];
  let editIndex = -1;

  let currentDate = new Date();

  // Render logic
  function renderPlants() {
    plantsGrid.innerHTML = "";

    renderCalendar();

    if (plants.length === 0) {
      plantsGrid.innerHTML = `
                <div class="empty-state">
                    Aucune plante n'a été ajoutée pour le moment. Commence à planter ! 🌱<br>
                    Remplis le formulaire pour documenter ta première création.
                </div>
            `;
      return;
    }

    // Sort plants by date (newest first)
    const sortedPlants = [...plants].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    sortedPlants.forEach((plant) => {
      const card = document.createElement("div");
      card.className = "plant-card";
      card.style.animation =
        "popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

      // Formatting date for French locale
      const dateObj = new Date(plant.date);
      const dateFormatted = dateObj.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      // Find the original index for deletion so we don't delete wrong item after sort
      const originalIndex = plants.indexOf(plant);

      card.innerHTML = `
                <h3>${plant.name}</h3>
                <div class="plant-info">
                    <p>
                        <span class="icon">📅</span> 
                        <span class="label">Planté le :</span> 
                        ${dateFormatted}
                    </p>
                    <p>
                        <span class="icon">🌱</span> 
                        <span class="label">Germination :</span> 
                        ${plant.germination}
                    </p>
                    <p>
                        <span class="icon">🪴</span> 
                        <span class="label">Quantité :</span> 
                        ${plant.quantity}
                    </p>
                    <p>
                        <span class="icon">🌡️</span> 
                        <span class="label">Température :</span> 
                        ${plant.temperature || "Non précisé"}
                    </p>
                    <p>
                        <span class="icon">📏</span> 
                        <span class="label">Distance :</span> 
                        ${plant.distance || "Non précisée"}
                    </p>
                    <p>
                        <span class="icon">🍽️</span> 
                        <span class="label">Récolte :</span> 
                        ${plant.harvest}
                    </p>
                </div>
                <div class="card-actions">
                    <button class="btn-icon btn-edit" title="Modifier" onclick="editPlant(${originalIndex})">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-icon btn-delete" title="Supprimer" onclick="deletePlant(${originalIndex})">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            `;

      plantsGrid.appendChild(card);
    });
  }

  function renderCalendar() {
    if (!calendarDays) return; // Guard clause if element doesn't exist

    calendarDays.innerHTML = "";
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Display month and year
    const monthNames = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust first day for Monday start (0=Sunday -> 6, 1=Monday -> 0...)
    const startDayIndex = firstDay === 0 ? 6 : firstDay - 1;

    // Add empty cells before start of month
    for (let i = 0; i < startDayIndex; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "calendar-day empty";
      calendarDays.appendChild(emptyDay);
    }

    const today = new Date();
    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement("div");
      dayCell.className = "calendar-day";
      dayCell.style.cursor = "pointer";

      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        dayCell.classList.add("today");
      }

      const dayNumber = document.createElement("div");
      dayNumber.className = "day-number";
      dayNumber.textContent = day;
      dayCell.appendChild(dayNumber);

      const eventsContainer = document.createElement("div");
      eventsContainer.className = "plant-events";

      const currentDayDate = new Date(year, month, day);
      currentDayDate.setHours(0, 0, 0, 0);

      plants.forEach((plant) => {
        const pDate = new Date(plant.date);
        pDate.setHours(0, 0, 0, 0);

        // 1. Planting Event
        if (pDate.getTime() === currentDayDate.getTime()) {
          const eventEl = document.createElement("div");
          eventEl.className = "plant-event";
          eventEl.textContent = `🌱 Semis : ${plant.name}`;
          eventEl.dataset.emoji = "🌱";
          eventEl.dataset.plantName = plant.name;
          eventEl.title = `Planté le ${plant.date}`;
          eventsContainer.appendChild(eventEl);
        }

        // 2. Germination Event(s)
        let gStart = 0;
        let gEnd = 0;
        let hasGermination = false;

        const normGerm = plant.germination
          ? plant.germination.toLowerCase()
          : "";
        const germNums = normGerm.match(/\d+/g);

        if (germNums && germNums.length > 0) {
          gStart = parseInt(germNums[0]);
          gEnd = germNums.length > 1 ? parseInt(germNums[1]) : gStart;
          if (normGerm.includes("semaine")) {
            gStart *= 7;
            gEnd *= 7;
          } else if (normGerm.includes("mois")) {
            gStart *= 30;
            gEnd *= 30;
          }
          hasGermination = true;
        } else if (normGerm.includes("semaine")) {
          gStart = 7;
          gEnd = 14;
          hasGermination = true;
        } else if (normGerm.includes("mois")) {
          gStart = 30;
          gEnd = 30;
          hasGermination = true;
        }

        if (hasGermination) {
          const gStartDate = new Date(pDate);
          gStartDate.setDate(gStartDate.getDate() + gStart);
          const gEndDate = new Date(pDate);
          gEndDate.setDate(gEndDate.getDate() + gEnd);

          if (currentDayDate >= gStartDate && currentDayDate <= gEndDate) {
            const eventEl = document.createElement("div");
            eventEl.className = "plant-event germination-event";
            eventEl.textContent = `💧 Germination : ${plant.name}`;
            eventEl.dataset.emoji = "💧";
            eventEl.dataset.plantName = plant.name;
            eventEl.title = `Période de germination`;
            eventsContainer.appendChild(eventEl);
          }
        }

        // 3. Harvest Event
        const normalize = (str) =>
          str
            ? str
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            : "";
        const normHarvest = normalize(plant.harvest);

        const monthNamesNorm = monthNames.map((m) => normalize(m));

        let isHarvestDay = false;
        let mentionedMonths = [];

        // Find which months are mentioned
        monthNamesNorm.forEach((m, idx) => {
          if (
            normHarvest.includes(m) ||
            normHarvest.includes(m.substring(0, 3))
          ) {
            mentionedMonths.push(idx);
          }
        });

        // Range detection (e.g. "juillet - septembre" => fill in "août")
        if (mentionedMonths.length >= 2) {
          const first = Math.min(...mentionedMonths);
          const last = Math.max(...mentionedMonths);
          for (let i = first + 1; i < last; i++) {
            if (!mentionedMonths.includes(i)) mentionedMonths.push(i);
          }
        }

        if (mentionedMonths.includes(month)) {
          isHarvestDay = true;
        } else if (mentionedMonths.length === 0) {
          // Try to extract delays like "3 mois"
          const harvNums = normHarvest.match(/\d+/g);
          if (harvNums && harvNums.length > 0) {
            const amount = parseInt(harvNums[0]);
            const hStartDate = new Date(pDate);
            if (normHarvest.includes("mois")) {
              hStartDate.setMonth(hStartDate.getMonth() + amount);
              if (
                hStartDate.getFullYear() === year &&
                hStartDate.getMonth() === month
              ) {
                isHarvestDay = true;
              }
            } else if (normHarvest.includes("semaine")) {
              hStartDate.setDate(hStartDate.getDate() + amount * 7);
              if (hStartDate.getTime() === currentDayDate.getTime())
                isHarvestDay = true;
            } else {
              hStartDate.setDate(hStartDate.getDate() + amount);
              if (hStartDate.getTime() === currentDayDate.getTime())
                isHarvestDay = true;
            }
          }
        }

        if (isHarvestDay) {
          const eventEl = document.createElement("div");
          eventEl.className = "plant-event harvest-event";
          eventEl.textContent = `🌾 Récolte : ${plant.name}`;
          eventEl.dataset.emoji = "🌾";
          eventEl.dataset.plantName = plant.name;
          eventEl.title = `Période de récolte estimée`;
          eventsContainer.appendChild(eventEl);
        }
      });

      // Add click listener to open modal
      dayCell.addEventListener("click", () => {
        openDayModal(currentDayDate, Array.from(eventsContainer.children));
      });

      dayCell.appendChild(eventsContainer);
      calendarDays.appendChild(dayCell);
    }
  }

  // Modal logic
  function openDayModal(dateObj, eventElements) {
    // Set date title
    const formattedDate = dateObj.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    // Capitalize first letter
    modalDateTitle.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    // Clear previous events
    modalEventsList.innerHTML = "";

    if (eventElements.length === 0) {
      modalEventsList.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem; grid-column: 1;">
          Rien de prévu pour ce jour ! 🌱
        </div>
      `;
    } else {
      eventElements.forEach((el) => {
        const emoji = el.dataset.emoji || "🌱";
        const plantName = el.dataset.plantName || el.textContent;
        
        let subText = "Détail de la plante";
        if (el.classList.contains("germination-event")) subText = "Période de germination de la plante.";
        else if (el.classList.contains("harvest-event")) subText = "Période estimée pour la récolte !";
        else subText = "Jour exact de la plantation.";

        const item = document.createElement("div");
        item.className = "modal-event-item";
        item.innerHTML = `
          <div class="modal-event-icon">${emoji}</div>
          <div class="modal-event-details">
            <h3>${plantName}</h3>
            <p>${subText}</p>
          </div>
        `;
        modalEventsList.appendChild(item);
      });
    }

    dayModal.style.display = "flex";
  }

  // Close modal listeners
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      dayModal.style.display = "none";
    });
  }

  if (dayModal) {
    dayModal.addEventListener("click", (e) => {
      if (e.target === dayModal) {
        dayModal.style.display = "none";
      }
    });
  }

  // Calendar Navigation events
  if (prevMonthBtn && nextMonthBtn) {
    prevMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    nextMonthBtn.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  }

  // Form Submission Handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get values
    const name = document.getElementById("plant-name").value.trim();
    const date = document.getElementById("plant-date").value;
    const germination = document
      .getElementById("germination-time")
      .value.trim();
    const quantity = document.getElementById("plant-quantity").value;
    const temperature = document
      .getElementById("plant-temperature")
      .value.trim();
    const distance = document.getElementById("plant-distance").value.trim();
    const harvest = document.getElementById("harvest-period").value.trim();

    // Create Plant Object
    const newPlant = {
      name,
      date,
      germination,
      quantity,
      temperature,
      distance,
      harvest,
      id: Date.now(), // Unique ID optionally
    };

    if (editIndex > -1) {
      newPlant.id = plants[editIndex].id; // Preserve ID
      plants[editIndex] = newPlant;
      editIndex = -1;
      document.querySelector(".btn-submit").innerHTML = "Planter ! 🌱";
    } else {
      plants.push(newPlant);
    }

    // Save to localStorage
    localStorage.setItem("mamanPlantes", JSON.stringify(plants));

    // Render & Reset Form
    renderPlants();
    form.reset();

    // Return focus to first input
    document.getElementById("plant-name").focus();
  });

  // Make actions globally available
  window.deletePlant = (index) => {
    if (confirm("Veux-tu vraiment supprimer cette plante ?")) {
      plants.splice(index, 1);
      localStorage.setItem("mamanPlantes", JSON.stringify(plants));
      renderPlants();
    }
  };

  window.editPlant = (index) => {
    const plant = plants[index];
    document.getElementById("plant-name").value = plant.name;
    document.getElementById("plant-date").value = plant.date;
    document.getElementById("germination-time").value = plant.germination;
    document.getElementById("plant-quantity").value = plant.quantity;
    document.getElementById("plant-temperature").value =
      plant.temperature || "";
    document.getElementById("plant-distance").value = plant.distance || "";
    document.getElementById("harvest-period").value = plant.harvest;

    editIndex = index;
    document.querySelector(".btn-submit").innerHTML = "Modifier ! ✏️";

    // Scroll mobile to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Initial render
  renderPlants();
});
