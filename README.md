# TimeZen - Work Logger Chrome Extension

A comprehensive Chrome extension for tracking work time, managing Pomodoro sessions, and maintaining healthy work habits with break reminders.

## ✨ Features

### 📝 Work Logger

- **Task & Meeting Tracking**: Log work activities with project assignments and time durations
- **Smart Forms**: Auto-complete project and person names with creatable dropdowns
- **Timer Integration**: Built-in timer for accurate time tracking
- **Data Export**: Export entries as CSV files for reporting
- **Date Navigation**: View and manage entries for any date
- **Validation**: Form validation with helpful error messages

### 🍅 Enhanced Pomodoro Timer

- **Customizable Durations**: Configurable work and break intervals
- **Break Types**: Regular breaks and long breaks with different durations
- **Auto-start Options**: Automatically start breaks or work sessions
- **Progress Tracking**: Count completed Pomodoro sessions
- **Settings Panel**: Easy access to timer configuration
- **Visual Feedback**: Clear status indicators and countdown timers

### 🎯 Break Reminder System

- **Smart Reminders**: Configurable break intervals (30-120 minutes)
- **Multiple Notification Types**: Browser notifications, popup toasts, or both
- **Activity Suggestions**: Random wellness activity recommendations
- **Custom Messages**: Personalized break reminder messages
- **Manual Break Tracking**: Mark breaks as taken manually
- **Real-time Countdown**: Live countdown to next break

### 🔧 Technical Improvements

- **Type Safety**: Comprehensive TypeScript interfaces and type checking
- **Error Handling**: Robust error handling with user-friendly messages
- **Async Operations**: Modern async/await patterns for better performance
- **Data Validation**: Input sanitization and validation
- **Storage Management**: Improved Chrome storage utilities with error recovery
- **Toast Notifications**: User feedback for all actions

## 🚀 Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Project Structure

```
src/
├── components/          # React components
│   ├── tabs/           # Main tab components
│   ├── ui/             # Reusable UI components
│   └── ...             # Form and utility components
├── utils/              # Utility functions
│   ├── chromeStorageUtils.ts  # Chrome storage operations
│   ├── dateTimeUtils.ts       # Date/time utilities
│   ├── entryUtils.ts          # Entry management
│   └── validationUtils.ts     # Form validation
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

## 📊 Data Management

### Storage Structure

The extension uses Chrome's local storage to persist:

- Work entries organized by date
- Project and person lists
- Pomodoro settings and progress
- Break reminder configuration
- Timer states and elapsed time

### Data Export

- Export entries as CSV files
- Copy entries to clipboard
- Import functionality (planned)

## 🎨 UI/UX Features

### Modern Design

- Clean, accessible interface using shadcn/ui components
- Dark/light theme support
- Responsive design for different screen sizes
- Smooth animations and transitions

### User Experience

- Loading states for all operations
- Toast notifications for user feedback
- Form validation with clear error messages
- Keyboard navigation support
- Screen reader accessibility

## 🔒 Privacy & Security

- All data is stored locally in Chrome's storage
- No data is sent to external servers
- Input sanitization prevents XSS attacks
- Secure Chrome extension APIs usage

## 🐛 Error Handling

The extension includes comprehensive error handling:

- Chrome API error recovery
- Storage operation fallbacks
- User-friendly error messages
- Graceful degradation for failed operations

## 🔄 Future Enhancements

- [ ] Data import functionality
- [ ] Weekly/monthly reports
- [ ] Team collaboration features
- [ ] Integration with external time tracking services
- [ ] Advanced analytics and insights
- [ ] Custom themes and branding
- [ ] Offline support improvements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with React, TypeScript, and Vite
- UI components from shadcn/ui
- Icons from Lucide React
- Date handling with date-fns
- Toast notifications with react-toastify
