package com.dineflow.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    @Query("""
        select m from MenuItem m
        where (:categoryId is null or m.category.id = :categoryId)
          and (:availableOnly = false or m.available = true)
          and (:search = '' or lower(m.name) like lower(concat('%', :search, '%'))
               or lower(m.description) like lower(concat('%', :search, '%')))
        order by m.category.sortOrder asc, m.name asc
        """)
    List<MenuItem> search(@Param("categoryId") Long categoryId,
                          @Param("availableOnly") boolean availableOnly,
                          @Param("search") String search);

    List<MenuItem> findAllByIdIn(List<Long> ids);
}