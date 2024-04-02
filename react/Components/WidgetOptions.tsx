import React, { useEffect, useState } from 'react';
import { Option, OptionsList, TypeWidget } from '../Interfaces/types';
import { RadioGroup } from 'vtex.styleguide'

interface WidgetOptionsInterface {
  options: Option[];
  optionId: number;
  setOptionId: (id: number) => void;
  typeWidgets: TypeWidget[];
}

const WidgetOptions: React.FC<WidgetOptionsInterface> = ({ options, optionId, setOptionId, typeWidgets }) => {
  const [optionsList, setOptionsList] = useState<OptionsList[]>([]);

  const defineWidget = (value: string) => {
    return typeWidgets.find((typeWidget: TypeWidget) => typeWidget.value === value)?.label;
  }

  useEffect(() => {
    const LIST = options.map((option: Option) => ({value: option.id, label: `${option.title} - ${defineWidget(option.type)}`}));
    setOptionsList(LIST);
  }, []);

  return (
    <div>
      <RadioGroup
        name="option"
        options={optionsList}
        value={optionId}
        onChange={(e: React.FormEvent<HTMLInputElement>) => setOptionId(parseInt(e.currentTarget.value))}
      />
    </div>
  );
};

export default WidgetOptions;
