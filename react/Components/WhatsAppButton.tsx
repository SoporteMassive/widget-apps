/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from 'react'
import { useRuntime } from 'vtex.render-runtime'

import whatsAppIcon from '../../assets/whatsapp.png'
import PublicApi from '../Adapters/PublicApi'

const WhatsAppButton: React.FC = () => {
  const [show, setShow] = useState(false)

  const [mobilePhone, setMobilePhone] = useState('')

  const publicApi = new PublicApi()

  const { account } = useRuntime()

  const validateWhatsAppAvailability = async () => {
    try {
      const DATA = await publicApi.callGet(
        `whats-app/${account}/active-schedule-status`,
        {}
      )

      if (!DATA.success) {
        throw new Error(`Error: ${DATA.message}`)
      }

      const data = await DATA.data

      setMobilePhone(data?.mobile_phone)
      setShow(data?.active)
    } catch (error) {
      console.error('Error al validar la disponibilidad de WhatsApp:', error)
      setShow(false)
    }
  }

  const redirectToWhatsApp = () => {
    const productURL = window.location.href
    const message = `Hola, estoy interesado en este producto ${productURL} *¿me puedes ayudar en mi compra?*`
    const whatsappUrl = `https://wa.me/${mobilePhone}?text=${encodeURIComponent(
      message
    )}`

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    if (account) {
      validateWhatsAppAvailability()
    }
  }, [account])

  const baseStyle = {
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    textDecoration: 'none',
    border: 'none',
    height: '2.8rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    backgroundColor: '#E5E5E5',
    marginTop: '1rem',
    marginBottom: '0.7rem',
    borderRadius: '10px',
  }

  const hoveredStyle = {
    backgroundColor: '#127f34',
    color: '#fff',
  }

  if (!show) {
    return <></>
  }

  return (
    <a
      onClick={() => redirectToWhatsApp()}
      style={{ ...baseStyle, ...hoveredStyle }}
    >
      <img
        src={whatsAppIcon}
        alt="WhatsApp Icon"
        style={{
          marginTop: '-2px',
          marginRight: '10px',
          height: '130%',
          borderRadius: '10%',
        }}
      />
      <span
        style={{
          textTransform: 'uppercase',
          fontFamily: 'Quicksand-Regular',
          fontSize: '12px',
          padding: '5px 0px',
        }}
      >
        Necesito ayuda con mi compra
      </span>
    </a>
  )
}

export default WhatsAppButton
