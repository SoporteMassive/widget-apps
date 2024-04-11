import React, { useState, useEffect } from 'react';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  SortEndHandler,
} from 'react-sortable-hoc';
import { Option, TypeWidget } from '../Interfaces/types';
import { IconContext } from "react-icons";
import { FaBars, FaRegClone } from "react-icons/fa6";
import { BsTrash } from "react-icons/bs";
import style from './widget-options.css';

declare global {
  interface Crypto {
    randomUUID: () => string;
  }
}

// DragHandle componente para manejar el arrastre
const DragHandle = SortableHandle(() => <span style={{ cursor: 'grab'}}>
  <IconContext.Provider value={{ size: '1.5rem' }}>
    <div>
      <FaBars />
    </div>
  </IconContext.Provider>
</span>);

interface SortableItemProps {
  value: string;
  optionId: number | string;
  setOptionId: (optionId: number | string) => void;
  cloneOption: (optionId: number | string) => void;
  deleteOption: (optionId: number | string) => void;
}

// SortableItem usando DragHandle
const SortableItem = SortableElement<SortableItemProps>(({ value, optionId, setOptionId, cloneOption, deleteOption }: SortableItemProps) => (
  <div className={style.option}>
    <div className={style['option-label']}>
      <input 
        onClick={() => setOptionId(optionId)} 
        style={{cursor: 'pointer'}} 
        type="radio" 
        id={`option-${String(optionId)}`} 
        name="option" 
        value={value} 
        className="mr2" 
      />
      <label style={{cursor: 'pointer'}} htmlFor={`option-${String(optionId)}`}>{value}</label>
    </div>
    <div className={style.actions}>
      <div>
        <button onClick={() => cloneOption(optionId)} className={style['action-clone']} title="Clonar opción">
          <IconContext.Provider value={{ size: '1.1rem', color: '#fff' }}>
            <div>
              <FaRegClone />
            </div>
          </IconContext.Provider>
        </button>
        <button onClick={() => deleteOption(optionId)} className={style['action-delete']} title="Eliminar opción">
          <IconContext.Provider value={{ size: '1.1rem', color: '#fff' }}>
            <div>
              <BsTrash />
            </div>
          </IconContext.Provider>
        </button>
      </div>
      <div>
        <DragHandle />
      </div>
    </div>
  </div>
));

interface SortableListProps {
  setOptionId: (optionId: number | string) => void;
  items: Option[];
  typeWidgets: TypeWidget[];
  cloneOption: (optionId: number | string) => void;
  deleteOption: (optionId: number | string) => void;
}

// Lista ordenable que renderiza SortableItem
const SortableList = SortableContainer<SortableListProps>(({ setOptionId, items, typeWidgets, cloneOption, deleteOption }: SortableListProps) => {
  const defineWidgetLabel = (type: string) => typeWidgets.find((typeWidget: TypeWidget) => typeWidget.value === type)?.label || type;

  return (
    <div>
      {items.map((option: Option, index: number) => (
        <SortableItem key={`item-${option.id}`} index={index} value={`${option.title} - ${defineWidgetLabel(option.type)}`} optionId={option.id} setOptionId={setOptionId} cloneOption={cloneOption} deleteOption={deleteOption} />
      ))}
    </div>
  );
});

interface WidgetOptionsInterface {
  options: Option[];
  typeWidgets: TypeWidget[];
  setOptionId: (optionId: number | string) => void;
  onChangeAttributes: (value: Option[], field: string) => void;
}

// Componente principal que utiliza SortableList
const WidgetOptions: React.FC<WidgetOptionsInterface> = ({ options, typeWidgets, setOptionId, onChangeAttributes}: WidgetOptionsInterface) => {
  const [items, setItems] = useState<Option[]>(options);
  
  // Implementación personalizada de arrayMove
  function arrayMoveImmutable<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    const newArray = [...array];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);
    return newArray;
  }

  const onSortEnd: SortEndHandler = ({ oldIndex, newIndex }) => {
    setItems((currentItems) => arrayMoveImmutable(currentItems, oldIndex, newIndex));
  };

  const cloneOption = (optionId: number | string) => {
    let option = items.find((item: Option) => item.id === optionId);
    if (!option) return;
    const order = items.length;
    const ID = crypto.randomUUID();
    option = {
      ...option,
      ['id']: ID,
      ['order']: order,
    }
    const OPTIONS = [
      ...items,
      option
    ];
    onChangeAttributes(OPTIONS, 'options');
    setTimeout(() => {
      const element = document.querySelector(`#option-${ID}`) as HTMLInputElement;
      if (!!element) {
        element.click();
      }
    }, 500)
    setOptionId(ID);
  }

  const deleteOption = (optionId: number | string) => {
    const OPTIONS = items.filter((item: Option) => item.id !== optionId);
    onChangeAttributes(OPTIONS, 'options');
  }

  useEffect(() => {
    if (JSON.stringify(options) !== JSON.stringify(items)) {
      setItems([...options])
    }
  }, [options])

  useEffect(() => {
    if (items.length) {
      const OPTIONS = items.map((item: Option, index: number) => {
        return {
          ...item,
          ['order']: index
        };
      });
      onChangeAttributes(OPTIONS, 'options');
    }
  }, [items])

  return <SortableList setOptionId={setOptionId} items={items} typeWidgets={typeWidgets} cloneOption={cloneOption} deleteOption={deleteOption} onSortEnd={onSortEnd} useDragHandle />;
};

export default WidgetOptions;
