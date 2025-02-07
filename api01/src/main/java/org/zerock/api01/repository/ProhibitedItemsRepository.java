package org.zerock.api01.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.api01.domain.Prohibit;

import java.util.List;

public interface ProhibitedItemsRepository extends JpaRepository<Prohibit, Long> {
    List<Prohibit> findByGubun(String Gubun); //Gubun으로 데이터 조회
}
