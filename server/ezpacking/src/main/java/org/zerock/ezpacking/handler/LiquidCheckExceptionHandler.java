
package org.zerock.ezpacking.handler;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.zerock.ezpacking.domain.dto.response.ErrorResponse;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class LiquidCheckExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
    List<String> errors = ex.getBindingResult()
            .getAllErrors()
            .stream()
            .map(DefaultMessageSourceResolvable::getDefaultMessage)
            .collect(Collectors.toList());

    ErrorResponse errorResponse = new ErrorResponse(
            "입력값 검증 실패",
            errors
    );

    return ResponseEntity
            .badRequest()
            .body(errorResponse);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGeneralExceptions(Exception ex) {
    ErrorResponse errorResponse = new ErrorResponse(
            "요청 처리 중 오류가 발생했습니다",
            Collections.singletonList(ex.getMessage())
    );

    return ResponseEntity
            .internalServerError()
            .body(errorResponse);
  }
}