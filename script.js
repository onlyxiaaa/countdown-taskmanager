// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let countdowns = [];
let selectedIcon = '📚';
let selectedColor = '#FFB3D9';
let timerInterval = null;
let pomodoroTime = 25 * 60;
let isTimerRunning = false;
let currentMode = 'work';
let zIndexCounter = 100;

// Custom timer durations (in minutes)
let timerModes = {
    work: 25,
    short: 5,
    long: 15
};

// Window state
let draggedWindow = null;
let offsetX = 0;
let offsetY = 0;

// Music state
let currentMusicSource = 'default';

// Notes state
let notes = [];
let currentNoteId = null;
let currentNoteType = 'note'; // 'note' or 'checklist'

// Calendar state
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Theme state
let currentTheme = 'light';

// Wallpaper state
let currentWallpaper = 'gradient-pink';

// ============================================================================
// MOTIVATIONAL QUOTES
// ============================================================================

const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
    { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
    { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
    { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
    { text: "Dream bigger. Do bigger.", author: "Unknown" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
    { text: "Little things make big days.", author: "Unknown" },
    { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
    { text: "Don't wait for opportunity. Create it.", author: "Unknown" },
    { text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.", author: "Unknown" }
];

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadCountdowns();
    loadTimerSettings();
    loadNotes();
    loadTheme();
    loadWallpaper();
    initializeEventListeners();
    initializeWindows();
    initializeMusicPlayer();
    initializeNotesApp();
    initializeCalendar();
    initializeSettings();
    updateAllCountdowns();
    updateMenuTime();
    setInterval(updateAllCountdowns, 1000);
    setInterval(updateMenuTime, 1000);
    displayRandomQuote();
    
    // Open Finder window by default
    openWindow('finderWindow');
});

// ============================================================================
// WINDOW MANAGEMENT
// ============================================================================

function initializeWindows() {
    // Make windows draggable
    const windows = document.querySelectorAll('.window');
    windows.forEach(win => {
        const header = win.querySelector('.window-header');
        
        header.addEventListener('mousedown', startDrag);
        
        // Bring window to front on click
        win.addEventListener('mousedown', () => {
            bringToFront(win);
        });
    });
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
}

function startDrag(e) {
    if (e.target.classList.contains('control-btn')) return;
    
    draggedWindow = e.target.closest('.window');
    const rect = draggedWindow.getBoundingClientRect();
    
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    bringToFront(draggedWindow);
}

function drag(e) {
    if (!draggedWindow) return;
    
    e.preventDefault();
    
    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;
    
    // Keep window within viewport
    const maxX = window.innerWidth - draggedWindow.offsetWidth;
    const maxY = window.innerHeight - draggedWindow.offsetHeight - 100;
    
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(28, Math.min(newY, maxY));
    
    draggedWindow.style.left = newX + 'px';
    draggedWindow.style.top = newY + 'px';
    draggedWindow.style.transform = 'none';
}

function endDrag() {
    draggedWindow = null;
}

function bringToFront(window) {
    zIndexCounter++;
    window.style.zIndex = zIndexCounter;
}

function openWindow(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;
    
    window.classList.add('active');
    bringToFront(window);
}

function closeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;
    
    window.classList.remove('active');
}

function minimizeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;
    
    window.classList.add('minimizing');
    setTimeout(() => {
        window.classList.remove('active', 'minimizing');
    }, 300);
}

function maximizeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (!window) return;
    
    if (window.style.width === '90vw') {
        window.style.width = '';
        window.style.height = '';
        window.style.left = '';
        window.style.top = '';
    } else {
        window.style.width = '90vw';
        window.style.height = '85vh';
        window.style.left = '5vw';
        window.style.top = '50px';
        window.style.transform = 'none';
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function initializeEventListeners() {
    // Form submission
    document.getElementById('countdownForm').addEventListener('submit', handleFormSubmit);
    
    // Icon picker
    document.querySelectorAll('.icon-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedIcon = this.dataset.icon;
        });
    });
    
    // Color picker
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedColor = this.dataset.color;
        });
    });
    
    // Dock items
    document.querySelectorAll('.dock-item').forEach(item => {
        item.addEventListener('click', function() {
            const windowId = this.dataset.window;
            const window = document.getElementById(windowId);
            
            if (window.classList.contains('active')) {
                if (window.style.zIndex == zIndexCounter) {
                    minimizeWindow(windowId);
                } else {
                    bringToFront(window);
                }
            } else {
                openWindow(windowId);
            }
        });
    });
    
    // Finder app icons
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.addEventListener('dblclick', function() {
            const appType = this.dataset.app;
            const windowMap = {
                'calendar': 'calendarWindow',
                'notes': 'notesWindow',
                'countdown': 'countdownWindow',
                'create': 'createWindow',
                'pomodoro': 'pomodoroWindow',
                'quotes': 'quotesWindow',
                'music': 'musicWindow',
                'settings': 'settingsWindow'
            };
            
            const windowId = windowMap[appType];
            if (windowId) {
                openWindow(windowId);
            }
        });
    });
    
    // Music toggle in menu bar
    document.getElementById('musicIcon').addEventListener('click', toggleMusic);
    
    // Pomodoro controls
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
    
    // Pomodoro mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentMode = this.dataset.mode;
            pomodoroTime = timerModes[currentMode] * 60;
            updateTimerDisplay();
            if (isTimerRunning) {
                pauseTimer();
            }
        });
    });
    
    // Save timer settings
    document.getElementById('saveTimerSettings').addEventListener('click', saveTimerSettings);
    
    // Quote button
    document.getElementById('newQuote').addEventListener('click', displayRandomQuote);
}

