package com.iting.jobportal.application.controller;

import com.iting.jobportal.application.dto.request.DeclineOfferRequest;
import com.iting.jobportal.application.dto.response.OfferResponse;
import com.iting.jobportal.application.service.OfferService;
import com.iting.jobportal.job.controller.CurrentUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "08.3 Candidate Offer Letter", description = "Candidate-side offer letter access")
@RestController
@RequestMapping("/api/candidates/offers")
@RequiredArgsConstructor
public class CandidateOfferController {

    private final OfferService offerService;

    @GetMapping
    @Operation(summary = "Danh sách offer candidate đang login đã nhận.")
    public ResponseEntity<List<OfferResponse>> listMyOffers(
            @Parameter(hidden = true) @CurrentUser Long candidateAccountId) {
        return ResponseEntity.ok(offerService.listMyOffers(candidateAccountId));
    }

    @GetMapping("/{offerId}")
    @Operation(summary = "Chi tiết 1 offer (chỉ candidate sở hữu).")
    public ResponseEntity<OfferResponse> get(
            @Parameter(hidden = true) @CurrentUser Long candidateAccountId,
            @PathVariable Long offerId) {
        return ResponseEntity.ok(offerService.getById(candidateAccountId, offerId, false));
    }

    @GetMapping("/{offerId}/pdf/view")
    @Operation(summary = "Presigned URL xem PDF (15 phút).")
    public ResponseEntity<Map<String, String>> viewPdf(
            @Parameter(hidden = true) @CurrentUser Long candidateAccountId,
            @PathVariable Long offerId) {
        return ResponseEntity.ok(Map.of("url", offerService.getPdfPresignedUrl(candidateAccountId, offerId, false)));
    }

    @PostMapping("/{offerId}/accept")
    @Operation(summary = "Candidate chấp nhận offer → application tự move pipeline sang HIRED.")
    public ResponseEntity<OfferResponse> accept(
            @Parameter(hidden = true) @CurrentUser Long candidateAccountId,
            @PathVariable Long offerId) {
        return ResponseEntity.ok(offerService.acceptByCandidate(candidateAccountId, offerId));
    }

    @PostMapping("/{offerId}/decline")
    @Operation(summary = "Candidate từ chối offer (có lý do tuỳ chọn).")
    public ResponseEntity<OfferResponse> decline(
            @Parameter(hidden = true) @CurrentUser Long candidateAccountId,
            @PathVariable Long offerId,
            @Valid @RequestBody(required = false) DeclineOfferRequest body) {
        return ResponseEntity.ok(offerService.declineByCandidate(candidateAccountId, offerId, body));
    }
}
