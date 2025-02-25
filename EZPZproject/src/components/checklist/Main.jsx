import { useState } from "react";
import Checklist from "./Checklist";
import Category from "./Category";
import "./Main.css";
import Login from "../Login";   //로그인 컴포넌트 추가

export default function App() {
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // 로그인 모달 상태 추가

    const handleOpenLoginModal = () => {
        alert("로그인이 필요한 서비스입니다.\n로그인 후 다시 이용해주세요."); // 알림창 표시
        setIsLoginModalOpen(true); // 로그인 모달 열기
    };

    const handleChecklistUpdate = (updatedChecklist) => {
        setSelectedChecklist(updatedChecklist);
    };

    return (
        <div className="checklist-main-container">
            <div className="description-section2">
                <h1>여행 체크리스트</h1>
                <p className="checklist-alert">
                    소중한 여행을 위해 여러분이 챙긴 짐을 체크해주세요!
                </p>
            </div >

            {/* 안내 문구 추가 */}
            <p className="checklist-warning">
                🚨 전자담배, 보조배터리, 라이터는 휴대 수화물입니다. 🚨
            </p>

            <div className={`container ${!selectedChecklist ? "centered" : ""}`}>
                <Checklist onSelectChecklist={setSelectedChecklist} onRequireLogin={handleOpenLoginModal} onUpdateChecklist={handleChecklistUpdate} />
                {selectedChecklist && <Category checklist={selectedChecklist} />}
            </div>
            <Login isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>

    );
}
