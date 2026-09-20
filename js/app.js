/* ========================================================
   🏆 PREMIER TOURNAMENT DASHBOARD - SIMPLE & READABLE JS
   ======================================================== */

// ---------------------------------------------------------
// 1. DEFAULT TOURNAMENT DATA (Teams & Initial Fixtures)
// ---------------------------------------------------------
const DEFAULT_TEAMS = [
  { id: 1, name: "Thunder FC", icon: "⚡", city: "London" },
  { id: 2, name: "Solar Stars", icon: "☀️", city: "Madrid" },
  { id: 3, name: "Cyber Knights", icon: "🛡️", city: "Berlin" },
  { id: 4, name: "Royal Phoenix", icon: "🦅", city: "Paris" },
  { id: 5, name: "Ocean Waves", icon: "🌊", city: "Lisbon" },
  { id: 6, name: "Golden Tigers", icon: "🐯", city: "Rome" }
];

const DEFAULT_MATCHES = [
  // Round 1 (Completed)
  { id: 101, round: "Round 1", homeId: 1, awayId: 2, homeScore: 2, awayScore: 1, played: true },
  { id: 102, round: "Round 1", homeId: 3, awayId: 4, homeScore: 0, awayScore: 0, played: true },
  { id: 103, round: "Round 1", homeId: 5, awayId: 6, homeScore: 3, awayScore: 2, played: true },
  
  // Round 2 (Some Played, Some Upcoming)
  { id: 104, round: "Round 2", homeId: 2, awayId: 3, homeScore: 1, awayScore: 1, played: true },
  { id: 105, round: "Round 2", homeId: 4, awayId: 5, homeScore: null, awayScore: null, played: false },
  { id: 106, round: "Round 2", homeId: 6, awayId: 1, homeScore: null, awayScore: null, played: false },
  
  // Round 3 (Upcoming)
  { id: 107, round: "Round 3", homeId: 1, awayId: 4, homeScore: null, awayScore: null, played: false },
  { id: 108, round: "Round 3", homeId: 2, awayId: 5, homeScore: null, awayScore: null, played: false },
  { id: 109, round: "Round 3", homeId: 3, awayId: 6, homeScore: null, awayScore: null, played: false }
];

// ---------------------------------------------------------
// 2. STATE MANAGEMENT (Load / Save with LocalStorage)
// ---------------------------------------------------------
let teams = [];
let matches = [];
let activeMatchFilter = "all";

// Load data from LocalStorage or use defaults
function loadData() {
  const savedTeams = localStorage.getItem("tournament_teams");
  const savedMatches = localStorage.getItem("tournament_matches");

  if (savedTeams && savedMatches) {
    teams = JSON.parse(savedTeams);
    matches = JSON.parse(savedMatches);
  } else {
    teams = JSON.parse(JSON.stringify(DEFAULT_TEAMS));
    matches = JSON.parse(JSON.stringify(DEFAULT_MATCHES));
    saveData();
  }
}

// Save current state to LocalStorage
function saveData() {
  localStorage.setItem("tournament_teams", JSON.stringify(teams));
  localStorage.setItem("tournament_matches", JSON.stringify(matches));
}

// Helper: Get team object by ID
function getTeam(teamId) {
  return teams.find(t => t.id === Number(teamId)) || { name: "Unknown", icon: "❓", city: "" };
}

