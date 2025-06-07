import { FaInstagram, FaXTwitter } from "react-icons/fa6";
import { SiNaver } from "react-icons/si";

const Footer = () => {
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD 형식

  return (
    <footer className="footer">
      <div className="footer-info">
        <div> EZPZ 소개 | 문의사항 | 이용약관 | 개인정보 처리방침 | 이용안내 </div>
        <div>{formattedDate} | 서울시 예제구 | 070-1234-5678 | EZPZ@email.com</div>
        <div>© EZPZ Co.</div>
      </div>
      <div className="footer-social">
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
          <FaInstagram className="social-icon" />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <FaXTwitter className="social-icon" />
        </a>
        <a href="https://blog.naver.com" target="_blank" rel="noopener noreferrer">
          <SiNaver className="social-icon" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
