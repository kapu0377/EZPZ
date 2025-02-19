import { useState } from "react";
import Checklist from "./Checklist";
import Category from "./Category";
import "./Main.css";

export default function App() {
    const [selectedChecklist, setSelectedChecklist] = useState(null);

    return (
        <div>
            {/* <h1 className="title">여행 체크리스트</h1> */}
            <div className="container">
                <Checklist onSelectChecklist={setSelectedChecklist} />
                {selectedChecklist && <Category checklist={selectedChecklist} />}
            </div>
        </div>
    );
}
