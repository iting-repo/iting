package com.iting.jobportal.userprofile.service.embedding;

import com.iting.jobportal.common.service.MlServiceClient;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Primary
@RequiredArgsConstructor
public class AiMatchingEmbeddingClient implements EmbeddingClient {

    private final MlServiceClient mlServiceClient;

    @Override
    public Optional<double[]> embed(String input) {
        return mlServiceClient.embed(input);
    }
}
