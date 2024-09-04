import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import style from './whats-app-widget.css';
import whatsAppIcon from './../../assets/whats-app.svg'
import closeIcon from '../../assets/close.svg'
import phoneIcon from '../../assets/phone-call.svg'
import chatIcon from '../../assets/chat-icon.svg'
import PublicApi from '../Adapters/PublicApi';
import { useRuntime } from 'vtex.render-runtime';
import { Widget, Option } from './../Interfaces/types';
import { Input } from 'vtex.styleguide';

const WhatsAppWidget = () => {
  const [widget, setWidget] = useState<Widget | null>(null);
  const [showWidget, setShowWidget] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showChat, setShowChat] = useState(false); // Estado para mostrar/ocultar chat
  const [optionId, setOptionId] = useState<number | string>('');
  const [buttonStyle, setButtonStyle] = useState({});
  const [modalStyle, setModalStyle] = useState({});
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    setChatId('4afcf6a380e9405fab14ac07389f84b2');
  }, [])

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
  const { rootPath } = useRuntime();
  const storeUrl = typeof window !== "undefined" ? window.location?.origin : rootPath;

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
          left: '50%',
          transform: 'translate(-50%, -50%)',
          msTransform: 'translate(-50%, -50%)',
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
              const final = `calc(${value} + 60px)`;
              defaultStyle = { ...defaultStyle, [pos.position]: final };
              const transform = 'translate(-50%, 0)';
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
        position.forEach(pos => {
          if (pos.active) {
            const value = pos.type === 'percentage' ? `${pos.value}%` : `${pos.value}px`;
            const final = `calc(${value} + 50px)`;
            styles = { ...styles, [pos.position]: final };
          }
        });

        if (Object.keys(styles).length) {
          delete defaultStyle.transform;
          delete defaultStyle.msTransform;
          delete defaultStyle.left;
        }

        return { ...defaultStyle, ...styles };
      };
      setModalStyle(calculateModalStyles());
    }
  }, [widget, showWidget]);

  useEffect(() => {
    if (showChat) {
      const interval = setInterval(() => {
        const chatButton = document.querySelector('.styles_button_main__2rvIi') as HTMLButtonElement;
        if (chatButton) {
          chatButton.style.display = 'none';
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [showChat]);

  const toggleModal = () => setModalOpen(!modalOpen);

  const handleChatClick = () => {
    setShowChat(true);
    const chatButton = document.querySelector('.styles_button_main__2rvIi') as HTMLButtonElement;
    if (chatButton) {
      chatButton.click(); // Simula el clic en el botón del chat
    }
  };

  const iconSrc = useMemo(() => modalOpen ? closeIcon : whatsAppIcon, [modalOpen]);

  const redirectToWhatsApp = (mobileNumber: string, predefinedMessage: string) => {
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${mobileNumber}&text=${predefinedMessage}&type=phone_number&app_absent=0`;
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

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .chat-container {
        box-shadow: 0px 0px 15px 5px rgba(128, 128, 128, 0.5);
      }
      .chatfaq-container {
        display: none !important;
      }
      .styles_button_main__2rvIi {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Limpia el estilo cuando el componente se desmonte si es necesario
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!chatId) {
      return;
    }
    const chatCookieName = `${chatId}_wcx-chat-visibility`;
    const chatCookieValue = '{"app":false,"button":true}';

    // Función para obtener el valor de una cookie por su nombre
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    // Función para establecer una cookie
    const setCookie = (name: string, value: string, days = 365) => {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${value}; expires=${expires}; path=/`;
    };

    // Verifica si la cookie existe
    const currentCookie = getCookie(chatCookieName);
    if (!currentCookie) {
      // Si la cookie no existe, la crea
      setCookie(chatCookieName, chatCookieValue);
    } else {
      // Si existe, asegura que tiene el valor correcto
      setCookie(chatCookieName, chatCookieValue);
    }

    // Inyecta el script después de verificar la cookie
    const scriptId = 'wcx-chat-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://api.wcx.cloud/widget/?id=${chatId}&url=${storeUrl}`;
      document.head.appendChild(script);

      // Ocultar el botón del chat después de que se haya cargado el script
      script.onload = () => {
        const interval = setInterval(() => {
          const chatButton = document.querySelector('.styles_button_main__2rvIi') as HTMLButtonElement;
          if (chatButton) {
            chatButton.style.display = 'none'; // Oculta el botón del chat
            clearInterval(interval);
          }
        }, 500);
      };
    }

    // Esperar un momento para asegurar que el DOM esté completamente cargado
    setTimeout(() => {
      const targetNode = document.querySelector('#wcx-chat');
      const config = { attributes: true, childList: true, subtree: true };

      // Observa los cambios en la clase del div del chat para mostrar/ocultar el widget
      const callback = (mutationsList: MutationRecord[]) => {
        for (let mutation of mutationsList) {
          if (mutation.type === 'attributes' || mutation.type === 'childList') {
            const chatFrame = document.getElementById(chatId) as HTMLElement;
            if (chatFrame && chatFrame.classList.contains('styles_slideIn__1Hvh3')) {
              // Si el chat está visible, oculta el widget
              const widgetContainer = document.querySelector('#widget-container') as HTMLElement;
              if (widgetContainer) {
                widgetContainer.style.display = 'none';
              }
            } else {
              // Si el chat está oculto, muestra el widget
              const widgetContainer = document.querySelector('#widget-container') as HTMLElement;
              if (widgetContainer) {
                widgetContainer.style.display = 'block';
                setShowChat(false);
              }
            }
          }
        }
      };

      const observer = new MutationObserver(callback);
      if (targetNode) {
        observer.observe(targetNode, config);
      }

      return () => observer.disconnect();
    }, 1000);

  }, [storeUrl, chatId]);

  useEffect(() => {
    const applyStylesToChatWindow = () => {
      const chatWindow = document.querySelector('.styles_window_right__2AH_j') as HTMLElement;
      
      if (chatWindow && window.innerWidth >= 640) {
        // Eliminar las posiciones existentes
        chatWindow.style.removeProperty('right');
        chatWindow.style.removeProperty('transform');

        // Aplicar las nuevas posiciones de buttonStyle
        (Object.keys(buttonStyle) as (keyof typeof buttonStyle)[]).forEach((key) => {
          if (key === 'bottom' || key === 'left' || key === 'right' || key === 'top') {
            chatWindow.style.setProperty(key, buttonStyle[key] as string);
          } else {
            chatWindow.style.setProperty(key, 'unset');
          }
        });
        chatWindow.style.setProperty('transform', 'none');
        chatWindow.style.setProperty('max-width', '330px');
      }
    };

    const interval = setInterval(() => {
      const chatWindow = document.querySelector('.styles_window_right__2AH_j');
      if (chatWindow) {
        applyStylesToChatWindow();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [buttonStyle]);

  const renderWidget = () => (
    <div id="widget-container" className={style['widget-container']} style={{ display: showChat ? 'none' : 'block' }}>
      <button id="widget-button" className={style['widget-button']} onClick={toggleModal} style={buttonStyle} title={widget?.button_title}>
        <img src={iconSrc} alt="WhatsApp" />
      </button>
      {modalOpen && (
        <div className={style['modal-container']} style={modalStyle}>
          <div className={style['modal-header']} style={{ backgroundColor: widget?.header_color }}>
            <h2>{widget?.header_title}</h2>
            <p>{widget?.header_subtitle}</p>
            <span className={style['close-head-modal']} onClick={toggleModal}>
              <img className={style['icon-close-head-modal']} src={closeIcon} />
            </span>
          </div>
          {
            !showForm && !showChat ?
              <div className={style['modal-options']}>
                {!!widget?.options.length && !message &&
                  widget.options.map((option: Option) => (
                    <div
                      key={option.id}
                      className={style['modal-option']}
                      style={{ backgroundColor: option.background_color }}
                      onClick={() => option.type === 'whatsapp' ? redirectToWhatsApp(option.mobile_phone ?? '', option.predefined_message ?? '') : option.type === 'chat' ? handleChatClick() : showFormCallMe(option.id)}
                    >
                      <span className={`${style['icon']}`}>
                        {
                          option.type === 'whatsapp' ? (
                            <img className={style['image']} src={option?.image ?? whatsAppIcon} alt="WhatsApp" />
                          ) : option.type === 'virfon' ? (
                            <img className={style['image']} src={option?.image ?? phoneIcon} alt="Call me back" />
                          ) : option.type === 'chat' ? (
                            <img className={style['image']} src={option?.image ?? chatIcon} alt="Chat on line" />
                          ) : null
                        }
                      </span>
                      <div className={style['option-content']} style={{ color: option.font_color }}>
                        <h3>{option.title}</h3>
                        <p>{option.message}</p>
                      </div>
                    </div>
                  ))
                }
                {!!message &&
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
                  {validationPhoneNumber && !validationName &&
                    <h5 className="mt2 mb2" style={{ color: 'red' }}>El nombre debe contener al menos 3 caracteres.</h5>
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
                  {typeof phoneNumber === 'string' && phoneNumber.length >= 10 && !validationPhoneNumber &&
                    <h5 className="mt2 mb2" style={{ color: 'red' }}>El número de teléfono móvil ingresado no es válido.</h5>
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
