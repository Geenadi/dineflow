package com.dineflow.order;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findAllByDateOrderByTimeAsc(LocalDate date);
    List<Reservation> findAllByDateAndTimeAndStatusIn(LocalDate date, LocalTime time, List<ReservationStatus> statuses);
}
