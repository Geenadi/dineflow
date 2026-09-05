package com.dineflow.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<RestaurantOrder, Long> {
    Optional<RestaurantOrder> findByReference(String reference);
    List<RestaurantOrder> findAllByStatusOrderByCreatedAtDesc(OrderStatus status);
    List<RestaurantOrder> findAllByOrderByCreatedAtDesc();
    List<RestaurantOrder> findAllByPhoneOrderByCreatedAtDesc(String phone);
}
