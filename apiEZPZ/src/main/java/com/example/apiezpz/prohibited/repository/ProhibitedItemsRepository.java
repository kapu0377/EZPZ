package com.example.apiezpz.prohibited.repository;

import com.example.apiezpz.prohibited.domain.Prohibit;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;

public interface ProhibitedItemsRepository extends JpaRepository<Prohibit, Long> {
    List<Prohibit> findByGubun(String Gubun); //Gubun으로 데이터 조회
}
