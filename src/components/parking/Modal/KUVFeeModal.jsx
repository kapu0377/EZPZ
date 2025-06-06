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
                <th rowSpan="2">구분</th>
                <th colSpan="2">기본요금</th>
                <th>1일/24시간</th>
                <th>추가 1일마다</th>
              </tr>
              <tr>
                <th>30분</th>
                <th>5시간까지
                    10분마다</th>
                <th>24시간 까지</th>
                <th>24시간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>소형</td>
                <td>600원</td>
                <td>200원</td>
                <td>6,000원</td>
                <td>6,000원</td>
              </tr>
              <tr>
                <td>대형</td>
                <td>700원</td>
                <td>200원</td>
                <td>7,000원</td>
                <td>7,000원</td>
              </tr>
              <tr>
                <td>24시간 초과시</td>
                <td colSpan="2">상기요금 반복적용</td>
                <td>상기요금 반복적용</td>
                <td>상기요금 반복적용</td>
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