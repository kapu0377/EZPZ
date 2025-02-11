package com.example.apiezpz.repository.TodoSearch;

import org.springframework.data.domain.Page;
import org.zerock.api01.dto.PageRequestDTO;
import org.zerock.api01.dto.TodoDTO;

public interface TodoSearch {
  Page<TodoDTO> list(PageRequestDTO pageRequestDTO);
}
