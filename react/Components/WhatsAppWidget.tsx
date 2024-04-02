import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import style from './whats-app-widget.css';
import whatsAppIcon from './../../assets/whats-app.svg'
import closeIcon from '../../assets/close.svg'
import phoneIcon from '../../assets/phone-call.svg'
import AdminApi from '../Adapters/AdminApi';
import { useRuntime } from 'vtex.render-runtime';
import { Widget, Option } from './../Interfaces/types';
import { Input, Button } from 'vtex.styleguide';

const WhatsAppWidget = () => {
  const [widget, setWidget] = useState<Widget | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [buttonStyle, setButtonStyle] = useState({});
  const [modalStyle, setModalStyle] = useState({});

  const adminApi = new AdminApi();
  const { account } = useRuntime();

  useEffect(() => {
    const getWhatsAppWidget = async () => {
      const DATA = await adminApi.callGet(`whats-app-widget/${account}`, {});
      setWidget(DATA.data.widget);
    };

    getWhatsAppWidget();
  }, [account]);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const calculatePositionStyles = () => {
        if (!widget) return {};
        let styles: React.CSSProperties = {};
        const position = window.innerWidth < 640 ? widget.position.mobile : widget.position.desktop;
        position.forEach(pos => {
          if (pos.active) {
            const value = pos.type === 'percentage' ? `${pos.value}%` : `${pos.value}px`;
            styles = { ...styles, [pos.position]: value };
          }
        });
        return styles;
      };

      setButtonStyle({
        backgroundColor: widget?.button_color,
        ...calculatePositionStyles(),
      });

      const calculateModalStyles = () => {
        let defaultStyle = {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          msTransform: 'translate(-50%, -50%)', // Para IE 9
          maxWidth: 'calc(100% - 20px)',
          height: 'fit-content',
        };

        if (!widget) {
          return defaultStyle;
        }

        const position = window.innerWidth < 640 ? widget.position.mobile : widget.position.desktop;

        if (window.innerWidth < 640) {
          position.forEach(pos => {
            if (pos.active && ['top', 'bottom'].includes(pos.position)) {
              const value = pos.type === 'percentage' ? `${pos.value}%` : `${pos.value}px`;
              const final = `calc(${value} + 50px)`;
              defaultStyle = { ...defaultStyle, [pos.position]: final };
              const adjust = pos.position === 'bottom' ? '40' : '0';
              const transform = `translate(-50%, calc(${value} + ${adjust}px))`;
              defaultStyle = {
                ...defaultStyle,
                ['transform']: transform,
                ['msTransform']: transform,
              }
            }
          });
          return defaultStyle;
        }

        let styles: React.CSSProperties = {};
        // Para pantallas mayores de 640px, calcula el estilo según el widget
        position.forEach(pos => {
          if (pos.active) {
            const value = pos.type === 'percentage' ? `${pos.value}%` : `${pos.value}px`;
            const final = `calc(${value} + 50px)`;
            styles = { ...styles, [pos.position]: final };
          }
        });

        // Remueve la transformación que centra el modal para posiciones específicas
        if (Object.keys(styles).length) {
          delete defaultStyle.transform;
          delete defaultStyle.msTransform;
          delete defaultStyle.top;
          delete defaultStyle.left;
        }

        return { ...defaultStyle, ...styles };
      };
      // let styles: React.CSSProperties = {};
      setModalStyle(calculateModalStyles());

    }
  }, [widget])

  const toggleModal = () => setModalOpen(!modalOpen);

  const iconSrc = useMemo(() => modalOpen ? closeIcon : whatsAppIcon, [modalOpen]);

  const redirectToWhatsApp = (mobileNumber: string) => {
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${mobileNumber}&text&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const callMeBack = () => {
    console.log('CallMeBack');
  };

  const renderWidget = () => (
    <div className={style['widget-container']}>
      <button className={style['widget-button']} onClick={toggleModal} style={buttonStyle} title={widget?.button_title}>
        <img src={iconSrc} alt="WhatsApp" />
      </button>
      {modalOpen && (
        <div className={style['modal-container']} style={modalStyle}>
          <div className={style['modal-header']} style={{ backgroundColor: widget?.header_color }}>
            <h2>{ widget?.header_title }</h2>
            <p>{ widget?.header_subtitle }</p>
          </div>
          {
            ! showForm ?
            <div className={style['modal-options']}>
              {
                !!widget?.options.length &&
                  widget.options.map((option: Option) => (
                    <div 
                      key={option.id}
                      className={style['modal-option']} 
                      style={{ backgroundColor: option.background_color }}
                      onClick={() => option.type === 'whatsapp' ? redirectToWhatsApp(option.mobile_phone ?? '') : setShowForm(true)}
                    >
                      <span className={`${style['icon']}`}>
                        {
                          option.type === 'whatsapp'
                          ? <img className={style['image']} src={whatsAppIcon} alt="WhatsApp" />
                          : <img className={style['image']} src={phoneIcon} alt="WhatsApp" />
                        }
                      </span>
                      <div className={style['option-content']} style={{ color: option.font_color }}>
                        <h3>{ option.title }</h3>
                        <p>{ option.message }</p>
                      </div>
                    </div>
                  ))
              }
            </div>
            :
            <div className={style['modal-form']}>
              <div className="mb5">
                  <h5>Ingresa los datos solicitados donde nos estaremos contactando.</h5>
              </div>
              <div className="mb5">
                <Input
                  placeholder="Nombre *"
                />
              </div>
              <div className="mb5">
                <Input
                  placeholder="Número de teléfono *"
                />
              </div>
              <div className="mb5">
                <div className="mb4 flex justify-end">
                  <Button variation="secondary" size="regular" onClick={() => setShowForm(false)}>Cancelar</Button>
                  <Button variation="prumary" size="regular" onClick={() => callMeBack()}>Enviar</Button>
                </div>
              </div>

            </div>
          }
        </div>
      )}
    </div>
  );

  return typeof document === "undefined"
    ? null
    : ReactDOM.createPortal(
        renderWidget(),
        document.body
      );
};

export default WhatsAppWidget;