// ============================================================================
// MUSIC PLAYER
// ============================================================================

function initializeMusicPlayer() {
    // Music source tabs
    document.querySelectorAll('.source-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const source = this.dataset.source;
            
            // Update active tab
            document.querySelectorAll('.source-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.music-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`${source}MusicContent`).classList.add('active');
            
            currentMusicSource = source;
        });
    });
    
    // Default player play/pause
    document.getElementById('playPauseBtn').addEventListener('click', toggleDefaultMusic);
    
    // Spotify load button
    document.getElementById('loadSpotifyBtn').addEventListener('click', loadSpotifyPlayer);
}

function toggleDefaultMusic() {
    const music = document.getElementById('bgMusic');
    const playIcon = document.getElementById('playIcon');
    
    if (music.paused) {
        music.play();
        playIcon.textContent = '⏸️';
        showNotification('🎵 Music playing', 'info');
    } else {
        music.pause();
        playIcon.textContent = '▶️';
        showNotification('🎵 Music paused', 'info');
    }
}

function loadSpotifyPlayer() {
    const input = document.getElementById('spotifyUri').value.trim();
    
    if (!input) {
        showNotification('⚠️ Please enter a Spotify URI or link', 'error');
        return;
    }
    
    let embedUrl = '';
    
    // Handle direct Spotify links
    if (input.includes('open.spotify.com')) {
        // Extract the embed URL from the link
        // Example: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
        const match = input.match(/open\.spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
        if (match) {
            embedUrl = `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
        } else {
            showNotification('⚠️ Invalid Spotify link', 'error');
            return;
        }
    }
    // Handle Spotify URI format
    else if (input.startsWith('spotify:')) {
        // Example: spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
        const parts = input.split(':');
        if (parts.length === 3) {
            embedUrl = `https://open.spotify.com/embed/${parts[1]}/${parts[2]}`;
        } else {
            showNotification('⚠️ Invalid Spotify URI format', 'error');
            return;
        }
    }
    else {
        showNotification('⚠️ Please enter a valid Spotify link or URI', 'error');
        return;
    }
    
    // Create Spotify embed
    const container = document.getElementById('spotifyPlayerContainer');
    container.innerHTML = `
        <iframe 
            src="${embedUrl}?utm_source=generator" 
            width="100%" 
            height="352" 
            frameBorder="0" 
            allowfullscreen="" 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy">
        </iframe>
    `;
    
    // Show login reminder
    document.getElementById('spotifyLoginReminder').style.display = 'block';
    
    showNotification('✅ Spotify player loaded! Make sure you\'re logged in for full playback.', 'success');
}

function toggleMusic() {
    if (currentMusicSource === 'default') {
        toggleDefaultMusic();
    } else {
        showNotification('💡 Control Spotify from the Music Player window', 'info');
        openWindow('musicWindow');
    }
}

// ============================================================================
// POMODORO TIMER
// ============================================================================

function loadTimerSettings() {
    const saved = localStorage.getItem('timerSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        timerModes = settings;
        
        // Update input fields
        document.getElementById('workDuration').value = settings.work;
        document.getElementById('shortBreakDuration').value = settings.short;
        document.getElementById('longBreakDuration').value = settings.long;
    }
    
    // Initialize timer with current mode
    pomodoroTime = timerModes[currentMode] * 60;
    updateTimerDisplay();
}

function saveTimerSettings() {
    const work = parseInt(document.getElementById('workDuration').value);
    const shortBreak = parseInt(document.getElementById('shortBreakDuration').value);
    const longBreak = parseInt(document.getElementById('longBreakDuration').value);
    
    // Validate inputs
    if (work < 1 || work > 120 || shortBreak < 1 || shortBreak > 60 || longBreak < 1 || longBreak > 60) {
        showNotification('⚠️ Please enter valid durations', 'error');
        return;
    }
    
    timerModes = {
        work: work,
        short: shortBreak,
        long: longBreak
    };
    
    // Save to localStorage
    localStorage.setItem('timerSettings', JSON.stringify(timerModes));
    
    // Reset current timer
    pomodoroTime = timerModes[currentMode] * 60;
    updateTimerDisplay();
    
    if (isTimerRunning) {
        pauseTimer();
    }
    
    showNotification('✅ Timer settings saved!', 'success');
}

function startTimer() {
    if (!isTimerRunning) {
        isTimerRunning = true;
        timerInterval = setInterval(() => {
            if (pomodoroTime > 0) {
                pomodoroTime--;
                updateTimerDisplay();
            } else {
                pauseTimer();
                showNotification('🎉 Time\'s up! Great work!', 'success');
                pomodoroTime = timerModes[currentMode] * 60;
                updateTimerDisplay();
            }
        }, 1000);
    }
}

function pauseTimer() {
    isTimerRunning = false;
    clearInterval(timerInterval);
}

function resetTimer() {
    pauseTimer();
    pomodoroTime = timerModes[currentMode] * 60;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(pomodoroTime / 60);
    const seconds = pomodoroTime % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================================================
// MENU BAR
// ============================================================================

function updateMenuTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    const timeString = `${displayHours}:${displayMinutes} ${ampm}`;
    document.getElementById('menuTime').textContent = timeString;
}

// ============================================================================
// COUNTDOWN MANAGEMENT
// ============================================================================

function handleFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('eventName').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    
    const countdown = {
        id: Date.now(),
        name,
        date,
        time,
        icon: selectedIcon,
        color: selectedColor,
        targetDate: new Date(`${date}T${time}`).getTime()
    };
    
    countdowns.push(countdown);
    saveCountdowns();
    renderCountdowns();
    
    document.getElementById('countdownForm').reset();
    showNotification('✨ Countdown added successfully!', 'success');
    
    // Open countdowns window
    openWindow('countdownWindow');
}

