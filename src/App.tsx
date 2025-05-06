import Logger from './components/tabs/logger';

import './App.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { Header } from './components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';

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
          <div>Pomodoro Timer. Coming soon.</div>
        </TabsContent>
        <TabsContent value='break'>
          <div>Break Reminder. Coming soon.</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default App;
