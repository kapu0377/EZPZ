import { useState } from "react";
import Checklist from "./Checklist";
import Category from "./Category";
import "./Main.css";

export default function App() {
    const [selectedChecklist, setSelectedChecklist] = useState(null);

    return (
        <div>
            {/* 안내 문구 추가 */}
            <p className="checklist-warning">
                🚨 전자담배, 보조배터리, 라이터는 휴대 수화물입니다. 🚨
            </p>
            <p className="checklist-alert">
                소중한 여행을 위해 챙긴 짐을 체크해주세요. 
            </p>
            <div className="container">
                <Checklist onSelectChecklist={setSelectedChecklist} />
                {selectedChecklist && <Category checklist={selectedChecklist} />}
            </div>
        </div>
    );
}
