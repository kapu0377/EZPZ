import "./App.css"
import ProhibitedItems from "./components/ProhibitedItems"

function App() {
  return (
    <div className="App">
      <nav>
        {/* 여기에 기존 네비게이션 바의 HTML을 넣으세요 */}
        <ul>
          <li>
            <a href="/">홈</a>
          </li>
          <li>
            <a href="/about">소개</a>
          </li>
          <li>
            <a href="/services">서비스</a>
          </li>
          <li>
            <a href="/contact">연락처</a>
          </li>
        </ul>
      </nav>
      <main>
        <ProhibitedItems />
      </main>
    </div>
  )
}

export default App

