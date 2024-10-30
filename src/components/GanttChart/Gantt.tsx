import React, { useEffect, useRef, useState } from 'react';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { gantt } from 'dhtmlx-gantt';
import { GanttContainer } from './styles';

const GanttChart: React.FC = () => {
  const ganttContainer = useRef<HTMLDivElement | null>(null);

  const [zoomLevel, setZoomLevel] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const zoomConfig = [
    zoom_year,
    zoom_month,
    zoom_week,
    zoom_day,
  ];


  // funcao para importar de msproject
  function import_data(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'msproject-parse');

    const settings = { durationUnit: "day" };
    formData.append('data', JSON.stringify(settings));

    fetch('https://export.dhtmlx.com/gantt/project', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(project => {
        gantt.clearAll();

        if (project.config.duration_unit) {
          gantt.config.duration_unit = project.config.duration_unit;
        }
        const tasks = project.data.data.map((task: any) => (
          task.start_date = task.start_date.split(' ')[0].split('-').reverse().join('-'),
          {
            id: task.id,
            text: task.text,
            start_date: task.start_date,
            duration: task.duration,
            constraint_type: task.constraint_type,
            constraint_date: gantt.date.parseDate(task.constraint_date, "xml_date"),
            order: task.order,
            progress: task.progress,
            parent: task.parent,
          }));

        const links = project.data.links.map((link: any) => ({
          id: link.id,
          source: link.source,
          target: link.target,
          type: link.type,
        }));



        gantt.parse({ data: tasks, links: links });
      })
      .catch(error => {
        console.error("Error importing MS Project file:", error);
      });
  }


  useEffect(() => {

    // nivel de zoom padrão
    zoom_day();

    //imbutindo script de exportação PDF e MSPROJECT
    const script = document.createElement('script');
    script.src = "https://export.dhtmlx.com/gantt/api.js";
    script.async = true;
    document.body.appendChild(script);

    //plugins necessarios
    gantt.plugins({ export_api: true, auto_scheduling: true, fullscreen: true, undo: true });

    //definindo auto organizacao de tarefas
    gantt.config.auto_scheduling = true;
    gantt.config.auto_scheduling_compatibility = true;

    //configuracao para sempre mostrar o scroll
    gantt.config.scroll_size = 30;
    

    // definindo quais colunas a tabela da esquerda vai ter no gantt chart
    gantt.config.columns = [
      { name: "text", tree: true, resize: true, width: 120 },
      { name: "start_date", align: "center", resize: true, width: 120 },
      { name: "duration", align: "center", width: 80, resize: true },
      {
        name: "constraint_type", align: "center", width: 130, template: function (task: any) {
          return gantt.locale.labels[gantt.getConstraintType(task)];
        }, resize: true
      },
      {
        name: "constraint_date", align: "center", width: 120, template: function (task: any) {
          const constraintTypes = gantt.config.constraint_types;
          if (task.constraint_date && task.constraint_type != constraintTypes.ASAP && task.constraint_type != constraintTypes.ALAP) {
            return gantt.templates.task_date(task.constraint_date);
          }
          return "";
        }, resize: true
      },
      { name: "add", width: 44 }
    ];


    // definindo quais campos de lightbox cada tipo de item vai ter
    //tarefa
    gantt.config.lightbox.sections = [
      { name: "type", type: "typeselect", map_to: "type"},
      { name: "task_name", height: 38, map_to: "text", type: "textarea", focus: true},
      { name: "description", height: 38, map_to: "description", type: "textarea", focus: true },
      { name: "constraint", type: "constraint" },
      { name: "time", type: "duration", map_to: "auto" },
    ];

    // project(familia)
    gantt.config.lightbox.project_sections= [
      {name: "type", type: "typeselect", map_to: "type"},
      { name: "task_name", height: 38, map_to: "text", type: "textarea", focus: true},
      {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
      {name: "time", type: "duration", map_to: "auto"}
    ];

    //milestone(marco)
    gantt.config.lightbox.milestone_sections= [
      {name: "type", type: "typeselect", map_to: "type"},
      { name: "task_name", height: 38, map_to: "text", type: "textarea", focus: true},
      {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
      {name: "time", map_to: "auto", type: "duration"}
    ];

    // reorganizar tarefa após adiconar
    gantt.attachEvent("onAfterTaskAdd", function (task) {
      gantt.autoSchedule(task.id);
    }, {});

    // reorganizar tarefa após atualizar
    gantt.attachEvent("onAfterTaskUpdate", function (id, task) {
      gantt.autoSchedule(task.id);
    }, {});


    // definir que vai configurar dias trabalhados customizadamente
    gantt.config.work_time = true;

    // configurando manualmente por enquanto os dias trabalhados
    gantt.setWorkTime({ day: 0, hours: [9, 18] });
    gantt.setWorkTime({ day: 6, hours: [9, 18] });
    gantt.setWorkTime({ day: 1, hours: [9, 18] });
    gantt.setWorkTime({ day: 2, hours: [9, 18] });
    gantt.setWorkTime({ day: 3, hours: [9, 18] });
    gantt.setWorkTime({ day: 4, hours: [9, 18] });
    gantt.setWorkTime({ day: 5, hours: [9, 18] });

    if (ganttContainer.current) {
      gantt.init(ganttContainer.current);
    }


  }, []);


  // exportar visualização atual do gantt como MS Project XML
  function export_data() {
    gantt.exportToMSProject({
      name: "gantt_data.xml"
    });
  }


  // exportar visualização atual do gantt como pdf
  function export_data_to_pdf() {
    gantt.eachTask(function(task) {
      gantt.open(task.id);
    });
    gantt.exportToPDF({
      name: "gantt_data.pdf",
    });
  }

  // abrir todas as tarefas
  function expandAll() {
    gantt.eachTask(function (task) {
      gantt.open(task.id);
    });
  }

  // fechar todas as tarefas
  function closeAll() {
    gantt.eachTask(function (task) {
      gantt.close(task.id);
    });
  }

  // funcoes de niveis de zoom

  function zoom_year() {
    gantt.config.scale_unit = "year";
    gantt.config.date_scale = "%Y";
    gantt.config.subscales = [];
    gantt.config.step = 1;
    gantt.render();
  }
  
  function zoom_month() {
    gantt.config.scale_unit = "month";
    gantt.config.date_scale = "%F %Y";
    gantt.config.subscales = [{ unit: "week", step: 1, date: "Week #%W" }];
    gantt.config.step = 1;
    gantt.render();
  }
  
  function zoom_week() {
    gantt.config.scale_unit = "week";
    gantt.config.date_scale = "Week #%W";
    gantt.config.subscales = [{ unit: "day", step: 1, date: "%d %M" }];
    gantt.config.step = 1;
    gantt.render();
  }
  
  function zoom_day() {
    gantt.config.scale_unit = "day";
    gantt.config.date_scale = "%d %M";
    gantt.config.subscales = [{ unit: "hour", step: 4, date: "%H:%i" }];
    gantt.config.step = 1;
    gantt.render();
  }

  // desfazer ação anterior no gantt
  function undoLastAction() {
    gantt.undo();
  }

  // refazer ação anterior no gantt
  function redoLastAction() {
    gantt.redo();
  }
  useEffect(() => {
    zoomConfig[zoomLevel]();
  }, [zoomLevel]);

  // ativar tela cheia do gantt
  function toggleFullscreen() {
    if (isFullscreen) {
      gantt.collapse();
    } else {
      gantt.expand();
    }
    setIsFullscreen(!isFullscreen);
  }

  // desvincular tarefa dos parents
  function unlinkTask() {
    const selectedTask = gantt.getSelectedId();
    if (selectedTask) {
      const task = gantt.getTask(selectedTask);
      task.parent = 0;
      gantt.updateTask(task.id, task);
    } else {
      alert('Por favor, selecione uma tarefa para desvincular.');
    }
  }
  
  function handleZoomIn () {
    setZoomLevel(zoomLevel < 3 ? zoomLevel + 1 : 3) 
   }
  
  function handleZoomOut () {
    setZoomLevel(zoomLevel > 0 ? zoomLevel - 1 : 0)  
  }

  return (
    <>
    <button
        onClick={() => setZoomLevel(zoomLevel < 3 ? zoomLevel + 1 : 3)}
        style={{ marginBottom: '10px' }}
      >+
      </button>
      <button
        onClick={() => setZoomLevel(zoomLevel > 0 ? zoomLevel - 1 : 0)}
        style={{ marginBottom: '10px' }}>-
      </button>
      <button onClick={export_data} style={{ marginBottom: '10px' }}>Export to MSProject</button>
      <button onClick={export_data_to_pdf} style={{ marginBottom: '10px' }}>Export to PDF</button>
      <button onClick={expandAll} style={{ marginBottom: '10px' }}>Expand All</button>
      <button onClick={closeAll} style={{ marginBottom: '10px' }}>Close All</button>
      <button onClick={toggleFullscreen} style={{ marginBottom: '10px' }}>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</button>
      <button onClick={unlinkTask} style={{ marginBottom: '10px' }}>Desvincular Tarefa</button> {}
      <button onClick={undoLastAction} style={{ marginBottom: '10px' }}>Undo</button>
      <button onClick={redoLastAction} style={{ marginBottom: '10px' }}>Redo</button>
      <input type="file" accept=".xml" onChange={import_data} style={{ marginBottom: '10px' }} />
      <GanttContainer ref={ganttContainer} style={{ width: '100%', height: '90%' }} />
    </>
  );
};

export default GanttChart;

