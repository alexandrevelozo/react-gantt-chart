import React, { FC, useState } from 'react';
import FullCalendar from '@fullcalendar/react';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';

interface MyFullCalendarProps {
  onDateSelect: (date: string) => void;
}

const Calendar: FC<MyFullCalendarProps> = ({ onDateSelect }) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const handleDateClick = (info: any) => {
    const dateString = format(info.date, 'yyyy-MM-dd');
    if (selectedDates.includes(dateString)) {
      setSelectedDates((prev) => prev.filter((d) => d !== dateString));
    } else {
      setSelectedDates((prev) => [...prev, dateString]);
    }
    onDateSelect(dateString);
  };

  // Gera meses para o ano atual
  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  });

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {months.map((month) => (
        <div key={month.toString()} style={{ flex: '0 0 30%', margin: '10px' }}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth',
            }}
            dateClick={handleDateClick}
            // Define o mês atual para ser exibido
            initialDate={month}
            events={[]} // Adicione seus eventos aqui
          />
        </div>
      ))}
    </div>
  );
};

export default Calendar;
