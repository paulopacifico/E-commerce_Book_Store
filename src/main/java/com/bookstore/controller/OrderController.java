package com.bookstore.controller;

import com.bookstore.dto.CheckoutRequest;
import com.bookstore.dto.OrderDTO;
import com.bookstore.entity.Order;
import com.bookstore.mapper.OrderMapper;
import com.bookstore.security.UserPrincipal;
import com.bookstore.service.AuditLogger;
import com.bookstore.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;
    private final AuditLogger auditLogger;

    public OrderController(OrderService orderService, OrderMapper orderMapper, AuditLogger auditLogger) {
        this.orderService = orderService;
        this.orderMapper = orderMapper;
        this.auditLogger = auditLogger;
    }

    @Operation(summary = "Checkout", description = "Creates an order from the current cart with the given shipping address.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Order created"),
            @ApiResponse(responseCode = "400", description = "Validation error or empty cart", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(schema = @Schema(hidden = true)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/checkout")
    public ResponseEntity<OrderDTO> checkout(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CheckoutRequest request) {
        Order order = orderService.checkout(principal.getUser(), request.getShippingAddress());
        auditLogger.log("ORDER_CHECKOUT", principal.getUsername(), "ORDER", "SUCCESS", "orderId=" + order.getId());
        return new ResponseEntity<>(orderMapper.toDTO(order), HttpStatus.CREATED);
    }

    @Operation(summary = "List my orders", description = "Returns all orders for the authenticated user.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Success"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(schema = @Schema(hidden = true)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getUserOrders(@AuthenticationPrincipal UserPrincipal principal) {
        List<OrderDTO> orders = orderService.getUserOrders(principal.getUser())
                .stream()
                .map(orderMapper::toDTO)
                .toList();
        return ResponseEntity.ok(orders);
    }

    @Operation(summary = "Get order by ID", description = "Returns a single order by ID. User can only access their own orders.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Success"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "403", description = "Forbidden - not order owner", content = @Content(schema = @Schema(hidden = true))),
            @ApiResponse(responseCode = "404", description = "Order not found", content = @Content(schema = @Schema(hidden = true)))
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long orderId) {
        Order order = orderService.getOrderById(principal.getUser(), orderId);
        return ResponseEntity.ok(orderMapper.toDTO(order));
    }
}
