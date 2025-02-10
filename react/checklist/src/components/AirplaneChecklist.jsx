import React, { useState } from 'react';
import { addChecklistItem, updateChecklistItem, deleteChecklistItem } from '../services/checklistApi';
import '../globals.css';

const initialData = {
  '필수 준비물': ['여권', '신분증', '탑승권'],
  '전자기기': ['스마트폰', '노트북', '충전기'],
  '화장품': ['립밤', '핸드크림', '썬크림'],
  '기타': ['책', '간식']
};

export default function AirplaneChecklist() {
  const [checklist, setChecklist] = useState(initialData);
  const [newItem, setNewItem] = useState({});

  const handleCheck = (category, item) => {
    const updatedCategory = checklist[category].map(i =>
      i === item ? (i.startsWith('✅ ') ? i.slice(2) : `✅ ${i}`) : i
    );
    setChecklist({ ...checklist, [category]: updatedCategory });
  };

  const handleAddItem = (category) => {
    const itemToAdd = newItem[category];
    if (itemToAdd && itemToAdd.trim() !== '') {
      setChecklist({
        ...checklist,
        [category]: [...checklist[category], itemToAdd]
      });
      setNewItem({ ...newItem, [category]: '' });
    }
  };

  const handleDeleteItem = (category, itemToDelete) => {
    const updatedCategory = checklist[category].filter(item => item !== itemToDelete);
    setChecklist({ ...checklist, [category]: updatedCategory });
  };

  const handleInputChange = (category, value) => {
    setNewItem({ ...newItem, [category]: value });
  };

  const handleSave = async () => {
    try {
      for (const category in checklist) {
        for (const item of checklist[category]) {
          const isChecked = item.startsWith('✅ ');
          const cleanItem = isChecked ? item.slice(2) : item;

          await addChecklistItem(category, cleanItem, isChecked);
        }
      }
      alert('체크리스트가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container">
      <div className="checklist-grid">
        {Object.keys(checklist).map(category => (
          <div key={category} className="checklist-card-gradient">
            <h2 className="checklist-title-gradient">{category}</h2>
            <div className="checklist-items">
              {checklist[category].map((item, index) => (
                <div key={index} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.startsWith('✅ ')}
                    onChange={() => handleCheck(category, item)}
                  />
                  <span className={item.startsWith('✅ ') ? 'checked' : ''}>
                    {item.replace('✅ ', '')}
                  </span>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteItem(category, item)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <div className="add-item-inline">
              <input
                type="text"
                value={newItem[category] || ''}
                onChange={e => handleInputChange(category, e.target.value)}
                placeholder="새 항목 입력"
              />
              <button onClick={() => handleAddItem(category)}>+</button>
            </div>
          </div>
        ))}
      </div>
      <button className="save-button" onClick={handleSave}>저장</button>
    </div>
  );
}
