import React from 'react';
import GlobalStyle from './styles/global';  
import Gantt from './components/GanttChart';
// import Calendar from './components/Calendar';

const App: React.FC = () => (
  <>
    <GlobalStyle />
    {/* <Calendar onDateSelect={(date) => console.log(date)} /> */}
    <Gantt />
  </>
);

export default App;
