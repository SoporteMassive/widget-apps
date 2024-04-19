import React, { useState } from 'react';
import { Option, Color, TypeWidget } from '../Interfaces/types';
import { Input, ColorPicker, Toggle, EXPERIMENTAL_Select as Select } from 'vtex.styleguide'

interface WidgetOptionsInterface {
  option: Option;
  typeWidgets: TypeWidget[];
  onOptionChange: (option: Option) => void;
}

const WidgetOption: React.FC<WidgetOptionsInterface> = ({ option, typeWidgets, onOptionChange }) => {
  const [colorHistory, setColorHistory] = useState<Object[]>([]);

  const handleChange = (value: string | number | boolean, field: string) => {
    const OPTION = {
      ...option,
      [field]: value
    }
    onOptionChange(OPTION);
  }

  return (
    <div>
      <div className="mb5">
        <Input 
          placeholder="Escribe el título" 
          size="small" 
          label="Título" 
          value={option.title}
          onChange={(e: React.FormEvent<HTMLInputElement>) => handleChange(e.currentTarget.value, 'title')}
        />
      </div>
      <div className="mb5">
        <Input 
          placeholder="Escribe un mensaje" 
          size="small" 
        label="Mensaje" 
        value={option.message}
        onChange={(e: React.FormEvent<HTMLInputElement>) => handleChange(e.currentTarget.value, 'message')}
      />
      </div>
      <div className="mb5">
        <Select
          label="Tipo de widget"
          options={typeWidgets}
          multi={false}
          size="small" 
          name="type"
          clearable={false}
          value={{ value: option.type, label: typeWidgets.find((item:TypeWidget) => item.value === option.type)?.label }}
          onChange={(e: TypeWidget) => handleChange(e.value, 'type')}
        />
      </div>
      {
        option?.type === 'whatsapp' &&
        <div className="mb5">
          <Input 
            placeholder="Digita el # móvil"
            size="small" 
            label="Número de WhatsApp"
            value={option.mobile_phone}
            onChange={(e: React.FormEvent<HTMLInputElement>) => handleChange(e.currentTarget.value, 'mobile_phone')}
          />
        </div>
      }
      {
        option?.type === 'virfon' &&
        <div className="mb5">
          <Input 
            placeholder="Defina la cola o servicio"
            size="small" 
            type="number"
            label="Cola o servicio"
            value={option.queue}
            onChange={(e: React.FormEvent<HTMLInputElement>) => handleChange(e.currentTarget.value, 'queue')}
          />
        </div>
      }
      <div className="mb0">
        <ColorPicker
          label="Color fuente"
          color={{hex: option?.font_color ?? '#FFF'}}
          onChange={(color:Color) => { handleChange(color.hex, 'font_color'); setColorHistory([...colorHistory, color]) }}
          colorHistory={colorHistory}
          size="small" 
        />
      </div>
      <div className="mb0">
        <ColorPicker
          label="Color botón"
          color={{hex: option?.background_color ?? '#FFF'}}
          onChange={(color:Color) => { handleChange(color.hex, 'background_color'); setColorHistory([...colorHistory, color]) }}
          colorHistory={colorHistory}
          size="small" 
        />
      </div>
      <div className="mb5">
        <Input 
          placeholder="Path o url del ícono a mostrar" 
          size="small" 
          label="Ícono" 
          value={option.image}
          onChange={(e: React.FormEvent<HTMLInputElement>) => handleChange(e.currentTarget.value, 'image')}
        />
      </div>
      <div>
        <span className="vtex-input__label db mb5 w-100 c-on-base t-small">Estado</span>
        <Toggle
          label={option.active ? "Activo" : "Inactivo"}
          semantic
          checked={option.active}
          name="active"
          onChange={() => handleChange(!option.active, 'active') }
        />
      </div>
    </div>
  );
};

export default WidgetOption;
