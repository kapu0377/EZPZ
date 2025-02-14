import React, { useState } from 'react';
import './ParkingFeeModal.css';

const CJUFeeModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('p1');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>제주공항 주차요금 안내</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="terminal-tabs">
            <button 
              className={`tab ${activeTab === 'p1' ? 'active' : ''}`}
              onClick={() => setActiveTab('p1')}
            >
              P1 주차장/국내외물주차장
            </button>
            <button 
              className={`tab ${activeTab === 'p2' ? 'active' : ''}`}
              onClick={() => setActiveTab('p2')}
            >
              P2 장기주차장
            </button>
          </div>

          {activeTab === 'p1' ? (
            <table className="fee-table">
              <thead>
                <tr>
                  <th rowSpan="2">구분</th>
                  <th colSpan="2">소형</th>
                  <th colSpan="2">대형</th>
                </tr>
                <tr>
                  <th>최초 30분</th>
                  <th>매 10분 마다</th>
                  <th>최초 30분</th>
                  <th>매 10분 마다</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>기본 입차부터 수시</td>
                  <td>600원</td>
                  <td>200원</td>
                  <td>800원</td>
                  <td>400원</td>
                </tr>
                <tr>
                  <td rowSpan="2">1일 최대 주차요금</td>
                  <td colSpan="2">평일: 10,000원</td>
                  <td colSpan="2">평일: 16,000원</td>
                </tr>
                <tr>
                  <td colSpan="2">주말, 공휴일: 15,000원</td>
                  <td colSpan="2">주말, 공휴일: 24,000원</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="fee-table">
              <thead>
                <tr>
                  <th rowSpan="2">구분</th>
                  <th colSpan="2">소형</th>
                  <th colSpan="2">대형</th>
                </tr>
                <tr>
                  <th>최초 30분</th>
                  <th>매 10분 마다</th>
                  <th>최초 30분</th>
                  <th>매 10분 마다</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>기본 입차부터 수시</td>
                  <td>600원</td>
                  <td>200원</td>
                  <td>800원</td>
                  <td>400원</td>
                </tr>
                <tr>
                  <td rowSpan="2">1일 최대 주차요금</td>
                  <td colSpan="2">평일: 8,000원</td>
                  <td colSpan="2">평일: 12,000원</td>
                </tr>
                <tr>
                  <td colSpan="2">주말, 공휴일: 12,000원</td>
                  <td colSpan="2">주말, 공휴일: 19,200원</td>
                </tr>
              </tbody>
            </table>
          )}

          <div className="parking-notice">
            <p>• 상기요금은 입차시간 기준이며 24시간마다 기본요금 반복적용</p>
            <p>• 장애 주차 차량 50% 할인(장애인복지카드 주차면 내 10분간 무료 대기 가능)</p>
            <p>• 상기요금은 부가세(5%)가 포함된 금액(20인승 기준으로 대형 구분)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CJUFeeModal;