import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminCheck } from "../hooks/useAdminCheck";

const DropDownNav = React.memo(({ label, links }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="nav-item dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link to={links[0].to} className="nav-link">{label}</Link>
      {open && (
        <div className="dropdown-menu">
          {links.map((l, i) => (
            <Link key={i} to={l.to} className="dropdown-item">{l.label}</Link>
          ))}
        </div>
      )}
    </div>
  );
});

const NavLinks = React.memo(() => {
  const { isAdmin, loading } = useAdminCheck();
  
  console.log('NavLinks: isAdmin =', isAdmin, ', loading =', loading);

  return (
    <>
      <DropDownNav
        label="금지물품"
        links={[
          { to: "/prohibited", label: "금지물품 목록" },
          { to: "/airport-detections", label: "공항 별 적발현황" },
          { to: "/search", label: "항공 물품 검색" }
        ]}
      />
      <DropDownNav
        label="게시판"
        links={[
          { to: "/board", label: "자유게시판" },
          { to: "/faq", label: "FAQ" }
        ]}
      />
      <Link to="/checklist" className="nav-link">체크리스트</Link>
      <Link to="/parking" className="nav-link">주차현황</Link>
      {isAdmin && !loading && (
        <Link to="/admin/token-management" className="nav-link" style={{ color: '#ef4444', fontWeight: '600' }}>
          토큰 관리
        </Link>
      )}
    </>
  );
});

export default NavLinks;