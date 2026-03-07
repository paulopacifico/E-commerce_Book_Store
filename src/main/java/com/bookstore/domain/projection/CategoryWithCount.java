package com.bookstore.domain.projection;

/**
 * Projection for Category with book count without loading the books collection.
 */
public interface CategoryWithCount {

    Long getId();

    String getName();

    String getDescription();

    long getBookCount();
}
