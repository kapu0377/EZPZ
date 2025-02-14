import React, { useState } from 'react';
import './ContactModal.css';

const ContactModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('t1');
  
    if (!isOpen) return null;
  
    const contactData = {
      t1: [
        { 
          department: '공항이용안내(Help Desk)', 
          tel: `1577-2600
  해외에서 이용시(82-8-1577-2600)` 
        },
        { department: '의료센터(인하대학교병원)', tel: '032-740-5561~2' },
        { department: '의료센터(인하대학교병원)', tel: '032-740-5561~2' },
        { department: '유실물관리소', tel: '032-741-3110/3114/8991/8992' },
        { department: '자원봉사센터', tel: '032-741-8987' },
        { department: '공항소방대(화재)', tel: '032-741-2119' },
        { department: '도난·범죄 신고', tel: '032-740-0112' },
        { department: '폭발물 신고', tel: '032-741-4000' },
        { department: '테러,침입,탈주 신고', tel: '032-741-4949' },
        { department: '수도고장 신고', tel: '032-741-2460~2' },
        { department: '승강설비고장 신고', tel: '032-741-6931~6' },
        { department: '통신서비스 불편신고(인터넷,전화,TV)', tel: '032-741-7000' },
        { 
          department: '전기고장 신고', 
          tel: `032-741-7514(제1여객터미널)
  032-741-7408(제1교통센터)
  032-741-9168(탑승동)` 
        }
      ],
      t2: [
        { 
          department: '공항이용안내(Help Desk)', 
          tel: `1577-2600
  해외에서 이용시(82-8-1577-2600)` 
        },
        { department: '의료센터(인하대학교병원)', tel: '032-743-7080' },
        { department: '유실물관리소', tel: '032-741-8988/8989' },
        { department: '자원봉사센터', tel: '032-741-8987' },
        { department: '공항소방대(화재)', tel: '032-741-2119' },
        { department: '도난·범죄 신고', tel: '032-740-0112' },
        { department: '폭발물 신고', tel: '032-741-4000' },
        { department: '테러,침입,탈주 신고', tel: '032-741-0202' },
        { department: '수도고장 신고', tel: '032-744-8900~1' },
        { department: '승강설비고장 신고', tel: '032-741-3482' },
        { department: '통신서비스 불편신고(인터넷,전화,TV)', tel: '통신서비스 불편신고(인터넷,전화,TV)' },
        { 
          department: '전기고장 신고', 
          tel: `032-741-7430(제2여객터미널)
  032-741-7440(제2교통센터)` 
        }
      ]
    };
  
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>긴급전화 번호 안내</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="modal-body">
            <div className="terminal-tabs">
              <button 
                className={`tab ${activeTab === 't1' ? 'active' : ''}`}
                onClick={() => setActiveTab('t1')}
              >
                제1 여객터미널
              </button>
              <button 
                className={`tab ${activeTab === 't2' ? 'active' : ''}`}
                onClick={() => setActiveTab('t2')}
              >
                제2 여객터미널
              </button>
            </div>
            <table className="contact-table">
              <thead>
                <tr>
                  <th>구분</th>
                  <th>연락처</th>
                </tr>
              </thead>
              <tbody>
                {contactData[activeTab].map((contact, index) => (
                  <tr key={index}>
                    <td>{contact.department}</td>
                    <td style={{ whiteSpace: 'pre-line' }}>{contact.tel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  export default ContactModal;