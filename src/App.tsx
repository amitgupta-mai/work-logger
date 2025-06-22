import Logger from './components/tabs/logger';

import './App.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Header } from './components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import Pomodoro from './components/tabs/pomodoro';
import BreakReminder from './components/tabs/breakReminder';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div className='container'>
      <Header />
      <Tabs defaultValue='logger' className='mb-6'>
        <TabsList>
          <TabsTrigger value='logger'>Logger</TabsTrigger>
          <TabsTrigger value='pomodoro'>Pomodoro</TabsTrigger>
          <TabsTrigger value='break'>Break Reminder</TabsTrigger>
        </TabsList>
        <TabsContent value='logger'>
          <Logger />
        </TabsContent>
        <TabsContent value='pomodoro'>
          <Pomodoro />
        </TabsContent>
        <TabsContent value='break'>
          <BreakReminder />
        </TabsContent>
      </Tabs>
      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='dark'
      />
    </div>
  );
};

export default App;
