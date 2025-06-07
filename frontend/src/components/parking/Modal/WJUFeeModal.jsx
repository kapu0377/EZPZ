import React from 'react';
import './ParkingFeeModal.css';

const WJUFeeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>원주공항 주차요금 안내</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <table className="fee-table">
            <thead>
              <tr>
                <th className="center">이용시간</th>
                <th className="center">구분</th>
                <th colSpan="2" className="center">요금</th>
                <th className="center">비고</th>
              </tr>
              <tr>
                <th></th>
                <th></th>
                <th className="center">소형</th>
                <th className="center">대형</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan="2" className="center">5시간이하</td>
                <td className="center">기본요금(30분)<br/>+ 무료시간 10분</td>
                <td className="center">500원</td>
                <td className="center">700원</td>
                <td rowSpan="5" className="center">
                  최초 10분<br/>무료
                </td>
              </tr>
              <tr>
                <td className="center">60분초과 10분당</td>
                <td className="center">200원</td>
                <td className="center">200원</td>
              </tr>
              <tr>
                <td className="center">1일(24시간)</td>
                <td className="center">5시간부터<br/>24시간까지</td>
                <td className="center">5,000원</td>
                <td className="center">7,000원</td>
              </tr>
            </tbody>
          </table>
          <div className="parking-notice">
            <p className="special-notice">• 최초 10분 무료 주차</p>
            <p>• 24시간 초과 시 일일요금 반복 적용</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WJUFeeModal;