// ---------------------------------------------------------
// 3. POINTS TABLE CALCULATION (P, W, D, L, GF, GA, GD, PTS)
// ---------------------------------------------------------
function calculateStandings() {
  // Initialize table data for every team
  const tableData = teams.map(team => ({
    id: team.id,
    name: team.name,
    icon: team.icon,
    city: team.city,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0, // Goals For (Scored)
    ga: 0, // Goals Against (Conceded)
    gd: 0, // Goal Difference
    pts: 0 // Total Points (Win = 3, Draw = 1, Loss = 0)
  }));

  // Process all completed matches
  matches.forEach(match => {
    if (!match.played) return; // Skip upcoming matches

    const home = tableData.find(t => t.id === match.homeId);
    const away = tableData.find(t => t.id === match.awayId);

    if (!home || !away) return;

    // Increment matches played
    home.played += 1;
    away.played += 1;

    // Track goals
    home.gf += match.homeScore;
    home.ga += match.awayScore;
    away.gf += match.awayScore;
    away.ga += match.homeScore;

    // Compute Win / Draw / Loss points
    if (match.homeScore > match.awayScore) {
      // Home Team Won
      home.won += 1;
      home.pts += 3;
      away.lost += 1;
    } else if (match.homeScore < match.awayScore) {
      // Away Team Won
      away.won += 1;
      away.pts += 3;
      home.lost += 1;
    } else {
      // Draw (Tie)
      home.drawn += 1;
      home.pts += 1;
      away.drawn += 1;
      away.pts += 1;
    }
  });

  // Calculate goal differences and sort teams
  tableData.forEach(team => {
    team.gd = team.gf - team.ga;
  });

  // Sort: 1st by Points, 2nd by Goal Difference, 3rd by Goals Scored
  tableData.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });

  return tableData;
}

// ---------------------------------------------------------
// 4. RENDER POINTS TABLE UI
// ---------------------------------------------------------
function renderStandings() {
  const standings = calculateStandings();
  const tbody = document.getElementById("standingsBody");
  tbody.innerHTML = "";

  standings.forEach((team, index) => {
    const rank = index + 1;
    const isQualifier = rank <= 2; // Top 2 qualify

    const row = document.createElement("tr");
    if (isQualifier) row.classList.add("qualifier");

    // Format Goal Difference with + sign if positive
    const gdFormatted = team.gd > 0 ? `+${team.gd}` : team.gd;

    row.innerHTML = `
      <td><span class="rank-pill">${rank}</span></td>
      <td>
        <div class="team-cell">
          <span class="team-emoji">${team.icon}</span>
          <span>${team.name}</span>
        </div>
      </td>
      <td>${team.played}</td>
      <td>${team.won}</td>
      <td>${team.drawn}</td>
      <td>${team.lost}</td>
      <td>${team.gf}</td>
      <td>${team.ga}</td>
      <td><strong>${gdFormatted}</strong></td>
      <td class="highlight-col">${team.pts}</td>
    `;
    tbody.appendChild(row);
  });
}

