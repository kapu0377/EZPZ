package com.example.apiezpz.checklist.repository;

import com.example.apiezpz.checklist.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
