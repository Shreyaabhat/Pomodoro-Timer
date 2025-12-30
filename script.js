// script.js

class PomodoroTimer {
  constructor() {
    this.modes = {
      pomodoro: 25 * 60,
      short: 5 * 60,
      long: 15 * 60,
    };

    this.currentMode = "pomodoro";
    this.timeLeft = this.modes.pomodoro;
    this.isRunning = false;
    this.timerId = null;

    this.completedPomodoros = 0;
    this.totalFocusTime = 0;
    this.streak = 0;

    this.statsHistory = this.loadStatsHistory(); // date -> pomos
    this.todayKey = this.dateKey(new Date());

    this.achievements = [];
    this.goals = {
      daily: 8,
      weekly: 40,
    };

    this.theme = "light";

    this.customSoundUrl = null;
    this.currentSound = "beep";

    this.initElements();
    this.loadSettings();
    this.loadStats();
    this.attachEventListeners();
    this.updateDisplay();
    this.renderAchievements();
    this.updateGoalsProgress();
    this.requestNotificationPermission();
    this.initTheme();
    this.drawGraph("week");
  }

  // ---------- Init / elements ----------

  initElements() {
    this.timeDisplay = document.getElementById("time-display");
    this.timerLabel = document.getElementById("timer-label");
    this.startBtn = document.getElementById("start-btn");
    this.resetBtn = document.getElementById("reset-btn");
    this.modeBtns = document.querySelectorAll(".mode-btn");
    this.progressBar = document.querySelector(".progress-ring-bar");
    this.completedPomodorosEl = document.getElementById("completed-pomodoros");
    this.totalTimeEl = document.getElementById("total-time");
    this.streakEl = document.getElementById("streak");

    this.pomodoroDurationInput = document.getElementById("pomodoro-duration");
    this.shortBreakInput = document.getElementById("short-break-duration");
    this.longBreakInput = document.getElementById("long-break-duration");
    this.autoStartCheckbox = document.getElementById("auto-start");
    this.notificationsCheckbox = document.getElementById("notifications");

    this.taskInput = document.getElementById("task-input");
    this.taskDisplay = document.getElementById("task-display");

    this.themeToggle = document.getElementById("theme-toggle");

    this.settingsToggle = document.getElementById("settings-toggle");
    this.settingsDrawer = document.getElementById("settings-drawer");
    this.settingsClose = document.getElementById("settings-close");

    this.soundSelect = document.getElementById("sound-select");
    this.customSoundInput = document.getElementById("custom-sound");
    this.customSoundAudio = document.getElementById("custom-sound-audio");

    this.dailyGoalInput = document.getElementById("daily-goal");
    this.weeklyGoalInput = document.getElementById("weekly-goal");
    this.dailyGoalDisplay = document.getElementById("daily-goal-display");
    this.weeklyGoalDisplay = document.getElementById("weekly-goal-display");
    this.todayPomosEl = document.getElementById("today-pomos");
    this.weekPomosEl = document.getElementById("week-pomos");
    this.achievementList = document.getElementById("achievement-list");

    this.graphTabs = document.querySelectorAll(".graph-tab");
    this.graphCanvas = document.getElementById("stats-graph");
    this.graphCtx = this.graphCanvas.getContext("2d");

    this.syncCodeInput = document.getElementById("sync-code");
    this.syncStatus = document.getElementById("sync-status");
    this.syncPullBtn = document.getElementById("sync-pull");
    this.syncPushBtn = document.getElementById("sync-push");

    this.exportCalendarBtn = document.getElementById("export-calendar");

    this.circumference = 2 * Math.PI * 130;
    this.progressBar.style.strokeDasharray = this.circumference;
  }

