package com.dineflow.menu;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;

@RestController
public class MenuController {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;

    public MenuController(CategoryRepository categoryRepository, MenuItemRepository menuItemRepository) {
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
    }

    // ---------- public: browsing ----------

    @GetMapping("/api/categories")
    public List<Category> listCategories() {
        return categoryRepository.findAll().stream()
                .sorted((a, b) -> a.getSortOrder().compareTo(b.getSortOrder()))
                .toList();
    }

    @GetMapping("/api/menu-items")
    public List<MenuItem> listMenuItems(@RequestParam(required = false) Long categoryId,
                                        @RequestParam(required = false) String search,
                                        @RequestParam(defaultValue = "false") boolean availableOnly) {
        return menuItemRepository.search(categoryId, availableOnly, search == null ? "" : search);
    }

    // ---------- internal: used by order-service to price an order ----------

    @GetMapping("/api/internal/menu-items")
    public List<MenuItem> internalLookup(@RequestParam("ids") String idsCsv) {
        List<Long> ids = Arrays.stream(idsCsv.split(","))
                .filter(s -> !s.isBlank())
                .map(Long::parseLong)
                .toList();
        return menuItemRepository.findAllByIdIn(ids);
    }

    // ---------- admin: categories ----------

    @PostMapping("/api/admin/categories")
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        category.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryRepository.save(category));
    }

    @PutMapping("/api/admin/categories/{id}")
    public Category updateCategory(@PathVariable Long id, @Valid @RequestBody Category updated) {
        Category category = findCategory(id);
        category.setName(updated.getName());
        category.setSortOrder(updated.getSortOrder());
        return categoryRepository.save(category);
    }

    @DeleteMapping("/api/admin/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        findCategory(id);
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- admin: menu items ----------

    @PostMapping("/api/admin/menu-items")
    public ResponseEntity<MenuItem> createMenuItem(@Valid @RequestBody MenuItem item) {
        item.setId(null);
        item.setCategory(findCategory(item.getCategoryId()));
        return ResponseEntity.status(HttpStatus.CREATED).body(menuItemRepository.save(item));
    }

    @PutMapping("/api/admin/menu-items/{id}")
    public MenuItem updateMenuItem(@PathVariable Long id, @Valid @RequestBody MenuItem updated) {
        MenuItem item = findMenuItem(id);
        item.setName(updated.getName());
        item.setDescription(updated.getDescription());
        item.setPrice(updated.getPrice());
        item.setAvailable(updated.isAvailable());
        item.setCategory(findCategory(updated.getCategoryId()));
        return menuItemRepository.save(item);
    }

    @PatchMapping("/api/admin/menu-items/{id}/availability")
    public MenuItem setAvailability(@PathVariable Long id, @RequestBody java.util.Map<String, Boolean> body) {
        MenuItem item = findMenuItem(id);
        item.setAvailable(Boolean.TRUE.equals(body.get("available")));
        return menuItemRepository.save(item);
    }

    @DeleteMapping("/api/admin/menu-items/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        findMenuItem(id);
        menuItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- helpers ----------

    private Category findCategory(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found: " + id));
    }

    private MenuItem findMenuItem(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Menu item not found: " + id));
    }
}