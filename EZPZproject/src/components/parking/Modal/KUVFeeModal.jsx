import React from 'react';
import './ParkingFeeModal.css';

const KUVFeeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>군산공항 주차요금 안내</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <table className="fee-table">
            <thead>
              <tr>
                <th rowSpan="2" className="center">구분</th>
                <th colSpan="2" className="center">기본요금(BASIC CHARGE)</th>
                <th className="center">1일/24시간<br/>(AFTER 5 HRS)</th>
                <th className="center">추가 1일마다<br/>(REMARK)</th>
              </tr>
              <tr>
                <th className="center">30분(30MIN)</th>
                <th className="center">5시간까지
                    10분마다<br/>(EVERY 10MIN, UNTIL 5 HRS)</th>
                <th className="center">24시간 까지<br/>(UNTIL 24 HRS)</th>
                <th className="center">24시간(24HRS)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="center">소형<br/>(LESS THAN 1 TON)</td>
                <td className="center">600원</td>
                <td className="center">200원</td>
                <td className="center">6,000원</td>
                <td className="center">6,000원</td>
              </tr>
              <tr>
                <td className="center">대형<br/>(MORE THAN 1 TON)</td>
                <td className="center">700원</td>
                <td className="center">200원</td>
                <td className="center">7,000원</td>
                <td className="center">7,000원</td>
              </tr>
              <tr>
                <td className="center">24시간 초과시</td>
                <td colSpan="2" className="center">상기요금 반복적용</td>
                <td className="center">상기요금 반복적용</td>
                <td className="center">상기요금 반복적용</td>
              </tr>
            </tbody>
          </table>

          <div className="parking-notice">
            <p className="special-notice">• 최초 10분 무료 주차 가능</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KUVFeeModal;