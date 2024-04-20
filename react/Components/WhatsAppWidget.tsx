import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import style from './whats-app-widget.css';
import whatsAppIcon from './../../assets/whats-app.svg'
import closeIcon from '../../assets/close.svg'
import phoneIcon from '../../assets/phone-call.svg'
import PublicApi from '../Adapters/PublicApi';
import { useRuntime } from 'vtex.render-runtime';
import { Widget, Option } from './../Interfaces/types';
import { Input } from 'vtex.styleguide';

const WhatsAppWidget = () => {
  const [widget, setWidget] = useState<Widget | null>(null);
  const [showWidget, setShowWidget] = useState<boolean>(false)
  const [modalOpen, setModalOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [optionId, setOptionId] = useState<number | string>('');
  const [buttonStyle, setButtonStyle] = useState({});
  const [modalStyle, setModalStyle] = useState({});
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null)
  const [name, setName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  const validationName = useMemo(() => name.length >= 3, [name]);

  const validationPhoneNumber = useMemo(() => {
    if (!phoneNumber) return false;
    const normalizedNumber = phoneNumber.replace(/\D/g, '');
    const pattern = /^(?:\+?573\d{9}|3\d{9})$/;
    return pattern.test(normalizedNumber);
  }, [phoneNumber]);

  const validationResults = useMemo(() => {
    return validationName && validationPhoneNumber;
  }, [validationName, validationPhoneNumber]);

  const publicApi = new PublicApi();
  const { account } = useRuntime();

  useEffect(() => {
    const getWhatsAppWidget = async () => {
      const DATA = await publicApi.callGet(`whats-app-widget/${account}`, {});
      setWidget(DATA.data.widget);
      setShowWidget(DATA?.data?.active && !!DATA?.data?.widget?.options?.length);
    };

    getWhatsAppWidget();
  }, [account]);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof document !== "undefined" && showWidget) {
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
      setModalStyle(calculateModalStyles());

    }
  }, [widget, showWidget])

  const toggleModal = () => setModalOpen(!modalOpen);

  const iconSrc = useMemo(() => modalOpen ? closeIcon : whatsAppIcon, [modalOpen]);

  const redirectToWhatsApp = (mobileNumber: string) => {
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${mobileNumber}&text&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const showFormCallMe = (id: number | string) => {
    setShowForm(true);
    setOptionId(id);
  }

  const callMeBack = async () => {
    setSending(true);
    const data = {
      "number": phoneNumber,
      "id": optionId
    };
    const DATA = await publicApi.callPost(`whats-app-widget/${account}/call-me-back`, data);
    setMessage(DATA.message);
    setShowForm(false);
    setTimeout(() => setMessage(''), 5000);
    setPhoneNumber('');
    setName('');
    setSending(false);
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
                !!widget?.options.length && !message &&
                  widget.options.map((option: Option) => (
                    <div 
                      key={option.id}
                      className={style['modal-option']} 
                      style={{ backgroundColor: option.background_color }}
                      onClick={() => option.type === 'whatsapp' ? redirectToWhatsApp(option.mobile_phone ?? '') : showFormCallMe(option.id)}
                    >
                      <span className={`${style['icon']}`}>
                        {
                          option.type === 'whatsapp'
                          ? <img className={style['image']} src={option?.image ?? whatsAppIcon} alt="WhatsApp" />
                          : <img className={style['image']} src={option?.image ?? phoneIcon} alt="WhatsApp" />
                        }
                      </span>
                      <div className={style['option-content']} style={{ color: option.font_color }}>
                        <h3>{ option.title }</h3>
                        <p>{ option.message }</p>
                      </div>
                    </div>
                  ))
              }
              {
                !!message &&
                <div className={`w-100 m2 ${style['message-container']}`}>
                    {message}
                  </div> 
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
                  value={name}
                  onChange={(e: React.FormEvent<HTMLInputElement>) => setName(e.currentTarget.value)}
                />
              </div>
              <div className="mb5">
                  {
                    validationPhoneNumber && !validationName &&
                      <h5 className="mt2 mb2" style={{color: 'red'}}>El nombre debe contener al menos 3 caracteres.</h5>
                  }
              </div>
              <div className="mb5">
                <Input
                  placeholder="Número de teléfono *"
                  type="number"
                  value={phoneNumber}
                  onChange={(e: React.FormEvent<HTMLInputElement>) => setPhoneNumber(e.currentTarget.value)}
                />
              </div>
              <div className="mb5">
                  {
                    typeof phoneNumber === 'string' && phoneNumber.length >= 10 && !validationPhoneNumber &&
                      <h5 className="mt2 mb2" style={{color: 'red'}}>El número de teléfono móvil ingresado no es válido.</h5>
                  }
              </div>
              <div className="mb5">
                <div className="mb4 flex justify-end">
                  <button 
                      className={`mr3 ${style['button']} ${style['button--secondary']}`}
                      onClick={() => setShowForm(false)} 
                    >Cancelar</button>
                  <button 
                      className={`${style['button']} ${style['button--primary']}`}
                      onClick={() => callMeBack()}
                      disabled={!validationResults || sending}
                    >Enviar</button>
                </div>
              </div>

            </div>
          }
        </div>
      )}
    </div>
  );

  if (!showWidget) {
    return null;
  }

  return typeof document === "undefined"
    ? null
    : ReactDOM.createPortal(
        renderWidget(),
        document.body
      );
};

export default WhatsAppWidget;
