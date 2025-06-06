import React, { useState } from 'react';
import './ParkingFeeModal.css';

const PUSFeeModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('p1p2');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>김해공항 주차요금 안내</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="terminal-tabs">
            <button 
              className={`tab ${activeTab === 'p1p2' ? 'active' : ''}`}
              onClick={() => setActiveTab('p1p2')}
            >
              P1, P2 여객주차장
            </button>
            <button 
              className={`tab ${activeTab === 'p3' ? 'active' : ''}`}
              onClick={() => setActiveTab('p3')}
            >
              P3 여객(화물)주차장
            </button>
          </div>

          {activeTab === 'p1p2' ? (
            <table className="fee-table">
              <thead>
                <tr>
                  <th rowSpan="2">구분</th>
                  <th colSpan="2">월요일 ~ 목요일</th>
                  <th colSpan="2">금요일 ~ 일요일 및 법정공휴일</th>
                </tr>
                <tr>
                  <th>소형</th>
                  <th>대형</th>
                  <th>소형</th>
                  <th>대형</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1일(24시간)주차시</td>
                  <td>
                    <ul>
                      <li>기본 30분: 900원</li>
                      <li>매 10분: 300원 추가</li>
                      <li>24시간: 10,000원</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>기본 30분: 1,200원</li>
                      <li>매 10분: 400원 추가</li>
                      <li>24시간: 9,000원</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>기본 30분: 900원</li>
                      <li>매 10분: 300원 추가</li>
                      <li>24시간: 15,000원</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>기본 30분: 1,200원</li>
                      <li>매 10분: 400원 추가</li>
                      <li>24시간: 13,000원</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td>1일 추가 주차시</td>
                  <td colSpan="4" className="center">상기요금 반복적용</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="fee-table">
              <thead>
                <tr>
                  <th rowSpan="2">구분</th>
                  <th colSpan="2">월요일 ~ 목요일</th>
                  <th colSpan="2">금요일 ~ 일요일 및 법정공휴일</th>
                </tr>
                <tr>
                  <th>소형</th>
                  <th>대형</th>
                  <th>소형</th>
                  <th>대형</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1일(24시간)주차시</td>
                  <td>
                    <ul>
                      <li>기본 30분: 900원</li>
                      <li>매 10분: 300원 추가</li>
                      <li>24시간: 7,000원</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>기본 30분: 1,200원</li>
                      <li>매 10분: 400원 추가</li>
                      <li>24시간: 5,000원</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>기본 30분: 900원</li>
                      <li>매 10분: 300원 추가</li>
                      <li>24시간: 10,000원</li>
                    </ul>
                  </td>
                  <td>
                    <ul>
                      <li>기본 30분: 1,200원</li>
                      <li>매 10분: 400원 추가</li>
                      <li>24시간: 7,000원</li>
                    </ul>
                  </td>
                </tr>
                <tr>
                  <td>1일 추가 주차시</td>
                  <td colSpan="4" className="center">상기요금 반복적용</td>
                </tr>
              </tbody>
            </table>
          )}

          <div className="parking-notice">
            <p>• 상기요금은 입차시간 기준이며 24시간마다 상기 요금을 반복 적용됩니다.</p>
            <p>• P3 여객(화물) 주차장은 주말 및 성수기에는 이용객 과다로 만차가 될 수 있음을 미리 양해드리며, 만차 시에는 P1, P2 여객 주차장을 이용해 주시기를 부탁드립니다.</p>
            <p className="contact">(문의전화: 대표번호 - 1661-2626, 051-974-3718)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PUSFeeModal;