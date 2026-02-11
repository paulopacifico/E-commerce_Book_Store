package com.bookstore.repository.projection;

public interface CategoryWithBookCountProjection {

    Long getId();

    String getName();

    String getDescription();

    long getBookCount();
}
