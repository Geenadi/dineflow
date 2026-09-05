package com.dineflow.order;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class ReservationController {

    /** A simple fixed pool of tables - good enough for this prototype (see README). */
    private static final List<Integer> TABLE_NUMBERS = List.of(1, 2, 3, 4, 5, 6, 7, 8);
    private static final List<ReservationStatus> ACTIVE = List.of(ReservationStatus.PENDING, ReservationStatus.CONFIRMED);

    private final ReservationRepository reservationRepository;

    public ReservationController(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    // ---------- guest: book ----------

    @PostMapping("/api/reservations")
    public ResponseEntity<Reservation> book(@Valid @RequestBody Reservation reservation) {
        Set<Integer> taken = reservationRepository
                .findAllByDateAndTimeAndStatusIn(reservation.getDate(), reservation.getTime(), ACTIVE)
                .stream().map(Reservation::getTableNumber).collect(Collectors.toSet());

        Integer freeTable = TABLE_NUMBERS.stream().filter(n -> !taken.contains(n)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                        "Sorry, no table is free for " + reservation.getPartySize() + " people at "
                                + reservation.getTime() + " on " + reservation.getDate()));

        reservation.setId(null);
        reservation.setTableNumber(freeTable);
        reservation.setStatus(ReservationStatus.PENDING);
        return ResponseEntity.status(HttpStatus.CREATED).body(reservationRepository.save(reservation));
    }

    // ---------- admin ----------

    @GetMapping("/api/admin/reservations")
    public List<Reservation> byDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return reservationRepository.findAllByDateOrderByTimeAsc(date);
    }

    @PatchMapping("/api/admin/reservations/{id}/status")
    public Reservation updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found: " + id));
        try {
            reservation.setStatus(ReservationStatus.valueOf(body.get("status")));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }
        return reservationRepository.save(reservation);
    }
}
