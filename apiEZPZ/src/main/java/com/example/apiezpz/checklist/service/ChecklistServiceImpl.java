package com.example.apiezpz.checklist.service;

import com.example.apiezpz.checklist.domain.Checklist;
import com.example.apiezpz.checklist.dto.ChecklistDTO;
import com.example.apiezpz.checklist.repository.ChecklistRepository;
import com.example.apiezpz.domain.APIUser;
import com.example.apiezpz.repository.APIUserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional  //save 자동 반영
public class ChecklistServiceImpl implements ChecklistService {
    private final ChecklistRepository checklistRepository;
    private final ModelMapper modelMapper;
    private final APIUserRepository apiUserRepository;

    @Override
    public void registerChecklist(Long memberId, ChecklistDTO checklistDTO) {
        Checklist checklist = modelMapper.map(checklistDTO, Checklist.class);
        APIUser member = apiUserRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("해당 회원이 존재하지 않습니다."));
        checklist.setMember(member);

        checklist.setMember(member);
        checklistRepository.save(checklist);
    }

    @Override
    public ChecklistDTO readChecklist(Long id) {
        Optional<Checklist> result = checklistRepository.findById(id);
        Checklist checklist = result.orElseThrow(() -> new RuntimeException("해당 체크리스트 존재하지 않음"));
        return modelMapper.map(checklist, ChecklistDTO.class);
    }

    @Override
    public List<ChecklistDTO> list(Long memberId) {
        List<Checklist> result = checklistRepository.findByMemberId(memberId);

        return result.stream()
                .map(i -> modelMapper.map(i,ChecklistDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public void removeChecklist(Long memberId, Long id) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 체크리스트가 존재하지 않습니다."));
        if (!checklist.getMember().getId().equals(memberId)) {
            throw new RuntimeException("이 체크리스트를 삭제할 권한이 없습니다.");
        }
        checklistRepository.delete(checklist);
    }

    @Override
    public void modifyChecklist(Long memberId, ChecklistDTO checklistDTO) {
        Checklist checklist = checklistRepository.findById(checklistDTO.getId())
                .orElseThrow(() -> new RuntimeException("해당 체크리스트가 존재하지 않습니다."));

        if (!checklist.getMember().getId().equals(memberId)) {
            throw new RuntimeException("이 체크리스트를 수정할 권한이 없습니다.");
        }
        checklist.changeTitle(checklistDTO.getTitle());
        checklist.changeDepartureDate(checklistDTO.getDepartureDate());
        checklist.changeReturnDate(checklistDTO.getReturnDate());
//        checklistRepository.save(checklist);
    }
}
