package com.dineflow.order;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class OrderController {

    /** Matches the shape returned by menu-service; extra fields (description etc.) are ignored. */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MenuItemInfo(Long id, String name, BigDecimal price, boolean available) {}

    private final OrderRepository orderRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final String menuServiceBaseUrl;

    public OrderController(OrderRepository orderRepository, @Value("${menu-service.base-url}") String menuServiceBaseUrl) {
        this.orderRepository = orderRepository;
        this.menuServiceBaseUrl = menuServiceBaseUrl;
    }

    // ---------- guest: place an order ----------

    @PostMapping("/api/orders")
    public ResponseEntity<RestaurantOrder> placeOrder(@Valid @RequestBody RestaurantOrder order) {
        if (order.getOrderType() == OrderType.DINE_IN
                && (order.getTableNumber() == null || order.getTableNumber().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Table number is required for dine-in orders");
        }
        if (order.getOrderType() != OrderType.DINE_IN) {
            order.setTableNumber(null);
        }

        List<Long> ids = order.getItems().stream().map(OrderItem::getMenuItemId).distinct().toList();
        Map<Long, MenuItemInfo> menuItems = fetchMenuItems(ids);

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItem item : order.getItems()) {
            MenuItemInfo info = menuItems.get(item.getMenuItemId());
            if (info == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found: " + item.getMenuItemId());
            }
            if (!info.available()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "'" + info.name() + "' is currently unavailable");
            }
            item.setItemName(info.name());
            item.setUnitPrice(info.price());
            item.setLineTotal(info.price().multiply(BigDecimal.valueOf(item.getQuantity())));
            item.setOrder(order);
            total = total.add(item.getLineTotal());
        }
        order.setId(null);
        order.setStatus(OrderStatus.PLACED);
        order.setTotalAmount(total);

        return ResponseEntity.status(HttpStatus.CREATED).body(orderRepository.save(order));
    }

    private Map<Long, MenuItemInfo> fetchMenuItems(List<Long> ids) {
        if (ids.isEmpty()) return Map.of();
        String idsCsv = ids.stream().map(String::valueOf).collect(Collectors.joining(","));
        String url = menuServiceBaseUrl + "/api/internal/menu-items?ids=" + idsCsv;
        try {
            MenuItemInfo[] items = restTemplate.getForObject(url, MenuItemInfo[].class);
            if (items == null) return Map.of();
            return java.util.Arrays.stream(items).collect(Collectors.toMap(MenuItemInfo::id, i -> i));
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not reach menu-service to price the order: " + e.getMessage());
        }
    }

    // ---------- guest: status lookup / history ----------

    @GetMapping("/api/orders/reference/{reference}")
    public RestaurantOrder getByReference(@PathVariable String reference) {
        return orderRepository.findByReference(reference)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No order found with reference: " + reference));
    }

    @GetMapping("/api/orders/history/{phone}")
    public List<RestaurantOrder> history(@PathVariable String phone) {
        return orderRepository.findAllByPhoneOrderByCreatedAtDesc(phone);
    }

    // ---------- admin ----------

    @GetMapping("/api/admin/orders")
    public List<RestaurantOrder> list(@RequestParam(required = false) OrderStatus status) {
        return status == null
                ? orderRepository.findAllByOrderByCreatedAtDesc()
                : orderRepository.findAllByStatusOrderByCreatedAtDesc(status);
    }

    @GetMapping("/api/admin/orders/{id}")
    public RestaurantOrder get(@PathVariable Long id) {
        return findOrder(id);
    }

    @PatchMapping("/api/admin/orders/{id}/status")
    public RestaurantOrder updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        RestaurantOrder order = findOrder(id);
        try {
            order.setStatus(OrderStatus.valueOf(body.get("status")));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status");
        }
        return orderRepository.save(order);
    }

    private RestaurantOrder findOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + id));
    }
}
