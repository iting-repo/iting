package com.iting.jobportal.userprofile.service.embedding;

import java.util.Optional;

public interface EmbeddingClient {
    Optional<double[]> embed(String input);
}
