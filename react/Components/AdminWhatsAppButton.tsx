import React, { useState, useEffect } from 'react';
import { useRuntime } from 'vtex.render-runtime';
import { defineMessages, useIntl } from 'react-intl';
import { 
  Alert, 
  Button, 
  Input,
  Spinner, 
} from 'vtex.styleguide';
import DaySchedule from './DaySchedule';
import { Schedule } from './../Interfaces/types';
import style from './admin-whats-app-button.css';
import {
  experimental_I18nProvider as I18nProvider, 
  createSystem, 
  DataView, 
  PageActions, 
  PageHeader, 
  PageTitle, 
  ToastProvider, 
  useDataViewState, 
} from '@vtex/admin-ui';
import AdminApi from './../Adapters/AdminApi';

const [ThemeProvider] = createSystem({ key: 'admin-ui-widgets', });

const messages = defineMessages({
  title: {
    id: 'admin/admin-widgets-whatsapp-pdp.title',
  },
});

const AdminWhatsAppButton = () => {
  const [whatsAppButton, setWhatsAppButton] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const adminApi = new AdminApi();
  const { account, culture: { locale }, } = useRuntime();
  const { formatMessage } = useIntl();
  const view = useDataViewState();

  const getWhatsAppButton = async () => {
    const DATA = await adminApi.callGet(`whats-app-button/${account}/admin`, {});
    console.log({DATA});
    if (DATA.success) {
      setWhatsAppButton(DATA.data);
      setError(null);
    } else {
      setError(DATA.message);
    }
  }

  const updateWhatsAppButton = async () => {
    setIsLoading(true);
    const DATA = await adminApi.callPut(`whats-app-button/${account}/admin/${whatsAppButton?.id}`, whatsAppButton);
    setWhatsAppButton(DATA.data);
    setIsLoading(false);
  }

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    onChangeAttributes(e.currentTarget.value, e.currentTarget.name);
  }

  const onDayChange = (updatedDay: Schedule) => {
    let schedules = whatsAppButton?.schedules;
    if (typeof schedules !== 'undefined') {
      schedules = updateSchedules(schedules, updatedDay, updatedDay.id);
      onChangeAttributes(schedules, 'schedules');
    }
  };

  const updateSchedules = (schedules: Schedule[], schedule: Schedule, id: number): Schedule[] => {
    return schedules.map((item: Schedule) => item.id === id ? schedule : item);
  };

  const onChangeAttributes = (value: string | number | Schedule[], field: string) => {
    if (!!whatsAppButton) {
      setWhatsAppButton({ ...whatsAppButton, [field]: value });
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await getWhatsAppButton();
      setIsLoading(false);
    }
    fetchData()
      .catch(console.error);
  }, [])

  return (
    <I18nProvider locale={locale}>
      <ThemeProvider>
        <ToastProvider>
          <PageHeader>
            <PageTitle>
              {formatMessage(messages.title)}
            </PageTitle>
            <PageActions>
              <span className="mr4">
                <Button variation="primary" size="small" onClick={() => updateWhatsAppButton()}>
                  Actualizar
                </Button>
              </span>
            </PageActions>
          </PageHeader>
          <div style={{ padding: '0 4rem' }}>
            {!!error && 
              <div style={{marginTop: '30px'}}>
                <span>
                  <Alert type="error" onClose={() => console.log('Closed!')}>
                    { error }
                  </Alert>
                </span>
              </div>
            }
            { isLoading ? 
              <div className={`w-100 ${style['spinner-container']}`}>
                <Spinner />
              </div> : 
              !error && 
              <DataView state={view}>
                <div className={style.container}>
                  <div className={`${style.column}`}>
                    <div>
                      <div className="mb5">
                        <h2>Datos generales</h2>
                      </div>
                      <div className="mb5">
                        <Input 
                          placeholder="Escriba el número de teléfono" 
                          size="large" 
                          label="Número de teléfono" 
                          value={whatsAppButton?.mobile_phone} 
                          name="mobile_phone" 
                          onChange={(e:React.FormEvent<HTMLInputElement>) => handleChange(e)} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className={`${style.column}`}>
                    <div>
                      <div className="mb5">
                        <h2>Horarios de atención</h2> 
                      </div>
                      <div className="mt6 mb5"> 
                        <h3>Días</h3> 
                      </div> 
                      {!!whatsAppButton?.schedules?.length && whatsAppButton.schedules.map((day:Schedule) => (
                        <DaySchedule key={day.id} day={day} onDayChange={onDayChange} /> 
                      ))}
                    </div> 
                  </div>
                </div>
              </DataView> 
            }
          </div>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}

export default AdminWhatsAppButton;