// ---------------------------------------------------------
// 5. RENDER MATCH FIXTURES & RESULTS
// ---------------------------------------------------------
function renderMatches() {
  const container = document.getElementById("matchesList");
  container.innerHTML = "";

  // Filter matches based on active filter button
  const filteredMatches = matches.filter(match => {
    if (activeMatchFilter === "finished") return match.played;
    if (activeMatchFilter === "upcoming") return !match.played;
    return true; // 'all'
  });

  if (filteredMatches.length === 0) {
    container.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">No matches found for this filter.</p>`;
    return;
  }

  filteredMatches.forEach(match => {
    const home = getTeam(match.homeId);
    const away = getTeam(match.awayId);

    const card = document.createElement("div");
    card.className = "match-card";

    // Status Pill
    const statusText = match.played ? "Finished" : "Upcoming";
    const statusClass = match.played ? "status-finished" : "status-upcoming";

    // Score display
    const scoreDisplay = match.played
      ? `<div class="match-score-box">${match.homeScore} - ${match.awayScore}</div>`
      : `<div class="match-score-box unplayed">VS</div>`;

    card.innerHTML = `
      <div class="match-header">
        <span>${match.round}</span>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </div>

      <div class="match-teams-row">
        <div class="match-team">
          <span class="match-team-emoji">${home.icon}</span>
          <span class="match-team-name">${home.name}</span>
        </div>

        ${scoreDisplay}

        <div class="match-team">
          <span class="match-team-emoji">${away.icon}</span>
          <span class="match-team-name">${away.name}</span>
        </div>
      </div>

      <div class="match-footer">
        <button class="btn btn-outline btn-sm" onclick="openScoreModal(${match.id})">
          ✏️ ${match.played ? "Edit Score" : "Enter Result"}
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// ---------------------------------------------------------
// 6. RENDER TEAMS LIST
// ---------------------------------------------------------
function renderTeams() {
  const container = document.getElementById("teamsList");
  container.innerHTML = "";

  const standings = calculateStandings();

  teams.forEach(team => {
    const teamStats = standings.find(t => t.id === team.id) || { pts: 0, played: 0, won: 0 };
    
    const card = document.createElement("div");
    card.className = "team-card";
    card.innerHTML = `
      <div class="team-card-icon">${team.icon}</div>
      <h3 class="team-card-name">${team.name}</h3>
      <p class="team-card-city">📍 ${team.city}</p>
      <div class="team-card-stats">
        <div class="team-stat-item">
          <strong>${teamStats.pts}</strong>
          <span>Points</span>
        </div>
        <div class="team-stat-item">
          <strong>${teamStats.played}</strong>
          <span>Played</span>
        </div>
        <div class="team-stat-item">
          <strong>${teamStats.won}</strong>
          <span>Wins</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ---------------------------------------------------------
// 7. UPDATE TOP STATS BAR
// ---------------------------------------------------------
function updateOverviewStats() {
  const standings = calculateStandings();
  
  // Total Teams
  document.getElementById("statTeams").textContent = teams.length;

  // Matches Played count
  const playedCount = matches.filter(m => m.played).length;
  document.getElementById("statPlayed").textContent = `${playedCount} / ${matches.length}`;

  // Total Goals scored
  const totalGoals = matches.reduce((sum, m) => {
    return sum + (m.played ? (m.homeScore + m.awayScore) : 0);
  }, 0);
  document.getElementById("statGoals").textContent = totalGoals;

  // Leader team
  if (standings.length > 0 && standings[0].played > 0) {
    document.getElementById("statLeader").textContent = `${standings[0].icon} ${standings[0].name}`;
  } else {
    document.getElementById("statLeader").textContent = standings[0]?.name || "-";
  }
}

// Refresh all UI sections
function renderAll() {
  renderStandings();
  renderMatches();
  renderTeams();
  updateOverviewStats();
}

// ---------------------------------------------------------
// 8. SIMULATE NEXT UNPLAYED MATCH
// ---------------------------------------------------------
function simulateNextMatch() {
  // Find first match that has not been played yet
  const nextMatch = matches.find(m => !m.played);

  if (!nextMatch) {
    alert("All scheduled matches have already been played! You can reset or add a new fixture.");
    return;
  }

  // Generate realistic scores between 0 and 4 goals
  nextMatch.homeScore = Math.floor(Math.random() * 4);
  nextMatch.awayScore = Math.floor(Math.random() * 4);
  nextMatch.played = true;

  saveData();
  renderAll();

  const home = getTeam(nextMatch.homeId);
  const away = getTeam(nextMatch.awayId);
  alert(`⚡ Match Simulated!\n\n${home.name} ${nextMatch.homeScore} - ${nextMatch.awayScore} ${away.name}`);
}

// ---------------------------------------------------------
// 9. EDIT MATCH SCORE MODAL
// ---------------------------------------------------------
const scoreModal = document.getElementById("scoreModal");
const editMatchIdInput = document.getElementById("editMatchId");
const homeScoreInput = document.getElementById("homeScoreInput");
const awayScoreInput = document.getElementById("awayScoreInput");

function openScoreModal(matchId) {
  const match = matches.find(m => m.id === matchId);
  if (!match) return;

  const home = getTeam(match.homeId);
  const away = getTeam(match.awayId);

  document.getElementById("modalTitle").textContent = `${match.round}: Score Editor`;
  document.getElementById("homeTeamLabel").textContent = `${home.icon} ${home.name}`;
  document.getElementById("awayTeamLabel").textContent = `${away.icon} ${away.name}`;

  editMatchIdInput.value = match.id;
  homeScoreInput.value = match.played ? match.homeScore : 0;
  awayScoreInput.value = match.played ? match.awayScore : 0;

  scoreModal.classList.add("open");
}

function closeScoreModal() {
  scoreModal.classList.remove("open");
}

// Handle Save Score submit
document.getElementById("scoreForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const matchId = Number(editMatchIdInput.value);
  const match = matches.find(m => m.id === matchId);

  if (match) {
    match.homeScore = Number(homeScoreInput.value);
    match.awayScore = Number(awayScoreInput.value);
    match.played = true;

    saveData();
    renderAll();
    closeScoreModal();
  }
});

document.getElementById("closeScoreModal").addEventListener("click", closeScoreModal);
document.getElementById("cancelScoreModal").addEventListener("click", closeScoreModal);

// ---------------------------------------------------------
// 10. ADD NEW FIXTURE MODAL
// ---------------------------------------------------------
const newMatchModal = document.getElementById("newMatchModal");
const newHomeTeamSelect = document.getElementById("newHomeTeamSelect");
const newAwayTeamSelect = document.getElementById("newAwayTeamSelect");

function populateTeamSelects() {
  newHomeTeamSelect.innerHTML = "";
  newAwayTeamSelect.innerHTML = "";

  teams.forEach(t => {
    const optHome = document.createElement("option");
    optHome.value = t.id;
    optHome.textContent = `${t.icon} ${t.name}`;
    newHomeTeamSelect.appendChild(optHome);

    const optAway = document.createElement("option");
    optAway.value = t.id;
    optAway.textContent = `${t.icon} ${t.name}`;
    newAwayTeamSelect.appendChild(optAway);
  });

  // Default away team to the second option
  if (newAwayTeamSelect.options.length > 1) {
    newAwayTeamSelect.selectedIndex = 1;
  }
}

function openNewMatchModal() {
  populateTeamSelects();
  newMatchModal.classList.add("open");
}

function closeNewMatchModal() {
  newMatchModal.classList.remove("open");
}

document.getElementById("addMatchBtn").addEventListener("click", openNewMatchModal);
document.getElementById("closeNewMatchModal").addEventListener("click", closeNewMatchModal);
document.getElementById("cancelNewMatchModal").addEventListener("click", closeNewMatchModal);

// Handle new match submission
document.getElementById("newMatchForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const homeId = Number(newHomeTeamSelect.value);
  const awayId = Number(newAwayTeamSelect.value);
  const roundName = document.getElementById("newMatchDate").value.trim();

  if (homeId === awayId) {
    alert("Home team and Away team must be different!");
    return;
  }

  const newMatch = {
    id: Date.now(), // Unique ID
    round: roundName || "Extra Round",
    homeId: homeId,
    awayId: awayId,
    homeScore: null,
    awayScore: null,
    played: false
  };

  matches.push(newMatch);
  saveData();
  renderAll();
  closeNewMatchModal();
  document.getElementById("newMatchForm").reset();
});

// ---------------------------------------------------------
// 11. RESET TOURNAMENT DATA
// ---------------------------------------------------------
function resetTournament() {
  const confirmed = confirm("Are you sure you want to reset all tournament data to defaults?");
  if (confirmed) {
    localStorage.removeItem("tournament_teams");
    localStorage.removeItem("tournament_matches");
    loadData();
    renderAll();
  }
}

document.getElementById("resetBtn").addEventListener("click", resetTournament);
document.getElementById("simulateBtn").addEventListener("click", simulateNextMatch);

// ---------------------------------------------------------
// 12. NAVIGATION TABS LOGIC
// ---------------------------------------------------------
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    // Remove active class from all buttons and tabs
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    // Activate clicked button and target tab
    this.classList.add("active");
    const targetId = this.getAttribute("data-target");
    document.getElementById(targetId).classList.add("active");
  });
});

// ---------------------------------------------------------
// 13. MATCH FILTER BUTTONS (All, Finished, Upcoming)
// ---------------------------------------------------------
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    activeMatchFilter = this.getAttribute("data-filter");
    renderMatches();
  });
});

// ---------------------------------------------------------
// 14. INITIALIZE APPLICATION ON LOAD
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
  loadData();
  renderAll();
});
