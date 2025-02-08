package org.zerock.api01.service;

import org.springframework.stereotype.Service;
import org.zerock.api01.domain.Prohibit;
import org.zerock.api01.repository.ProhibitedItemsRepository;

import java.util.List;

@Service
public class ProhibitedItemsService {

    private final ProhibitedItemsRepository repository;

    public ProhibitedItemsService(ProhibitedItemsRepository repository) {
        this.repository = repository;
    }

    public List<Prohibit> getAllItems() {
        return repository.findAll();
    }

    public List<Prohibit> getItemsByCategory(String Gubun) {
        return repository.findByGubun(Gubun);
    }
}
