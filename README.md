# Pomodoro Focus Timer Pro

An advanced web-based Pomodoro timer with statistics, goals, achievements, dark/light theme, custom notification sounds, PWA support, calendar export, and simulated cloud sync.

## Features

- Pomodoro timer with focus, short break, and long break modes.
- Custom durations for each mode.
- Auto-start for next focus or break session.
- Desktop notifications for session completion (optional).
- Customizable notification sounds: built-in tones or your own audio file.
- Dark/light theme toggle with persistence.
- Daily and weekly goal setting with live progress.
- Achievement badges for milestones, streaks, and intense days.
- Weekly and monthly graphs of completed pomodoros.
- Local statistics: total pomodoros, focus time, and streaks.
- Activity history stored in the browser (localStorage).
- Calendar export: generate an `.ics` file summarizing today’s pomodoros.
- Simulated cloud sync across devices using a sync code (same browser or storage backend).
- Progressive Web App (PWA): installable, offline-capable.

## Getting Started

### Prerequisites

- Any modern browser (Chrome, Edge, Firefox, Safari).
- Optional: a simple static server for best PWA behavior (e.g. `serve`, `http-server`, or Live Server in VS Code).

### File Structure

- `index.html` – Main UI and layout. [file:1]
- `styles.css` – App styling and theme definitions. [file:3]
- `script.js` – Timer logic, stats, graphs, achievements, sync, and calendar export. [file:2]
- `manifest.json` – PWA manifest configuration.
- `service-worker.js` – Service worker for offline caching.
- `icons/` – PWA app icons (e.g. `icon-192.png`, `icon-512.png`).

Place all files in the same directory, with icons inside an `icons` folder.

### Running Locally

1. Clone or download this project into a folder.
2. Ensure the following files are present:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `manifest.json`
   - `service-worker.js`
   - `icons/icon-192.png`, `icons/icon-512.png`
3. Open `index.html` directly in your browser **or** serve the folder using a static server:
   - Example with `npm`:
     ```
     npx serve .
     ```
4. If using a server, open the local URL (e.g. `http://localhost:3000`) in the browser.

### PWA Installation

- On supported browsers, you can install the app:
  - Desktop: Look for “Install” or the install icon in the address bar.
  - Mobile: Add to Home Screen from the browser menu.
- The service worker caches core assets for offline access.

## Usage

### Basic Timer

1. Select a mode:
   - Pomodoro (focus)
   - Short Break
   - Long Break
2. Click **Start** to begin the countdown.
3. Click **Pause** to pause, **Resume** to continue, or **Reset** to return to the full duration.

The circular progress ring and the page title update as the timer runs. [file:2]

### Tasks

- Use the “What are you working on?” input to set your current task.
- The current task is displayed below the input while you type. [file:2]

### Goals

- In the **Goals** panel, set:
  - Daily pomodoro goal.
  - Weekly pomodoro goal.
- The app shows:
  - Today’s completed pomodoros vs daily goal.
  - This week’s pomodoros vs weekly goal. [file:2]
- Completing sessions updates the progress automatically.

### Achievements

Badges unlock automatically based on your activity, for example: [file:2]

- Total pomodoros (10, 50, 100, etc.).
- “Deep Focus Day” (high daily count).
- “Weekly Warrior” (strong weekly total).
- Streak-based achievements (e.g. 7-day streak).

Unlocked badges appear in the **Achievements** section.

### Statistics & Graphs

- The **Statistics** card shows:
  - Completed pomodoros.
  - Total focus time (hours/minutes).
  - Current streak. [file:2]
- Weekly/Monthly graph:
  - Use the **This Week** / **This Month** tabs.
  - Bars represent completed pomodoros per day, rendered on a `<canvas>` element. [file:2]
- Historical data is stored in `localStorage` as a date-keyed history object.

### Notification Sounds

- Open the settings drawer (⚙️).
- In the **Notifications** group:
  - Toggle **Enable desktop notifications**.
  - Choose a built-in sound type from the dropdown.
  - Optional: upload a **Custom sound** (any audio file).
- On session completion, the selected sound plays and a desktop notification is shown if permission is granted. [file:2]

### Theme Toggle

- Use the moon/sun button in the header to switch between dark and light themes.
- The chosen theme is saved and restored next time you open the app. [file:2][file:3]

### Calendar Export

- In **Settings → Calendar**, click **Export to calendar (.ics)**.
- The app generates an `.ics` event summarizing all pomodoros completed today, with duration based on total focus time.
- Import the file into Google Calendar, Outlook, etc. [file:2]

### Cloud Sync (Simulated)

- In **Settings → Sync**:
  - Enter a **Sync code** (any short string).
  - Click **Push to cloud** to save your data for that code.
  - On another device/browser (or later), enter the same code and click **Pull from cloud** to restore settings, stats, and history. [file:2]
- This implementation uses `localStorage` as a demo “cloud” namespace; replace these calls with a real backend API for production.

## Data Storage

The app uses `localStorage` for:

- `pomodoroSettings` – durations, auto-start, notifications, goals, theme, sound, custom sound URL.
- `pomodoroStats` – daily stats, total focus time, streak, last date.
- `pomodoroHistory` – date-keyed counts of completed pomodoros. [file:2]

No data is sent to any remote server unless you integrate one.

## Customization

- Adjust colors, spacing, and layout in `styles.css`. [file:3]
- Extend achievements, change thresholds, or adjust graph ranges in `script.js`.
- Modify PWA caching strategy in `service-worker.js` and icons/metadata in `manifest.json`. [file:2]

## License

Add your preferred license here (e.g. MIT, Apache-2.0, or “All rights reserved”).
