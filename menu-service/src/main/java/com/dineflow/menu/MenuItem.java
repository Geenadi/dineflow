package com.dineflow.menu;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Doubles as the request AND response body for menu-item endpoints, to avoid a
 * separate DTO class for every shape. categoryId is not persisted directly -
 * it's just how the client tells us which category to attach on create/update;
 * the actual relationship is the `category` field below.
 */
@Entity
@Table(name = "menu_item")
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private boolean available = true;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /** Input-only: which category to attach. Not a DB column. */
    @NotNull(message = "categoryId is required")
    @Transient
    private Long categoryId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    @JsonIgnore
    public Category getCategory() { return category; }
    public void setCategory(Category category) {
        this.category = category;
        this.categoryId = category != null ? category.getId() : null;
    }

    /** Serialized as categoryId in the JSON response, and also read as input on create/update. */
    public Long getCategoryId() {
        return category != null ? category.getId() : categoryId;
    }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    /** Extra convenience field for the frontend so it doesn't need a second lookup. */
    public String getCategoryName() { return category != null ? category.getName() : null; }
}
