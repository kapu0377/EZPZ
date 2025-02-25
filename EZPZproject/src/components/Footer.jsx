import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { SiNaver } from "react-icons/si";

const Footer = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD 형식

  return (
    <footer className="footer">
      <div className="footer-info">
        <div>오늘 날짜: {formattedDate}</div>
        <div>주소: 서울시 예제구</div>
        <div>연락처: 010-1234-5678</div>
      </div>
      <div className="footer-social">
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="social-icon" />
        </a>
        <a href="https://blog.naver.com" target="_blank" rel="noopener noreferrer">
          <SiNaver className="social-icon" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FaXTwitter className="social-icon" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
