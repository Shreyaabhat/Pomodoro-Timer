# 🍅 Pomodoro Focus Timer

A beautiful and feature-rich Pomodoro timer web application to boost your productivity with the Pomodoro Technique. Built with vanilla HTML, CSS, and JavaScript.

![Pomodoro Timer](https://img.shields.io/badge/version-1.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### Core Functionality
- ⏱️ **Three Timer Modes**: Pomodoro (25min), Short Break (5min), Long Break (15min)
- ▶️ **Play/Pause Control**: Start, pause, and resume your sessions
- 🔄 **Reset Functionality**: Quickly reset the current session
- 📊 **Visual Progress Ring**: Animated circular progress indicator

### Advanced Features
- 📈 **Session Statistics**: Track completed pomodoros, total focus time, and daily streaks
- ⚙️ **Customizable Durations**: Adjust timer lengths to suit your workflow
- 🔔 **Browser Notifications**: Get notified when sessions complete
- 🚀 **Auto-start Breaks**: Automatically start breaks after work sessions
- 📝 **Task Tracking**: Note what you're working on during each session
- 💾 **Persistent Storage**: Your settings and stats are saved locally
- 🎨 **Beautiful UI**: Modern gradient design with smooth animations
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### Statistics Tracking
- Daily completed pomodoros counter
- Total focus time calculation
- Streak tracking to maintain consistency
- Automatic daily reset at midnight

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or dependencies required!

### Installation

1. **Download the files** or clone the repository
2. **Organize your files** in the following structure:
```
   pomodoro-timer/
   ├── index.html
   ├── styles.css
   ├── script.js
   └── README.md
```

3. **Open `index.html`** in your web browser

That's it! The timer is ready to use.

## 📖 How to Use

### Basic Usage

1. **Select a Mode**
   - Click "Pomodoro" for a 25-minute focus session
   - Click "Short Break" for a 5-minute break
   - Click "Long Break" for a 15-minute break

2. **Start the Timer**
   - Click the "Start" button to begin
   - The progress ring will show your progress
   - The document title updates with remaining time

3. **Pause/Resume**
   - Click "Pause" to temporarily stop
   - Click "Resume" to continue from where you left off

4. **Reset**
   - Click "Reset" to start the current mode from the beginning

### Customization

1. **Adjust Timer Durations**
   - Scroll to the Settings section
   - Change the duration values (in minutes)
   - Values update automatically when not running

2. **Enable Auto-start**
   - Toggle "Auto-start breaks" to automatically begin breaks after pomodoros
   - Toggle off for manual control

3. **Manage Notifications**
   - Toggle "Enable notifications" on/off
   - Grant browser notification permissions when prompted
   - Receive alerts when sessions complete

4. **Track Your Task**
   - Enter what you're working on in the "Current Task" field
   - Your task will be displayed during the session

## ⚙️ Settings Configuration

| Setting | Default | Range | Description |
|---------|---------|-------|-------------|
| Pomodoro Duration | 25 min | 1-60 min | Length of focus sessions |
| Short Break | 5 min | 1-30 min | Length of short breaks |
| Long Break | 15 min | 1-60 min | Length of long breaks (every 4th break) |
| Auto-start breaks | Off | On/Off | Automatically start breaks |
| Notifications | On | On/Off | Browser notifications |

## 📊 Statistics

The timer tracks three key metrics:

1. **Completed Today**: Number of pomodoros finished today (resets at midnight)
2. **Total Focus Time**: Cumulative time spent in focus mode today
3. **Day Streak**: Consecutive days you've completed at least one pomodoro

All statistics are saved in your browser's local storage and persist between sessions.

## 🎨 Customization

### Changing Colors

Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #ff6b6b;      /* Main theme color */
    --secondary-color: #4ecdc4;     /* Accent color */
    --background: #0f172a;          /* Page background */
    --card-bg: #1e293b;             /* Card background */
}
```

### Modifying Timer Sounds

The app uses the Web Audio API. Edit the `playSound()` method in `script.js`:
```javascript
oscillator.frequency.value = 800;  // Change frequency (Hz)
oscillator.type = 'sine';          // sine, square, triangle, sawtooth
```

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox, grid, animations
- **JavaScript (ES6+)**: Class-based architecture with localStorage
- **Web APIs**: Notifications API, Audio API

### Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Mobile Browsers: ✅ Responsive design

### Storage
The application uses localStorage to persist:
- User settings (durations, preferences)
- Session statistics (completed pomodoros, time, streak)
- Current task information

Storage is scoped to your browser and domain. No data is sent to any server.

## 🐛 Troubleshooting

### Notifications Not Working
1. Check if browser notifications are allowed
2. Click the notification prompt when it appears
3. Check browser settings: Settings > Privacy > Notifications
4. Enable the "Notifications" toggle in app settings

### Timer Not Accurate
- The timer uses `Date.now()` for accuracy
- Browser throttling when tab is inactive is normal
- Performance may vary on low-end devices

### Settings Not Saving
- Ensure localStorage is enabled in your browser
- Check if you're in private/incognito mode (storage may not persist)
- Try clearing site data and starting fresh

### Stats Reset Unexpectedly
- Stats reset daily at midnight (by design)
- Streaks break if you miss a day
- Clearing browser data will reset all stats

## 📝 Future Enhancements

Potential features for future versions:
- 📊 Weekly/monthly statistics graphs
- 🎵 Custom notification sounds
- 🌙 Dark/light theme toggle
- 📱 Progressive Web App (PWA) support
- ☁️ Cloud sync across devices
- 🏆 Achievement badges
- 📅 Calendar integration
- 🎯 Goal setting features

## 🤝 Contributing

Feel free to fork this project
