import Logger from './components/tabs/logger';

import './App.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Header } from './components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import Pomodoro from './components/tabs/pomodoro';
import BreakReminder from './components/tabs/breakReminder';
import { Toaster } from './components/ui/sonner';

const App = () => {
  return (
    <div className='container grid grid-rows-[auto_1fr] h-screen'>
      <Header />
      <Tabs defaultValue='logger' className='grid grid-rows-[auto_1fr] min-h-0'>
        <TabsList>
          <TabsTrigger value='logger'>Logger</TabsTrigger>
          <TabsTrigger value='pomodoro'>Pomodoro</TabsTrigger>
          <TabsTrigger value='break'>Break Reminder</TabsTrigger>
        </TabsList>
        <TabsContent value='logger' className='min-h-0 overflow-hidden'>
          <Logger />
        </TabsContent>
        <TabsContent
          value='pomodoro'
          className='min-h-0 overflow-auto hide-scrollbar-on-idle'
        >
          <Pomodoro />
        </TabsContent>
        <TabsContent
          value='break'
          className='min-h-0 overflow-auto hide-scrollbar-on-idle'
        >
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
  );
};

export default App;
