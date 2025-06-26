import Logger from './components/tabs/logger';

import './App.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Header } from './components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import Pomodoro from './components/tabs/pomodoro';
import BreakReminder from './components/tabs/breakReminder';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <div className='container grid grid-rows-[auto_1fr] h-screen'>
        <Header />
        <Tabs
          defaultValue='logger'
          className='grid grid-rows-[auto_1fr] min-h-0'
        >
          <TabsList>
            <TabsTrigger value='logger'>Logger</TabsTrigger>
            <TabsTrigger value='pomodoro'>Pomodoro</TabsTrigger>
            <TabsTrigger value='break'>Break Reminder</TabsTrigger>
          </TabsList>
          <TabsContent value='logger' className='min-h-0 overflow-hidden'>
            <Logger />
          </TabsContent>
          <TabsContent value='pomodoro' className='min-h-0 overflow-hidden'>
            <Pomodoro />
          </TabsContent>
          <TabsContent value='break' className='min-h-0 overflow-hidden'>
            <BreakReminder />
          </TabsContent>
        </Tabs>
        <Toaster
          position='top-right'
          richColors
          closeButton
          duration={4000}
          expand={true}
          toastOptions={{
            style: {
              marginBottom: '12px',
              borderRadius: '8px',
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
