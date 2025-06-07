import React from 'react';
import './ParkingFeeModal.css';

const USNFeeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>울산공항 주차요금 안내</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <table className="fee-table">
            <thead>
              <tr>
                <th className="center">4시간 10분까지</th>
                <th className="center">4시간 10분 ~ 24시간 까지</th>
                <th className="center">24시간 초과시</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="center">
                  <ul>
                    <li>기본 30분 600원</li>
                    <li>10분 초과마다 200원</li>
                    <li>최초 10분 무료</li>
                  </ul>
                </td>
                <td className="center">5,000원</td>
                <td className="center">최초계산방법과 동일</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default USNFeeModal;