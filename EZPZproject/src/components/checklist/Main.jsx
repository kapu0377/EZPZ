import { useState } from "react";
import Checklist from "./Checklist";
import Category from "./Category";
import "./Main.css";
import Login from "../Login";   //로그인 컴포넌트 추가
import { useAuth } from "../../contexts/AuthContext";  // useAuth 추가
import "../prohibited-items/ProhibitedItems.css";

export default function App() {
    const [selectedChecklist, setSelectedChecklist] = useState(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // 로그인 모달 상태 추가
    const { user } = useAuth();  // 로그인 상태 확인

    const handleOpenLoginModal = () => {
        setIsLoginModalOpen(true); // 로그인 모달 열기
    };

    return (
        <div>
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
                {user ? (
                    <>
                        <Checklist onSelectChecklist={setSelectedChecklist} onRequireLogin={handleOpenLoginModal} />
                        {selectedChecklist && <Category checklist={selectedChecklist} />}
                    </>
                ) : (
                    <button 
                        onClick={handleOpenLoginModal}
                        className="login-required-button"
                        style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            margin: "20px 0"
                        }}
                    >
                        로그인이 필요한 서비스입니다
                    </button>
                )}
            </div>
            <Login isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </div>

    );
}
