import React, { useState } from 'react';
import { Schedule } from './../Interfaces/types';
import style from './day-schedule.css';
import { TimePicker, Toggle } from 'vtex.styleguide';

interface DayScheduleProps {
  day: Schedule;
  onDayChange: (schedule: Schedule) => void;
}

const DaySchedule: React.FC<DayScheduleProps> = ({ day, onDayChange }) => {
  const [schedule, setSchedule] = useState<Schedule>(day);

  const handleTimeChange = (field:string, time:string) => {
    const TIME = extractTimeFromDate(time);
    const SCHEDULE = {
      ...schedule,
      [field]: TIME
    }
    setSchedule(SCHEDULE);
    onDayChange(SCHEDULE);
  }

  const handleStatusChange = () => {
    const SCHEDULE = {
      ...schedule,
      ['active']: !schedule.active
    }
    setSchedule(SCHEDULE);
    onDayChange(SCHEDULE);
  }

  const setTimeFromString = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(part => parseInt(part, 10));

    const dateWithNewTime = new Date();

    dateWithNewTime.setHours(hours);
    dateWithNewTime.setMinutes(minutes);
    dateWithNewTime.setSeconds(seconds);

    return dateWithNewTime;
  }

  const extractTimeFromDate = (dateString: string) => {
    const date = new Date(dateString);

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  return (
    <div key={schedule.id} className={`mb5 ${style.schedule}`}>
      <h4 className="dib mb3 w-100 c-on-base">{schedule.day_name}</h4>
      <div className={style['schedule-container']}>
        <div className={`${style['start-time']}`}>
          <TimePicker
            label="Hora inicio"
            size="small"
            placeholder="Defina la hora de inicio"
            value={setTimeFromString(schedule.start_time)}
            onChange={(time:string) => handleTimeChange('start_time', time)}
            interval="10"
            locale="es-CO"
          />
        </div>
        <div className={`${style['end-time']}`}>
          <TimePicker
            label="Hora fin"
            size="small"
            placeholder="Defina la hora de fin"
            value={setTimeFromString(schedule.end_time)}
            onChange={(time:string) => handleTimeChange('end_time', time)}
            interval="10"
            locale="es-CO"
          />
        </div>
        <div className={`${style['status']}`}>
          <span className="vtex-input__label db mb5 w-100 c-on-base t-small">Estado</span>
          <Toggle
            label={schedule.active ? "Activo" : "Inactivo"}
            semantic
            checked={schedule.active}
            name="active"
            onChange={() => handleStatusChange()}
          />
        </div>
      </div>
    </div>
  );
};

export default DaySchedule;
