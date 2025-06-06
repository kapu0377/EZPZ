import React from 'react';
import './ParkingFeeModal.css';

const ICNFeeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>주차 요금 안내</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
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
                <td>단기주차장</td>
                <td>
                  <p>최초 10분 무료</p>
                  <p>기본 30분 1,200원</p>
                  <p>추가 15분 600원</p>
                  <p>시간당 2,400원</p>
                  <p className="total">일 24,000원</p>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>장기주차장<br/>(제1 여객터미널 주차타워 포함)</td>
                <td>
                  <p>최초 10분 무료</p>
                  <p>시간당 1000원</p>
                  <p className="total">일 9,000원</p>
                </td>
                <td>-</td>
              </tr>
              <tr>
                <td>화물터미널 주차장</td>
                <td>
                  <p>최초 45분 무료</p>
                  <p>추가 15분 500원</p>
                  <p className="total">일 10,000원</p>
                </td>
                <td>
                  <p>최초 45분 무료</p>
                  <p>추가 15분 600원</p>
                  <p className="total">일 12,000원</p>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="fee-notes">
            <p>※ 주차 요금을 고려하여 1일 이상 장기 주차 시에는 장기 주차장 이용을 권장 드립니다.</p>
            <p>※ 단기주차장은 승용차전용(차량 제한높이 2.1m이하) 주차입니다.</p>
            <p>※ 제1 여객터미널 여객주차장은 일 7,000원으로 한시적 할인 프로모션을 시행합니다.(-25년 2월 28일)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ICNFeeModal;