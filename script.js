// script.js
class PomodoroTimer {
    constructor() {
        this.modes = {
            pomodoro: 25 * 60,
            short: 5 * 60,
            long: 15 * 60
        };
        
        this.currentMode = 'pomodoro';
        this.timeLeft = this.modes.pomodoro;
        this.isRunning = false;
        this.timerId = null;
        
        this.completedPomodoros = 0;
        this.totalFocusTime = 0;
        this.streak = 0;
        
        this.initElements();
        this.loadSettings();
        this.loadStats();
        this.attachEventListeners();
        this.updateDisplay();
        this.requestNotificationPermission();
    }
    
    initElements() {
        this.timeDisplay = document.getElementById('time-display');
        this.timerLabel = document.getElementById('timer-label');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.modeBtns = document.querySelectorAll('.mode-btn');
        this.progressBar = document.querySelector('.progress-ring-bar');
        
        this.completedPomodorosEl = document.getElementById('completed-pomodoros');
        this.totalTimeEl = document.getElementById('total-time');
        this.streakEl = document.getElementById('streak');
        
        this.pomodoroDurationInput = document.getElementById('pomodoro-duration');
        this.shortBreakInput = document.getElementById('short-break-duration');
        this.longBreakInput = document.getElementById('long-break-duration');
        this.autoStartCheckbox = document.getElementById('auto-start');
        this.notificationsCheckbox = document.getElementById('notifications');
        
        this.taskInput = document.getElementById('task-input');
        this.taskDisplay = document.getElementById('task-display');
        
        this.circumference = 2 * Math.PI * 130;
        this.progressBar.style.strokeDasharray = this.circumference;
    }
    
    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isRunning) {
                    this.switchMode(e.target.dataset.mode);
                }
            });
        });
        
        this.pomodoroDurationInput.addEventListener('change', () => this.updateSettings());
        this.shortBreakInput.addEventListener('change', () => this.updateSettings());
        this.longBreakInput.addEventListener('change', () => this.updateSettings());
        this.autoStartCheckbox.addEventListener('change', () => this.saveSettings());
        this.notificationsCheckbox.addEventListener('change', () => this.saveSettings());
        
        this.taskInput.addEventListener('input', (e) => {
            if (e.target.value.trim()) {
                this.taskDisplay.textContent = `Working on: ${e.target.value}`;
                this.taskDisplay.classList.remove('hidden');
            } else {
                this.taskDisplay.classList.add('hidden');
            }
        });
    }
    
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    startTimer() {
        this.isRunning = true;
        this.startBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
            Pause
        `;
        
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
        }, 100);
    }
    
    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timerId);
        this.startBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            Resume
        `;
    }
    
    resetTimer() {
        this.isRunning = false;
        clearInterval(this.timerId);
        this.timeLeft = this.modes[this.currentMode];
        this.updateDisplay();
        this.startBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            Start
        `;
    }
    
    timerComplete() {
        this.pauseTimer();
        this.playSound();
        
        if (this.currentMode === 'pomodoro') {
            this.completedPomodoros++;
            this.totalFocusTime += this.modes.pomodoro;
            this.updateStats();
            this.saveStats();
            
            this.showNotification('Pomodoro Complete!', 'Great job! Time for a break.');
            
            const nextMode = (this.completedPomodoros % 4 === 0) ? 'long' : 'short';
            
            if (this.autoStartCheckbox.checked) {
                setTimeout(() => {
                    this.switchMode(nextMode);
                    this.startTimer();
                }, 3000);
            } else {
                this.switchMode(nextMode);
            }
        } else {
            this.showNotification('Break Complete!', 'Ready to focus again?');
            
            if (this.autoStartCheckbox.checked) {
                setTimeout(() => {
                    this.switchMode('pomodoro');
                    this.startTimer();
                }, 3000);
            } else {
                this.switchMode('pomodoro');
            }
        }
    }
    
    switchMode(mode) {
        this.currentMode = mode;
        this.timeLeft = this.modes[mode];
        
        this.modeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        const labels = {
            pomodoro: 'Focus Time',
            short: 'Short Break',
            long: 'Long Break'
        };
        this.timerLabel.textContent = labels[mode];
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const totalTime = this.modes[this.currentMode];
        const progress = ((totalTime - this.timeLeft) / totalTime) * this.circumference;
        this.progressBar.style.strokeDashoffset = this.circumference - progress;
        
        document.title = `${this.timeDisplay.textContent} - Pomodoro Timer`;
    }
    
    updateStats() {
        this.completedPomodorosEl.textContent = this.completedPomodoros;
        
        const hours = Math.floor(this.totalFocusTime / 3600);
        const minutes = Math.floor((this.totalFocusTime % 3600) / 60);
        this.totalTimeEl.textContent = `${hours}h ${minutes}m`;
        
        this.streakEl.textContent = this.streak;
    }
    
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
            notifications: this.notificationsCheckbox.checked
        };
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('pomodoroSettings'));
        if (settings) {
            this.pomodoroDurationInput.value = settings.pomodoroDuration || 25;
            this.shortBreakInput.value = settings.shortBreak || 5;
            this.longBreakInput.value = settings.longBreak || 15;
            this.autoStartCheckbox.checked = settings.autoStart || false;
            this.notificationsCheckbox.checked = settings.notifications !== false;
            
            this.modes.pomodoro = parseInt(settings.pomodoroDuration || 25) * 60;
            this.modes.short = parseInt(settings.shortBreak || 5) * 60;
            this.modes.long = parseInt(settings.longBreak || 15) * 60;
            this.timeLeft = this.modes.pomodoro;
        }
    }
    
    saveStats() {
        const today = new Date().toDateString();
        const stats = {
            completedPomodoros: this.completedPomodoros,
            totalFocusTime: this.totalFocusTime,
            streak: this.streak,
            lastDate: today
        };
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));
    }
    
    loadStats() {
        const stats = JSON.parse(localStorage.getItem('pomodoroStats'));
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
        }
        
        this.updateStats();
    }
    
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
    
    showNotification(title, body) {
        if (this.notificationsCheckbox.checked && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '🍅',
                badge: '🍅'
            });
        }
    }
    
    playSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});