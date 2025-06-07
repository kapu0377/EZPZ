import React, { useState } from 'react';
import './ParkingFeeModal.css';

const GMPFeeModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('passenger'); // passenger, cargo

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>김포공항 주차요금 안내</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="terminal-tabs">
            <button 
              className={`tab ${activeTab === 'passenger' ? 'active' : ''}`}
              onClick={() => setActiveTab('passenger')}
            >
              여객청사
            </button>
            <button 
              className={`tab ${activeTab === 'cargo' ? 'active' : ''}`}
              onClick={() => setActiveTab('cargo')}
            >
              화물청사
            </button>
          </div>

          {activeTab === 'passenger' ? (
            // 여객청사 요금표
            <table className="fee-table">
              <thead>
                <tr>
                  <th>요금체계</th>
                  <th>소형</th>
                  <th>대형</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan="3">1일(24시간) 주차시</td>
                  <td>
                    <p>월,화,수,목요일</p>
                    <ul>
                      <li>기본 30분: 1,000원</li>
                      <li>매 15분: 500원 추가</li>
                      <li>24시간: 20,000원</li>
                    </ul>
                    <p>금,토,일요일 및 법정공휴일</p>
                    <ul>
                      <li>기본 30분: 1,000원</li>
                      <li>매 15분: 500원 추가</li>
                      <li>24시간: 30,000원</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>기본 30분: 1,200원</li>
                      <li>매 10분: 400원 추가</li>
                      <li>24시간: 40,000원</li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            // 화물청사 요금표
            <div>
              <table className="fee-table">
                <thead>
                  <tr>
                    <th>요금체계</th>
                    <th>시간단위</th>
                    <th>요금</th>
                    <th>비고</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td rowSpan="2">소형</td>
                    <td>최초 30분</td>
                    <td>기본요금: 1,000원</td>
                    <td rowSpan="2">
                      월,화,수,목요일<br/>
                      6시간(12,000원)<br/><br/>
                      금,토,일요일 및 법정공휴일<br/>
                      9시간(18,000원)
                    </td>
                  </tr>
                  <tr>
                    <td>30분 이후</td>
                    <td>매 15분당 500원 추가</td>
                  </tr>
                  <tr>
                    <td rowSpan="2">대형</td>
                    <td>최초 30분</td>
                    <td>기본요금: 1,200원</td>
                    <td rowSpan="2">
                      입차시간 기준 1일(24시간)<br/>
                      요금 40,000원
                    </td>
                  </tr>
                  <tr>
                    <td>30분 이후</td>
                    <td>매 10분당 400원 추가</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GMPFeeModal;