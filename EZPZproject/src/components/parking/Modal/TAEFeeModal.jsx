import React from 'react';
import './ParkingFeeModal.css';

const TAEFeeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>대구공항 주차요금 안내</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <table className="fee-table">
            <thead>
              <tr>
                <th>구분</th>
                <th>이용시간</th>
                <th>주차요금</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td rowSpan="4">소형<br/>(15인승 이하, 1톤 이하)</td>
                <td>기본요금(30분 미만)</td>
                <td>800원</td>
              </tr>
              <tr>
                <td>추가요금 (매 15분당)</td>
                <td>400원</td>
              </tr>
              <tr>
                <td>월~목요일 1일 (6시간 초과 24시간까지)</td>
                <td>13,000원</td>
              </tr>
              <tr>
                <td>금~일요일 및 법정공휴일 1일 (6시간 초과 24시간까지)</td>
                <td>15,000원</td>
              </tr>
              <tr>
                <td rowSpan="3">대형<br/>(15인승 초과, 1톤 초과)</td>
                <td>기본요금(30분 미만)</td>
                <td>1,100원</td>
              </tr>
              <tr>
                <td>추가요금 (매 10분당)</td>
                <td>400원</td>
              </tr>
              <tr>
                <td>1일 (6시간 초과 24시간까지)</td>
                <td>14,000원</td>
              </tr>
            </tbody>
          </table>

          <div className="sub-section">
            <h3>차량구분</h3>
            <table className="fee-table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>소형</th>
                  <th>대형</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>승합자</td>
                  <td>15인승 이하</td>
                  <td>16인승 이상</td>
                </tr>
                <tr>
                  <td>화물차</td>
                  <td>1톤 이하</td>
                  <td>1톤 초과</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="parking-notice">
            <p>• 상기요금은 입차시간 기준이며 24시간마다 기본요금 반복적용</p>
            <p>• 2018년 12월 1일부터 적용되는 요금입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TAEFeeModal;