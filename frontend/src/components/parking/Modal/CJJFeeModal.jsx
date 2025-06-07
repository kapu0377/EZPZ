import React, { useState } from 'react';
import './ParkingFeeModal.css';

const CJJFeeModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('parking12');
  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>청주공항 주차요금 안내</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="terminal-tabs">
            <button 
              className={`tab ${activeTab === 'parking12' ? 'active' : ''}`}
              onClick={() => setActiveTab('parking12')}
            >
              제1, 2주차장
            </button>
            <button 
              className={`tab ${activeTab === 'parking34' ? 'active' : ''}`}
              onClick={() => setActiveTab('parking34')}
            >
              제3, 4주차장
            </button>
          </div>

          {activeTab === 'parking12' ? (
            <table className="fee-table">
              <thead>
                <tr>
                  <th className="center">구분</th>
                  <th className="center">시간대별</th>
                  <th className="center">주차요금</th>
                  <th className="center">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan="4" className="center">소형</td>
                  <td className="center">최초 10분</td>
                  <td className="center">무료</td>
                  <td rowSpan="4" className="center">
                    24시간 초과<br/>(최초 10분 미만 시 무료)<br/>기본요금 500원
                  </td>
                </tr>
                <tr>
                  <td className="center">30분 이후 ~ 1시간</td>
                  <td className="center">1,000원<br/>(기본 500원 + 추가 500원)</td>
                </tr>
                <tr>
                  <td className="center">1일 최대(10시간 이후)</td>
                  <td className="center">10,000원</td>
                </tr>
                <tr>
                  <td className="center">1일 추가 주차시</td>
                  <td className="center">상기요금 반복 적용</td>
                </tr>
                <tr>
                  <td className="center">대형</td>
                  <td colSpan="3" className="center warning-text">
                    ※ 대형차량은 제2주차장만 주차 가능
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="fee-table">
              <thead>
                <tr>
                  <th className="center">구분</th>
                  <th className="center">시간대별</th>
                  <th className="center">주차요금</th>
                  <th className="center">비고</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan="4" className="center">소형</td>
                  <td className="center">최초 10분</td>
                  <td className="center">무료</td>
                  <td rowSpan="4" className="center">
                    24시간 초과<br/>(최초 10분 미만 시 무료)<br/>기본요금 500원<br/>
                    <span className="warning-text">※ 제3, 4주차장은 제1, 2주차장이<br/>만차일 경우에만 운영</span>
                  </td>
                </tr>
                <tr>
                  <td className="center">30분 이후 ~ 1시간</td>
                  <td className="center">1,000원<br/>(기본 500원 + 추가 500원)</td>
                </tr>
                <tr>
                  <td className="center">1일 최대(6시간 이후)</td>
                  <td className="center">6,000원</td>
                </tr>
                <tr>
                  <td className="center">1일 추가 주차시</td>
                  <td className="center">상기요금 반복 적용</td>
                </tr>
              </tbody>
            </table>
          )}

          <div className="parking-notice">
            <p className="notice-text">
              • {activeTab === 'parking12' ? 
                "매) 승용차는 00월 00일 10시 입차시 입차하시는 시간부터 10시간까지는 시간당 1,000원씩 계산, 10시간이 넘어서서 24시간 까지는 정액으로 10,000원 부과 (24시간 단위로 반복 적용)" :
                "매) 승용차는 00월 00일 10시 입차시 입차하시는 시간부터 6시간까지는 시간당 1,000원씩 계산, 6시간이 넘어서서 24시간 까지는 정액으로 6,000원 부과 (24시간 단위로 반복 적용)"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CJJFeeModal;