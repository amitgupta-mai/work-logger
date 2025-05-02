import { useState } from 'react';

import Logger from './components/tabs/logger';

import './App.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Header } from './components/header';
import { toggleTheme } from './utils/theme';

const App = () => {
  const [activeTab, setActiveTab] = useState<'logger' | 'pomodoro' | 'break'>(
    'logger'
  );
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'logger':
        return <Logger />;
      case 'pomodoro':
        return <div>Pomodoro Timer</div>;
      case 'break':
        return <div>Break Reminder</div>;
      default:
        return null;
    }
  };

  return (
    <div className='container' style={{ position: 'relative' }}>
      <div className='tab-nav'>
        <div
          onClick={() => setActiveTab('logger')}
          aria-label='Logger'
          title='Logger'
          tabIndex={0}
          className={`tab-control ${activeTab === 'logger' ? 'active' : ''}`}
        >
          Logger
        </div>
        <div
          onClick={() => setActiveTab('pomodoro')}
          aria-label='Pomodoro'
          title='Pomodoro'
          tabIndex={0}
          className={`tab-control ${activeTab === 'pomodoro' ? 'active' : ''}`}
        >
          Pomodoro
        </div>
        <div
          onClick={() => setActiveTab('break')}
          aria-label='Break Reminder'
          title='Break Reminder'
          tabIndex={0}
          className={`tab-control ${activeTab === 'break' ? 'active' : ''}`}
        >
          Break Reminder
        </div>
      </div>
      <Header
        theme={theme}
        toggleTheme={() => toggleTheme(theme, setThemeState)}
      />
      <div className='tab-container'>{renderActiveTab()}</div>
    </div>
  );
};

export default App;