function deleteCountdown(id) {
    countdowns = countdowns.filter(c => c.id !== id);
    saveCountdowns();
    renderCountdowns();
}

function renderCountdowns() {
    const container = document.getElementById('countdownsList');
    
    if (countdowns.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-emoji">📅</span>
                <p>No countdowns yet! Create your first one. 🌸</p>
            </div>
        `;
        return;
    }
    
    const sortedCountdowns = [...countdowns].sort((a, b) => a.targetDate - b.targetDate);
    
    container.innerHTML = sortedCountdowns.map(countdown => {
        const timeLeft = calculateTimeLeft(countdown.targetDate);
        
        return `
            <div class="countdown-card" style="border-left-color: ${countdown.color};">
                <div class="countdown-header">
                    <div class="countdown-icon">${countdown.icon}</div>
                    <div class="countdown-info">
                        <div class="countdown-name">${countdown.name}</div>
                        <div class="countdown-date">${formatDate(countdown.date, countdown.time)}</div>
                    </div>
                    <button class="btn-delete" onclick="deleteCountdown(${countdown.id})">🗑️</button>
                </div>
                ${timeLeft.expired ? 
                    `<div class="countdown-expired">
                        <p>🎉 This event has passed! 🎉</p>
                    </div>` :
                    `<div class="countdown-time">
                        <div class="time-unit" style="background: linear-gradient(135deg, ${countdown.color}20, ${countdown.color}35);">
                            <span class="time-value" style="color: ${countdown.color};">${timeLeft.days}</span>
                            <span class="time-label">Days</span>
                        </div>
                        <div class="time-unit" style="background: linear-gradient(135deg, ${countdown.color}20, ${countdown.color}35);">
                            <span class="time-value" style="color: ${countdown.color};">${timeLeft.hours}</span>
                            <span class="time-label">Hours</span>
                        </div>
                        <div class="time-unit" style="background: linear-gradient(135deg, ${countdown.color}20, ${countdown.color}35);">
                            <span class="time-value" style="color: ${countdown.color};">${timeLeft.minutes}</span>
                            <span class="time-label">Minutes</span>
                        </div>
                        <div class="time-unit" style="background: linear-gradient(135deg, ${countdown.color}20, ${countdown.color}35);">
                            <span class="time-value" style="color: ${countdown.color};">${timeLeft.seconds}</span>
                            <span class="time-label">Seconds</span>
                        </div>
                    </div>`
                }
            </div>
        `;
    }).join('');
}

function calculateTimeLeft(targetDate) {
    const now = new Date().getTime();
    const difference = targetDate - now;
    
    if (difference < 0) {
        return { expired: true };
    }
    
    return {
        expired: false,
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
}

function updateAllCountdowns() {
    renderCountdowns();
}

function formatDate(date, time) {
    const d = new Date(`${date}T${time}`);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return d.toLocaleDateString('en-US', options);
}

// ============================================================================
// LOCAL STORAGE
// ============================================================================

function saveCountdowns() {
    localStorage.setItem('countdowns', JSON.stringify(countdowns));
}

function loadCountdowns() {
    const saved = localStorage.getItem('countdowns');
    if (saved) {
        countdowns = JSON.parse(saved);
        renderCountdowns();
    }
}

// ============================================================================
// QUOTES
// ============================================================================

function displayRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');
    
    quoteText.style.opacity = '0';
    quoteAuthor.style.opacity = '0';
    
    setTimeout(() => {
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `- ${quote.author}`;
        
        quoteText.style.transition = 'opacity 0.5s ease-in';
        quoteAuthor.style.transition = 'opacity 0.5s ease-in';
        quoteText.style.opacity = '1';
        quoteAuthor.style.opacity = '1';
    }, 300);
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #B4E7CE, #B4D4FF)' : 
                      type === 'error' ? 'linear-gradient(135deg, #FFB5B5, #FFB3D9)' :
                      'linear-gradient(135deg, #D4C5F9, #E0BBE4)'};
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 13px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        backdrop-filter: blur(10px);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// ============================================================================
// NOTES APP
// ============================================================================

function initializeNotesApp() {
    // New note button
    document.getElementById('newNoteBtn').addEventListener('click', createNewNote);
    
    // Note title input
    document.getElementById('noteTitle').addEventListener('input', saveCurrentNote);
    
    // Note text input
    document.getElementById('noteText').addEventListener('input', saveCurrentNote);
    
    // Toggle note type
    document.getElementById('noteTypeToggle').addEventListener('click', toggleNoteType);
    
    // Delete note button
    document.getElementById('deleteNoteBtn').addEventListener('click', deleteCurrentNote);
    
    // Add checklist item
    document.getElementById('addChecklistBtn').addEventListener('click', addChecklistItem);
    document.getElementById('newChecklistItem').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addChecklistItem();
        }
    });
    
    renderNotesList();
}

function createNewNote() {
    const note = {
        id: Date.now(),
        type: 'note',
        title: 'Untitled Note',
        content: '',
        checklist: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    notes.unshift(note);
    saveNotes();
    renderNotesList();
    selectNote(note.id);
    
    // Focus on title
    setTimeout(() => {
        document.getElementById('noteTitle').focus();
        document.getElementById('noteTitle').select();
    }, 100);
}

function selectNote(noteId) {
    currentNoteId = noteId;
    const note = notes.find(n => n.id === noteId);
    
    if (!note) return;
    
    // Show editor, hide empty state
    document.getElementById('notesEmptyState').style.display = 'none';
    document.getElementById('notesEditorArea').style.display = 'flex';
    
    // Load note data
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteText').value = note.content;
    currentNoteType = note.type;
    
    // Update type toggle icon
    updateTypeToggleIcon();
    
    // Show appropriate content area
    if (note.type === 'checklist') {
        document.getElementById('regularNoteContent').style.display = 'none';
        document.getElementById('checklistContent').style.display = 'block';
        renderChecklist(note);
    } else {
        document.getElementById('regularNoteContent').style.display = 'block';
        document.getElementById('checklistContent').style.display = 'none';
    }
    
    // Update metadata
    document.getElementById('noteDate').textContent = formatNoteDate(note.updatedAt);
    
    // Update active state in list
    document.querySelectorAll('.note-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.noteId) === noteId) {
            item.classList.add('active');
        }
    });
}

function saveCurrentNote() {
    if (!currentNoteId) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    
    note.title = document.getElementById('noteTitle').value || 'Untitled Note';
    note.content = document.getElementById('noteText').value;
    note.updatedAt = new Date().toISOString();
    
    saveNotes();
    renderNotesList();
    document.getElementById('noteDate').textContent = formatNoteDate(note.updatedAt);
}

function toggleNoteType() {
    if (!currentNoteId) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    
    // Toggle between note and checklist
    if (note.type === 'note') {
        note.type = 'checklist';
        // Convert note content to checklist items if there's content
        if (note.content.trim()) {
            const lines = note.content.split('\n').filter(line => line.trim());
            note.checklist = lines.map(line => ({
                id: Date.now() + Math.random(),
                text: line,
                completed: false
            }));
        }
        document.getElementById('regularNoteContent').style.display = 'none';
        document.getElementById('checklistContent').style.display = 'block';
        renderChecklist(note);
    } else {
        note.type = 'note';
        // Convert checklist items to note content
        note.content = note.checklist.map(item => item.text).join('\n');
        document.getElementById('regularNoteContent').style.display = 'block';
        document.getElementById('checklistContent').style.display = 'none';
        document.getElementById('noteText').value = note.content;
    }
    
    currentNoteType = note.type;
    updateTypeToggleIcon();
    saveNotes();
    renderNotesList();
}

function updateTypeToggleIcon() {
    const icon = document.getElementById('noteTypeIcon');
    if (currentNoteType === 'note') {
        icon.textContent = '☑️';
        document.getElementById('noteTypeToggle').title = 'Switch to checklist';
    } else {
        icon.textContent = '📝';
        document.getElementById('noteTypeToggle').title = 'Switch to note';
    }
}

function renderChecklist(note) {
    const container = document.getElementById('checklistItems');
    
    if (!note.checklist || note.checklist.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = note.checklist.map(item => `
        <div class="checklist-item ${item.completed ? 'completed' : ''}" data-item-id="${item.id}">
            <input type="checkbox" ${item.completed ? 'checked' : ''} 
                   onchange="toggleChecklistItem(${item.id})">
            <span class="checklist-item-text">${escapeHtml(item.text)}</span>
            <button class="btn-remove-item" onclick="removeChecklistItem(${item.id})">✕</button>
        </div>
    `).join('');
}

function addChecklistItem() {
    if (!currentNoteId) return;
    
    const input = document.getElementById('newChecklistItem');
    const text = input.value.trim();
    
    if (!text) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    
    if (!note.checklist) {
        note.checklist = [];
    }
    
    const item = {
        id: Date.now() + Math.random(),
        text: text,
        completed: false
    };
    
    note.checklist.push(item);
    note.updatedAt = new Date().toISOString();
    
    saveNotes();
    renderChecklist(note);
    renderNotesList();
    
    input.value = '';
    input.focus();
}

function toggleChecklistItem(itemId) {
    if (!currentNoteId) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    
    const item = note.checklist.find(i => i.id === itemId);
    if (!item) return;
    
    item.completed = !item.completed;
    note.updatedAt = new Date().toISOString();
    
    saveNotes();
    renderChecklist(note);
}

function removeChecklistItem(itemId) {
    if (!currentNoteId) return;
    
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    
    note.checklist = note.checklist.filter(i => i.id !== itemId);
    note.updatedAt = new Date().toISOString();
    
    saveNotes();
    renderChecklist(note);
    renderNotesList();
}

function deleteCurrentNote() {
    if (!currentNoteId) return;
    
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    notes = notes.filter(n => n.id !== currentNoteId);
    currentNoteId = null;
    
    saveNotes();
    renderNotesList();
    
    // Show empty state
    document.getElementById('notesEmptyState').style.display = 'flex';
    document.getElementById('notesEditorArea').style.display = 'none';
    
    showNotification('🗑️ Note deleted', 'success');
}

function renderNotesList() {
    const container = document.getElementById('notesList');
    
    if (notes.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-light); font-size: 13px;">No notes yet</p>';
        return;
    }
    
    container.innerHTML = notes.map(note => {
        let preview = '';
        if (note.type === 'checklist') {
            const itemCount = note.checklist ? note.checklist.length : 0;
            const completedCount = note.checklist ? note.checklist.filter(i => i.completed).length : 0;
            preview = `${completedCount}/${itemCount} completed`;
        } else {
            preview = note.content.substring(0, 50) || 'No additional text';
        }
        
        return `
            <div class="note-item ${currentNoteId === note.id ? 'active' : ''}" 
                 data-note-id="${note.id}" 
                 onclick="selectNote(${note.id})">
                <div class="note-item-title">
                    ${note.type === 'checklist' ? '☑️ ' : ''}${escapeHtml(note.title)}
                </div>
                <div class="note-item-preview">${escapeHtml(preview)}</div>
                <div class="note-item-date">${formatShortDate(note.updatedAt)}</div>
            </div>
        `;
    }).join('');
}

function formatNoteDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

function formatShortDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Less than 24 hours
    if (diff < 86400000) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Less than a week
    if (diff < 604800000) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    // Older
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

function loadNotes() {
    const saved = localStorage.getItem('notes');
    if (saved) {
        notes = JSON.parse(saved);
        renderNotesList();
    }
}

// ============================================================================
// CALENDAR APP
// ============================================================================

function initializeCalendar() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    renderCalendar();
    renderUpcomingEvents();
}

function renderCalendar() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    
    document.getElementById('calendarMonthYear').textContent = 
        `${monthNames[currentMonth]} ${currentYear}`;
    
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    const today = new Date();
    const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        dayEl.textContent = day;
        calendarDays.appendChild(dayEl);
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;
        
        if (isCurrentMonth && day === today.getDate()) {
            dayEl.classList.add('today');
        }
        
        // Check if day has countdown events
        const hasEvent = countdowns.some(c => {
            const eventDate = new Date(c.date);
            return eventDate.getDate() === day && 
                   eventDate.getMonth() === currentMonth && 
                   eventDate.getFullYear() === currentYear;
        });
        
        if (hasEvent) {
            dayEl.classList.add('has-event');
        }
        
        calendarDays.appendChild(dayEl);
    }
    
    // Next month days
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells; // 6 rows x 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day other-month';
        dayEl.textContent = day;
        calendarDays.appendChild(dayEl);
    }
}

function renderUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    
    // Get upcoming countdowns
    const now = new Date().getTime();
    const upcoming = countdowns
        .filter(c => c.targetDate > now)
        .sort((a, b) => a.targetDate - b.targetDate)
        .slice(0, 5);
    
    if (upcoming.length === 0) {
        container.innerHTML = '<div class="no-events">No upcoming events</div>';
        return;
    }
    
    container.innerHTML = upcoming.map(event => `
        <div class="event-item" style="border-left-color: ${event.color};">
            <div class="event-name">${event.icon} ${escapeHtml(event.name)}</div>
            <div class="event-date">${formatDate(event.date, event.time)}</div>
        </div>
    `).join('');
}

// ============================================================================
// SETTINGS APP
// ============================================================================

function initializeSettings() {
    // Dark mode toggle in menu bar
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Dark mode toggle in settings
    document.getElementById('darkModeToggle').addEventListener('change', function() {
        currentTheme = this.checked ? 'dark' : 'light';
        applyTheme();
        saveTheme();
    });
    
    // Wallpaper presets
    document.querySelectorAll('.wallpaper-preset').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.wallpaper-preset').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentWallpaper = this.dataset.wallpaper;
            applyWallpaper();
            saveWallpaper();
        });
    });
    
    // Solid color picker
    document.getElementById('applySolidColor').addEventListener('click', () => {
        const color = document.getElementById('solidColorPicker').value;
        document.querySelectorAll('.wallpaper-preset').forEach(b => b.classList.remove('active'));
        currentWallpaper = `solid:${color}`;
        applyWallpaper();
        saveWallpaper();
        showNotification('✅ Wallpaper updated!', 'success');
    });
    
    // Image upload
    document.getElementById('chooseImageBtn').addEventListener('click', () => {
        document.getElementById('wallpaperImageInput').click();
    });
    
    document.getElementById('wallpaperImageInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.querySelectorAll('.wallpaper-preset').forEach(b => b.classList.remove('active'));
                currentWallpaper = `image:${event.target.result}`;
                applyWallpaper();
                saveWallpaper();
                document.getElementById('removeImageBtn').style.display = 'inline-block';
                showNotification('✅ Wallpaper updated!', 'success');
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Remove image
    document.getElementById('removeImageBtn').addEventListener('click', () => {
        currentWallpaper = 'gradient-pink';
        applyWallpaper();
        saveWallpaper();
        document.getElementById('removeImageBtn').style.display = 'none';
        document.getElementById('wallpaperImageInput').value = '';
        document.querySelector('[data-wallpaper="gradient-pink"]').classList.add('active');
        showNotification('✅ Wallpaper reset!', 'success');
    });
    
    // Reset wallpaper
    document.getElementById('resetWallpaper').addEventListener('click', () => {
        currentWallpaper = 'gradient-pink';
        applyWallpaper();
        saveWallpaper();
        document.querySelectorAll('.wallpaper-preset').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-wallpaper="gradient-pink"]').classList.add('active');
        document.getElementById('removeImageBtn').style.display = 'none';
        document.getElementById('wallpaperImageInput').value = '';
        showNotification('✅ Wallpaper reset to default!', 'success');
    });
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveTheme();
}

function applyTheme() {
    document.body.setAttribute('data-theme', currentTheme);
    document.getElementById('darkModeToggle').checked = currentTheme === 'dark';
    
    // Update theme toggle icon
    const themeIcon = document.getElementById('themeToggle');
    themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

function saveTheme() {
    localStorage.setItem('theme', currentTheme);
}

function loadTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) {
        currentTheme = saved;
        applyTheme();
    }
}

function applyWallpaper() {
    const desktopBg = document.getElementById('desktopBg');
    
    const wallpapers = {
        'gradient-pink': 'linear-gradient(135deg, #FFE5EC 0%, #E5E5FF 50%, #E5FFF0 100%)',
        'gradient-blue': 'linear-gradient(135deg, #E0F4FF 0%, #D4E7FF 50%, #E0F0FF 100%)',
        'gradient-purple': 'linear-gradient(135deg, #F0E5FF 0%, #E5D4FF 50%, #F5E5FF 100%)',
        'gradient-green': 'linear-gradient(135deg, #E5FFF0 0%, #D4FFE5 50%, #E5FFEA 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FFE5D9 0%, #FFDAB9 50%, #FFE5D4 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #D4F4FF 0%, #B4E4FF 50%, #D4EEFF 100%)'
    };
    
    if (currentWallpaper.startsWith('solid:')) {
        const color = currentWallpaper.replace('solid:', '');
        desktopBg.style.background = color;
        desktopBg.style.backgroundImage = 'none';
    } else if (currentWallpaper.startsWith('image:')) {
        const imageData = currentWallpaper.replace('image:', '');
        desktopBg.style.backgroundImage = `url(${imageData})`;
        desktopBg.style.backgroundSize = 'cover';
        desktopBg.style.backgroundPosition = 'center';
        desktopBg.style.backgroundRepeat = 'no-repeat';
    } else if (wallpapers[currentWallpaper]) {
        desktopBg.style.background = wallpapers[currentWallpaper];
        desktopBg.style.backgroundImage = wallpapers[currentWallpaper];
    }
}

function saveWallpaper() {
    localStorage.setItem('wallpaper', currentWallpaper);
}

function loadWallpaper() {
    const saved = localStorage.getItem('wallpaper');
    if (saved) {
        currentWallpaper = saved;
        
        // Update active preset button if applicable
        if (!saved.startsWith('solid:') && !saved.startsWith('image:')) {
            document.querySelectorAll('.wallpaper-preset').forEach(b => {
                b.classList.remove('active');
                if (b.dataset.wallpaper === saved) {
                    b.classList.add('active');
                }
            });
        }
        
        // Show remove button if image
        if (saved.startsWith('image:')) {
            document.getElementById('removeImageBtn').style.display = 'inline-block';
        }
        
        applyWallpaper();
    }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
