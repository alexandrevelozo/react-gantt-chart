import React, { useEffect, useRef } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { gantt } from 'dhtmlx-gantt/codebase/dhtmlxgantt';
import { GanttContainer } from './styles'; 

const GanttChart: React.FC = () => {
  const ganttContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gantt.config.start_date = new Date(2024, 9, 1); 
    gantt.config.end_date = new Date(2024, 10, 30); 
    gantt.config.min_date = new Date(2024, 9, 1);
    gantt.config.max_date = new Date(2024, 10, 30);
    gantt.config.date_format = "%Y-%m-%d"; 
    gantt.config.scale_unit = "day"; 
    gantt.config.subscales = [
      { unit: "month", step: 1, template: "%F, %Y" } 
    ];
    gantt.config.constraint_types = {
      asap: "Tão cedo quanto possível",
      alap: "Tão tarde quanto possível",
      snet: "Começar não antes de",
      fnlt: "Terminar não depois de",
      snlt: "Começar não depois de",
      fnet: "Terminar não antes de",
      msos: "Deve começar em",
      mfos: "Deve terminar em"
    }
    gantt.config.lightbox.sections = [
      { name: "description", height: 38, map_to: "text", type: "textarea", focus: true },
      {
        name: "type",
        height: 22,
        map_to: "type", 
        type: "select", 
        options: [
          { key: "normal", label: "Tarefa" },
          { key: "milestone", label: "Marco" },
          { key: "parent", label: "Família de Tarefas" }
        ]
      },
      {
        name: "constraint",  // Seção para aplicar restrições
        height: 22,
        map_to: "constraint_type",
        type: "select",
        options: Object.keys(gantt.config.constraint_types).map(key => ({
          key, 
          label: gantt.config.constraint_types[key]
        }))      },
      { name: "time", type: "duration", map_to: "auto" } // Duração
    ];

    

    const taskData = {
      data: [
        { id: 1, text: "Projeto A", start_date: "2024-10-01", duration: 20, progress: 0.4, open: true },
        { id: 2, text: "Planejamento", start_date: "2024-10-02", duration: 5, parent: 1, progress: 0.8 },
        { id: 3, text: "Desenvolvimento", start_date: "2024-10-10", duration: 10, parent: 1, progress: 0.6 },
        { id: 4, text: "Testes", start_date: "2024-10-20", duration: 5, parent: 1, progress: 0.4 },
        { id: 5, text: "Lançamento", start_date: "2024-11-01", duration: 0, type: "milestone", parent: 1 } // Marco dentro da tarefa pai
      ],
      links: [
        { id: 1, source: 2, target: 3, type: "0" },  // Dependência entre tarefas
        { id: 2, source: 3, target: 4, type: "0" },
        { id: 3, source: 4, target: 5, type: "0" }   // O marco depende da última tarefa
      ]
    };
    
    
    
    if (ganttContainer.current) {
      gantt.init(ganttContainer.current);
      gantt.parse(taskData);
    }

    return () => {
      gantt.clearAll();
    };
  }, []);

  return (
    <GanttContainer
      ref={ganttContainer}
    />
  );
};

export default GanttChart;
