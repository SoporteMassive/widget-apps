import React, { useState, useEffect } from 'react'
import { useRuntime } from 'vtex.render-runtime'

import whatsAppIcon from '../../assets/whatsapp-icon-black-white.png'
import PublicApi from '../Adapters/PublicApi'

const WhatsAppButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false)

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
    border: '2px solid #000',
    height: '40px',
    marginTop: '10px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  }

  const hoveredStyle = {
    backgroundColor: isHovered ? '#000' : '#FDFEFE',
    color: isHovered ? '#FDFEFE' : '#000  ',
  }

  if (!show) {
    return <></>
  }

  return (
    <a
      onClick={() => redirectToWhatsApp()}
      style={{ ...baseStyle, ...hoveredStyle }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={{ textTransform: 'uppercase' }}>
        Necesito ayuda con mi compra
      </span>
      <img
        src={whatsAppIcon}
        alt="WhatsApp Icon"
        style={{
          marginTop: '-2px',
          marginLeft: '5px',
          height: '200%',
          borderRadius: '48%',
        }}
      />
    </a>
  )
}

export default WhatsAppButton
