package org.zerock.api01.repository.TodoSearch;

import org.springframework.data.domain.Page;
import org.zerock.api01.dto.PageRequestDTO;
import org.zerock.api01.dto.TodoDTO;

public interface TodoSearch {
  Page<TodoDTO> list(PageRequestDTO pageRequestDTO);
}