  attachEventListeners() {
    this.startBtn.addEventListener("click", () => this.toggleTimer());
    this.resetBtn.addEventListener("click", () => this.resetTimer());

    this.modeBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (!this.isRunning) {
          this.switchMode(e.target.dataset.mode);
        }
      });
    });

    this.pomodoroDurationInput.addEventListener("change", () =>
      this.updateSettings()
    );
    this.shortBreakInput.addEventListener("change", () =>
      this.updateSettings()
    );
    this.longBreakInput.addEventListener("change", () =>
      this.updateSettings()
    );
    this.autoStartCheckbox.addEventListener("change", () => this.saveSettings());
    this.notificationsCheckbox.addEventListener("change", () =>
      this.saveSettings()
    );

    this.taskInput.addEventListener("input", (e) => {
      if (e.target.value.trim()) {
        this.taskDisplay.textContent = `Working on: ${e.target.value}`;
        this.taskDisplay.classList.remove("hidden");
      } else {
        this.taskDisplay.classList.add("hidden");
      }
    });

    // Theme
    this.themeToggle.addEventListener("click", () => this.toggleTheme());

    // Settings drawer
    this.settingsToggle.addEventListener("click", () =>
      this.settingsDrawer.classList.add("open")
    );
    this.settingsClose.addEventListener("click", () =>
      this.settingsDrawer.classList.remove("open")
    );

    // Sound
    this.soundSelect.addEventListener("change", () => {
      this.currentSound = this.soundSelect.value;
      this.saveSettings();
    });

    this.customSoundInput.addEventListener("change", (e) =>
      this.handleCustomSoundUpload(e)
    );

    // Goals
    this.dailyGoalInput.addEventListener("change", () => {
      this.goals.daily = Math.max(1, Number(this.dailyGoalInput.value) || 1);
      this.dailyGoalDisplay.textContent = this.goals.daily;
      this.saveSettings();
      this.updateGoalsProgress();
    });

    this.weeklyGoalInput.addEventListener("change", () => {
      this.goals.weekly = Math.max(1, Number(this.weeklyGoalInput.value) || 1);
      this.weeklyGoalDisplay.textContent = this.goals.weekly;
      this.saveSettings();
      this.updateGoalsProgress();
    });

    // Graph range toggle
    this.graphTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        this.graphTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.drawGraph(tab.dataset.range);
      });
    });

    // Sync
    this.syncPullBtn.addEventListener("click", () => this.syncFromCloud());
    this.syncPushBtn.addEventListener("click", () => this.syncToCloud());

    // Calendar export
    this.exportCalendarBtn.addEventListener("click", () =>
      this.exportToCalendar()
    );
  }

  // ---------- Timer core ----------

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isRunning = true;
    this.startBtn.textContent = "Pause";
    const startTime = Date.now();
    const initialTimeLeft = this.timeLeft;

    this.timerId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      this.timeLeft = initialTimeLeft - elapsed;
      if (this.timeLeft <= 0) {
        this.timerComplete();
      } else {
        this.updateDisplay();
      }
    }, 200);
  }

  pauseTimer() {
    this.isRunning = false;
    clearInterval(this.timerId);
    this.startBtn.textContent = "Resume";
  }

  resetTimer() {
    this.isRunning = false;
    clearInterval(this.timerId);
    this.timeLeft = this.modes[this.currentMode];
    this.updateDisplay();
    this.startBtn.textContent = "Start";
  }

  timerComplete() {
    this.pauseTimer();
    this.playSound();

    if (this.currentMode === "pomodoro") {
      this.completedPomodoros++;
      this.totalFocusTime += this.modes.pomodoro;

      // update stats history
      const todayKey = this.dateKey(new Date());
      this.statsHistory[todayKey] = (this.statsHistory[todayKey] || 0) + 1;
      this.saveStatsHistory();

      this.updateStats();
      this.saveStats();
      this.updateGoalsProgress();
      this.checkAchievements();
      this.drawGraph(
        document.querySelector(".graph-tab.active").dataset.range
      );

      this.showNotification(
        "Pomodoro Complete!",
        "Great job! Time for a break."
      );
      const nextMode = this.completedPomodoros % 4 === 0 ? "long" : "short";

      if (this.autoStartCheckbox.checked) {
        setTimeout(() => {
          this.switchMode(nextMode);
          this.startTimer();
        }, 3000);
      } else {
        this.switchMode(nextMode);
      }
    } else {
      this.showNotification("Break Complete!", "Ready to focus again?");
      if (this.autoStartCheckbox.checked) {
        setTimeout(() => {
          this.switchMode("pomodoro");
          this.startTimer();
        }, 3000);
      } else {
        this.switchMode("pomodoro");
      }
    }
  }

  switchMode(mode) {
    this.currentMode = mode;
    this.timeLeft = this.modes[mode];

    this.modeBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    const labels = {
      pomodoro: "Focus Time",
      short: "Short Break",
      long: "Long Break",
    };

    this.timerLabel.textContent = labels[mode];
    this.updateDisplay();
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.timeDisplay.textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    const totalTime = this.modes[this.currentMode];
    const progress =
      ((totalTime - this.timeLeft) / totalTime) * this.circumference;
    this.progressBar.style.strokeDashoffset = this.circumference - progress;

    document.title = `${this.timeDisplay.textContent} - Pomodoro Timer`;
  }

  // ---------- Stats & goals ----------

  updateStats() {
    this.completedPomodorosEl.textContent = this.completedPomodoros;
    const hours = Math.floor(this.totalFocusTime / 3600);
    const minutes = Math.floor((this.totalFocusTime % 3600) / 60);
    this.totalTimeEl.textContent = `${hours}h ${minutes}m`;
    this.streakEl.textContent = this.streak;
  }

  updateGoalsProgress() {
    const todayKey = this.dateKey(new Date());
    const weekKeys = this.getLastDaysKeys(7);
    const todayCount = this.statsHistory[todayKey] || 0;
    const weekCount = weekKeys.reduce(
      (acc, k) => acc + (this.statsHistory[k] || 0),
      0
    );

    this.todayPomosEl.textContent = todayCount;
    this.weekPomosEl.textContent = weekCount;
    this.dailyGoalDisplay.textContent = this.goals.daily;
    this.weeklyGoalDisplay.textContent = this.goals.weekly;
  }

  // ---------- Settings ----------

  updateSettings() {
    this.modes.pomodoro = parseInt(this.pomodoroDurationInput.value) * 60;
    this.modes.short = parseInt(this.shortBreakInput.value) * 60;
    this.modes.long = parseInt(this.longBreakInput.value) * 60;
    if (!this.isRunning) {
      this.timeLeft = this.modes[this.currentMode];
      this.updateDisplay();
    }
    this.saveSettings();
  }

  saveSettings() {
    const settings = {
      pomodoroDuration: this.pomodoroDurationInput.value,
      shortBreak: this.shortBreakInput.value,
      longBreak: this.longBreakInput.value,
      autoStart: this.autoStartCheckbox.checked,
      notifications: this.notificationsCheckbox.checked,
      goals: this.goals,
      sound: this.currentSound,
      customSoundUrl: this.customSoundUrl,
      theme: this.theme,
    };
    localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
  }

  loadSettings() {
    const settings = JSON.parse(localStorage.getItem("pomodoroSettings"));
    if (settings) {
      this.pomodoroDurationInput.value = settings.pomodoroDuration || 25;
      this.shortBreakInput.value = settings.shortBreak || 5;
      this.longBreakInput.value = settings.longBreak || 15;
      this.autoStartCheckbox.checked = settings.autoStart || false;
      this.notificationsCheckbox.checked = settings.notifications !== false;

      this.modes.pomodoro =
        parseInt(settings.pomodoroDuration || 25) * 60;
      this.modes.short = parseInt(settings.shortBreak || 5) * 60;
      this.modes.long = parseInt(settings.longBreak || 15) * 60;
      this.timeLeft = this.modes.pomodoro;

      if (settings.goals) {
        this.goals = settings.goals;
      }
      this.dailyGoalInput.value = this.goals.daily;
      this.weeklyGoalInput.value = this.goals.weekly;

      if (settings.sound) {
        this.currentSound = settings.sound;
        this.soundSelect.value = settings.sound;
      }

      if (settings.customSoundUrl) {
        this.customSoundUrl = settings.customSoundUrl;
        this.customSoundAudio.src = this.customSoundUrl;
      }

      if (settings.theme) {
        this.theme = settings.theme;
      }
    }
  }

  saveStats() {
    const today = new Date().toDateString();
    const stats = {
      completedPomodoros: this.completedPomodoros,
      totalFocusTime: this.totalFocusTime,
      streak: this.streak,
      lastDate: today,
    };
    localStorage.setItem("pomodoroStats", JSON.stringify(stats));
  }

  loadStats() {
    const stats = JSON.parse(localStorage.getItem("pomodoroStats"));
    const today = new Date().toDateString();
    if (stats) {
      if (stats.lastDate === today) {
        this.completedPomodoros = stats.completedPomodoros || 0;
        this.totalFocusTime = stats.totalFocusTime || 0;
        this.streak = stats.streak || 0;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (stats.lastDate === yesterday.toDateString()) {
          this.streak = (stats.streak || 0) + 1;
        } else {
          this.streak = 0;
        }
        this.completedPomodoros = 0;
      }
      this.updateStats();
    }
  }

  // ---------- History & graphs ----------

  dateKey(date) {
    return date.toISOString().slice(0, 10);
  }

  loadStatsHistory() {
    try {
      const raw = localStorage.getItem("pomodoroHistory");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveStatsHistory() {
    localStorage.setItem(
      "pomodoroHistory",
      JSON.stringify(this.statsHistory)
    );
  }

  getLastDaysKeys(days) {
    const keys = [];
    const d = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const clone = new Date(d);
      clone.setDate(clone.getDate() - i);
      keys.push(this.dateKey(clone));
    }
    return keys;
  }

  drawGraph(range) {
    const ctx = this.graphCtx;
    const canvas = this.graphCanvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const days = range === "week" ? 7 : 30;
    const keys = this.getLastDaysKeys(days);
    const values = keys.map((k) => this.statsHistory[k] || 0);

    const maxVal = Math.max(4, ...values);
    const padding = 10;
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / days - 2;

    ctx.fillStyle = "rgba(148, 163, 184, 0.3)";
    ctx.font = "10px system-ui";

    values.forEach((val, i) => {
      const x = i * (barWidth + 2) + padding / 2;
      const barHeight = ((height - padding * 2) * val) / maxVal;
      const y = height - padding - barHeight;

      const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
      gradient.addColorStop(0, "rgba(249, 115, 22, 0.9)");
      gradient.addColorStop(1, "rgba(249, 115, 22, 0.2)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 3);
      ctx.fill();

      ctx.fillStyle = "rgba(148, 163, 184, 0.9)";
      if (days <= 7) {
        const date = keys[i].slice(8, 10);
        ctx.fillText(date, x, height - 2);
      }
    });
  }

  // ---------- Achievements ----------

  checkAchievements() {
    const total = this.completedPomodoros;
    const todayCount = this.statsHistory[this.todayKey] || 0;
    const weekCount = this.getLastDaysKeys(7).reduce(
      (acc, k) => acc + (this.statsHistory[k] || 0),
      0
    );

    const unlocked = [];

    if (total >= 10) unlocked.push("10 Pomodoros");
    if (total >= 50) unlocked.push("50 Pomodoros");
    if (total >= 100) unlocked.push("100 Pomodoros");
    if (todayCount >= 8) unlocked.push("Deep Focus Day");
    if (weekCount >= 40) unlocked.push("Weekly Warrior");
    if (this.streak >= 7) unlocked.push("7-Day Streak");

    this.achievements = Array.from(new Set(unlocked));
    this.renderAchievements();
  }

  renderAchievements() {
    this.achievementList.innerHTML = "";
    if (!this.achievements.length) {
      const li = document.createElement("li");
      li.textContent = "Complete your first pomodoro to unlock badges.";
      li.style.background = "transparent";
      li.style.border = "none";
      li.style.color = "var(--muted)";
      this.achievementList.appendChild(li);
      return;
    }

    this.achievements.forEach((badge) => {
      const li = document.createElement("li");
      li.textContent = badge;
      this.achievementList.appendChild(li);
    });
  }

  // ---------- Notifications & sound ----------

  requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  showNotification(title, body) {
    if (
      this.notificationsCheckbox.checked &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      new Notification(title, {
        body,
        icon: "🍅",
        badge: "🍅",
      });
    }
  }

  handleCustomSoundUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    this.customSoundUrl = url;
    this.customSoundAudio.src = url;
    this.currentSound = "custom";
    this.saveSettings();
  }

  playSound() {
    if (this.currentSound === "custom" && this.customSoundUrl) {
      this.customSoundAudio.currentTime = 0;
      this.customSoundAudio.play();
      return;
    }

    // simple Web Audio sounds
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (this.currentSound === "beep") {
      oscillator.frequency.value = 880;
      oscillator.type = "square";
    } else if (this.currentSound === "chime") {
      oscillator.frequency.value = 660;
      oscillator.type = "sine";
    } else if (this.currentSound === "bell") {
      oscillator.frequency.value = 523;
      oscillator.type = "triangle";
    }

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.6
    );
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.6);
  }

  // ---------- Theme ----------

  initTheme() {
    document.documentElement.setAttribute("data-theme", this.theme);
    this.updateThemeIcon();
  }

  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", this.theme);
    this.updateThemeIcon();
    this.saveSettings();
  }

  updateThemeIcon() {
    this.themeToggle.textContent = this.theme === "light" ? "🌙" : "☀️";
  }

  // ---------- Cloud sync (demo using localStorage namespace by code) ----------

  getSyncNamespace() {
    const code = this.syncCodeInput.value.trim();
    if (!code) return null;
    return `pomodoro-sync-${code}`;
  }

  syncToCloud() {
    const ns = this.getSyncNamespace();
    if (!ns) {
      this.syncStatus.textContent = "Enter a sync code first.";
      return;
    }

    const payload = {
      settings: JSON.parse(localStorage.getItem("pomodoroSettings") || "{}"),
      stats: JSON.parse(localStorage.getItem("pomodoroStats") || "{}"),
      history: this.statsHistory,
    };
    localStorage.setItem(ns, JSON.stringify(payload));
    this.syncStatus.textContent = "Pushed to cloud (simulated) for this browser.";
  }

  syncFromCloud() {
    const ns = this.getSyncNamespace();
    if (!ns) {
      this.syncStatus.textContent = "Enter a sync code first.";
      return;
    }

    const raw = localStorage.getItem(ns);
    if (!raw) {
      this.syncStatus.textContent = "No data found for this code.";
      return;
    }

    const payload = JSON.parse(raw);
    if (payload.settings) {
      localStorage.setItem(
        "pomodoroSettings",
        JSON.stringify(payload.settings)
      );
    }
    if (payload.stats) {
      localStorage.setItem("pomodoroStats", JSON.stringify(payload.stats));
    }
    if (payload.history) {
      this.statsHistory = payload.history;
      this.saveStatsHistory();
    }

    // reload settings/stats into UI
    this.loadSettings();
    this.loadStats();
    this.updateGoalsProgress();
    this.drawGraph(
      document.querySelector(".graph-tab.active").dataset.range
    );

    this.syncStatus.textContent = "Pulled data into this device.";
  }

  // ---------- Calendar export (.ics) ----------

  exportToCalendar() {
    const todayKey = this.dateKey(new Date());
    const todayCount = this.statsHistory[todayKey] || 0;
    if (!todayCount) {
      alert("No pomodoros completed today to export.");
      return;
    }

    const now = new Date();
    const dtstamp = this.icsDate(now);
    const dtstart = this.icsDate(now);
    const durationMinutes = todayCount * (this.modes.pomodoro / 60);
    const dtend = this.icsDate(
      new Date(now.getTime() + durationMinutes * 60000)
    );

    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Pomodoro Timer//EN",
      "BEGIN:VEVENT",
      `UID:${dtstamp}@pomodoro.local`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      "SUMMARY:Pomodoro Focus Sessions",
      `DESCRIPTION:Completed ${todayCount} pomodoros today.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pomodoro-today.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  icsDate(date) {
    const pad = (n) => n.toString().padStart(2, "0");
    return (
      date.getUTCFullYear().toString() +
      pad(date.getUTCMonth() + 1) +
      pad(date.getUTCDate()) +
      "T" +
      pad(date.getUTCHours()) +
      pad(date.getUTCMinutes()) +
      pad(date.getUTCSeconds()) +
      "Z"
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new PomodoroTimer();
});
