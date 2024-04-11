import React, { useState, useEffect } from 'react';
import { useRuntime } from 'vtex.render-runtime';
import { defineMessages, useIntl } from 'react-intl';
import {
  Button,
  Input,
  Tabs,
  Tab,
  ColorPicker,
  EXPERIMENTAL_Select as Select,
  Toggle,
  Spinner,
} from 'vtex.styleguide';
import DaySchedule from './DaySchedule';
import { Widget, Color, Position, TypeOption, TimeZoneOption, Schedule, TypeWidget, Option, PositionDetails } from './../Interfaces/types';
import style from './admin-widgets.css';
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
import WidgetOptions from './WidgetOptions';
import WidgetOption from './WidgetOption';
const [ThemeProvider] = createSystem({
  key: 'admin-ui-widgets',
});

const messages = defineMessages({
  title: {
    id: 'admin/admin-widgets-whatsapp.title',
  },
});

const AdminWidgets = () => {
  const [whatsAppWidget, setWhatsAppWidget] = useState<Widget | null>(null);
  const [currentTab, setCurrentTab] = useState(1);
  const [colorHistory, setColorHistory] = useState<Object[]>([]);
  const [typeOptions, setTypeOptions] = useState<TypeOption[] | []>([]);
  const [timeZoneOptions, setTimeZoneOptions] = useState<TimeZoneOption[]>([]);
  const [timeZoneSelected, setTimeZoneSelected] = useState<TimeZoneOption | {}>({});
  const [typeWidgets, setTypeWidgets] = useState<TypeWidget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [optionId, setOptionId] = useState<number | string>(0);
  const [option, setOption] = useState<Option | null>(null);
  const [error, setError] = useState<string | null>(null);

  const adminApi = new AdminApi();

  const {
    account,
    culture: { locale },
  } = useRuntime()

  // React Intl to retrieve direct strings
  const { formatMessage } = useIntl();

  const getWhatsAppWidget = async () => {
    const DATA = await adminApi.callGet(`whats-app-widget/${account}/admin`, {});
    setWhatsAppWidget(DATA.data);
  }

  const updateWhatsAppWidget = async () => {
    setIsLoading(true)
    const DATA = await adminApi.callPut(`whats-app-widget/${account}/admin/${whatsAppWidget?.id}`, whatsAppWidget);
    if (DATA.success) {
      setWhatsAppWidget(DATA.data);
      setError(null);
    } else {
      setError(DATA.message);
    }
    setIsLoading(false)
  }

  const getTypeOptions = async () => {
    const DATA = await adminApi.callGet('type-values', {});
    const OPTIONS = await DATA.data.map((option:any) => ({
            value: option.id,
            label: option.name
        }));
    setTypeOptions(OPTIONS);
  }

  const getTypeWidgets = async () => {
    const DATA = await adminApi.callGet('type-widgets', {});
    const WIDGETS = await DATA.data.map((widget:any) => ({
            value: widget.id,
            label: widget.name
        }));
    setTypeWidgets(WIDGETS);
  }

  const getTimeZoneOptions = async () => {
    const DATA = await adminApi.callGet('time-zones', {});
    const OPTIONS = await DATA.data.map((option:any) => ({
            value: option,
            label: option.name
        }));
    setTimeZoneOptions(OPTIONS);
  }

  const assignTimeZone = () => {
    const SELECTED = timeZoneOptions
      .find((option:TimeZoneOption) => option?.value?.id === whatsAppWidget?.time_zone_id)
      ?? {value: {}, label: ''};
    setTimeZoneSelected(SELECTED);
  }

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    onChangeAttributes(e.currentTarget.value, e.currentTarget.name);
  }

  const handleChangeValuePosition = (e: React.FormEvent<HTMLInputElement>, position : string, key: "desktop" | "mobile") => {
    const VALUE = e.currentTarget.value;
    handleChangePosition(VALUE, position, key, 'value');
  };

  const handleChangeTypePosition = (value: string, position: string, key: "desktop" | "mobile") => {
    handleChangePosition(value, position, key, 'type');
  }

  const handleChangeActivePosition = (position: string, key: "desktop" | "mobile") => {
    if (!whatsAppWidget || !whatsAppWidget.position) return;
    const VALUE = !whatsAppWidget.position[key]?.find((pos: PositionDetails) => pos.position === position)?.active;
    handleChangePosition(VALUE, position, key, 'active');
  }

  const handleChangePosition = (value: string | boolean, position: string, key: "desktop" | "mobile", key2: string) => {
    if (!whatsAppWidget || !whatsAppWidget.position) return;
    

    let newPosition: Position = { ...whatsAppWidget.position };

    newPosition[key] = newPosition[key].map((pos: PositionDetails) => {
      return pos.position === position ? { ...pos, [key2]: value} : pos;
    });

    onChangeAttributes(newPosition, 'position');
  };

  const onDayChange = (updatedDay: Schedule) => {
    let schedules = whatsAppWidget?.schedules;
    if (typeof schedules !== 'undefined') {
      schedules = updateSchedules(schedules, updatedDay, updatedDay.id);
      onChangeAttributes(schedules, 'schedules');
    }
  };
  
  const updateSchedules = (schedules: Schedule[], schedule: Schedule, id: number): Schedule[] => {
    return schedules.map((item: Schedule) => item.id === id ? schedule : item);
  };

  const onOptionChange = (updatedOption: Option) => {
    let options = whatsAppWidget?.options;
    if (typeof options !== 'undefined') {
      options = updateOptions(options, updatedOption, updatedOption.id);
      onChangeAttributes(options, 'options');
    }
  };
  
  const updateOptions = (options: Option[], option: Option, id: number | string): Option[] => {
    return options.map((item: Option) => item.id === id ? option : item);
  };

  const onChangeColor = (color: Color, field: string) => {
    setColorHistory([
      ...colorHistory,
      color
    ]);
    onChangeAttributes(color.hex, field)
  }

  const onChangeAttributes = (value: string | number | Position | Schedule[] | Option[] , field: string) => {
    if (!!whatsAppWidget) {
      setWhatsAppWidget({
        ...whatsAppWidget,
        [field]: value
      });
    }
  }

  // Datagrid config
  const view = useDataViewState()

  useEffect(() => {
    const fetchData = async () => {
      await getTimeZoneOptions();
      await getTypeWidgets();
      await getTypeOptions();
      await getWhatsAppWidget();
      setIsLoading(false)
    }
    fetchData()
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
      assignTimeZone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!timeZoneOptions.length, !!whatsAppWidget?.time_zone_id])

  useEffect(() => {
    if ('value' in timeZoneSelected && !!timeZoneSelected?.value?.id) {
      const TIME_ZONE_ID = timeZoneSelected?.value?.id;
      onChangeAttributes(TIME_ZONE_ID, 'time_zone_id')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeZoneSelected])

  useEffect(() => {
    if (!!optionId && !!whatsAppWidget?.options?.length) {
      const OPTION = whatsAppWidget?.options?.find((option: Option) => option.id === optionId);
      if (!!OPTION) {
        setOption(OPTION);
      }
    }
  }, [optionId, whatsAppWidget?.options])

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
                <Button variation="primary" size="small" onClick={() => updateWhatsAppWidget()}>
                  Actualizar
                </Button>
              </span>
            </PageActions>
          </PageHeader>

          <div style={{ padding: '0 4rem' }}>
            {
              !!error && <div><span>{ error }</span></div>
            }
            {
              isLoading 
              ? <div className={`w-100 ${style['spinner-container']}`}> <Spinner /> </div>
              : !error && <DataView state={view}>
                  <Tabs fullWidth>
                    <Tab
                      label="General"
                      active={currentTab === 1}
                      onClick={() => setCurrentTab(1)}>

                      <div className={style.container}>
                        <div className={`${style.column}`}>
                          <div>
                            <div className="mb5">
                              <h2>Datos generales</h2>
                            </div>
                            <div className="mb5">
                              <Input 
                                placeholder="Escriba el título del botón" 
                                size="large" 
                                label="Título del botón" 
                                value={whatsAppWidget?.button_title}
                                name="button_title"
                                onChange={(e:React.FormEvent<HTMLInputElement>) => handleChange(e)}
                              />
                            </div>
                            <div className="mb5">
                              <Input 
                                placeholder="Escriba el título del header" 
                                size="large" 
                                label="Título del header" 
                                value={whatsAppWidget?.header_title}
                                name="header_title"
                                onChange={(e:React.FormEvent<HTMLInputElement>) => handleChange(e)}
                              />
                            </div>
                            <div className="mb5">
                              <Input 
                                placeholder="Escriba el subtítulo del header" 
                                size="large" 
                                label="Subítulo del header" 
                                value={whatsAppWidget?.header_subtitle}
                                name="header_subtitle"
                                onChange={(e:React.FormEvent<HTMLInputElement>) => handleChange(e)}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb0">
                              <h2>Colores</h2>
                            </div>
                            <div className="mb0">
                              <ColorPicker
                                label="Seleccione"
                                title="Color del botón"
                                color={{hex: whatsAppWidget?.button_color ?? '#FFF'}}
                                onChange={(color:Color) => onChangeColor(color, 'button_color')}
                                colorHistory={colorHistory}
                              />
                            </div>
                            <div className="mb0">
                              <ColorPicker
                                label="Seleccione"
                                title="Color del header"
                                color={{hex: whatsAppWidget?.header_color ?? '#FFF'}}
                                onChange={(color:Color) => onChangeColor(color, 'header_color')}
                                colorHistory={colorHistory}
                              />
                            </div>
                            <div className="mb5">
                            </div>
                          </div>
                        </div>
                        <div className={`${style.column}`}>
                            <div className="mb5">
                              <h2>Posición Desktop</h2>
                            </div>
                            {
                              !!whatsAppWidget?.position?.desktop &&
                                whatsAppWidget.position.desktop.map((position:PositionDetails, index: number) => (
                                  <div key={index} className={`mb5 ${style.position}`}>
                                    <div className="">
                                      <h3 className={style.title}>{position.position}</h3>
                                      <div className={`${style['position-form']}`}>
                                        <div className="mt3 w-25">
                                          <Input
                                            label="Valor"
                                            type="number"
                                            value={position.value}
                                            name="value"
                                            onChange={(e:React.FormEvent<HTMLInputElement>) => handleChangeValuePosition(e, position.position, 'desktop')}
                                          />
                                        </div>
                                        <div className="mt3 w-40">
                                          <Select
                                            label="Tipo"
                                            options={typeOptions}
                                            multi={false}
                                            name="type"
                                            clearable={false}
                                            value={{ value: position.type, label: typeOptions.find((item:TypeOption) => item.value === position.type)?.label }}
                                            onChange={(e: TypeOption) => handleChangeTypePosition(e.value, position.position, 'desktop')}
                                          />
                                        </div>
                                        <div className="mt3 w-30">
                                          <span className="vtex-input__label db mb5 w-100 c-on-base t-small">Estado</span>
                                          <Toggle
                                            label={position.active ? "Activo" : "Inactivo"}
                                            semantic
                                            checked={position.active}
                                            name="active"
                                            onChange={() => handleChangeActivePosition(position.position, 'desktop')}
                                          />
                                        </div>
                                      </div>
                                      <hr />
                                    </div>
                                  </div>
                                ))
                            }
                        </div>
                        <div className={`${style.column}`}>
                            <div className="mb5">
                              <h2>Posición Mobile</h2>
                            </div>
                            {
                              !!whatsAppWidget?.position?.mobile &&
                                whatsAppWidget.position.mobile.map((position:PositionDetails, index: number) => (
                                  <div key={index} className={`mb5 ${style.position}`}>
                                    <div className="">
                                      <h3 className={style.title}>{position.position}</h3>
                                      <div className={`${style['position-form']}`}>
                                        <div className="mt3 w-25">
                                          <Input
                                            label="Valor"
                                            type="number"
                                            value={position.value}
                                            name="value"
                                            onChange={(e:React.FormEvent<HTMLInputElement>) => handleChangeValuePosition(e, position.position, 'mobile')}
                                          />
                                        </div>
                                        <div className="mt3 w-40">
                                          <Select
                                            label="Tipo"
                                            options={typeOptions}
                                            multi={false}
                                            name="type"
                                            clearable={false}
                                            value={{ value: position.type, label: typeOptions.find((item:TypeOption) => item.value === position.type)?.label }}
                                            onChange={(e: TypeOption) => handleChangeTypePosition(e.value, position.position, 'mobile')}
                                          />
                                        </div>
                                        <div className="mt3 w-30">
                                          <span className="vtex-input__label db mb5 w-100 c-on-base t-small">Estado</span>
                                          <Toggle
                                            label={position.active ? "Activo" : "Inactivo"}
                                            semantic
                                            checked={position.active}
                                            name="active"
                                            onChange={() => handleChangeActivePosition(position.position, 'mobile')}
                                          />
                                        </div>
                                      </div>
                                      <hr />
                                    </div>
                                  </div>
                                ))
                            }
                        </div>
                      </div>

                    </Tab>
                    <Tab
                      label="Opciones"
                      active={currentTab === 2}
                      onClick={() => setCurrentTab(2)}>
                      <div className={style.container}>
                        <div className={`${style.column}`}>
                          <div>
                            <div className="mb5">
                              <h2>Horarios de atención</h2>
                            </div>
                            <div className="mb5">
                              <Select
                                value={timeZoneSelected}
                                size="regular"
                                placeholder="Seleccione..."
                                clearable={false}
                                multi={false}
                                label="Zona Horaria"
                                options={timeZoneOptions}
                                onChange={(option: TimeZoneOption) => setTimeZoneSelected(option)}
                              />
                            </div>
                            <div className="mt6 mb5">
                              <h3>Días</h3>
                            </div>
                            {
                              !!whatsAppWidget?.schedules?.length &&
                                whatsAppWidget.schedules.map((day:Schedule) => (
                                  <DaySchedule key={day.id} day={day} onDayChange={onDayChange} />
                                ))
                            }
                          </div>
                        </div>
                        <div className={`${style.column}`}>
                          <div>
                            <div className="mb5">
                              <h2>Opciones</h2>
                            </div>
                            <div className="mb5" key={whatsAppWidget?.options?.length}>
                              { !!whatsAppWidget?.options?.length && <WidgetOptions 
                                  options={whatsAppWidget?.options} 
                                  typeWidgets={typeWidgets}
                                  setOptionId={setOptionId} 
                                  onChangeAttributes={onChangeAttributes}
                                /> 
                              }
                            </div>
                          </div>
                        </div>
                        <div className={`${style.column}`}>
                          <div>
                            <div className="mb5">
                              <h2>Detalle opción</h2>
                            </div>
                            <div className="mb5">
                             {
                                !!whatsAppWidget?.options?.length && !!optionId && !!option &&
                                  <WidgetOption option={option} typeWidgets={typeWidgets} onOptionChange={onOptionChange} />
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tab>
                  </Tabs>
                </DataView>
            }
          </div>
        </ToastProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}


export default AdminWidgets
