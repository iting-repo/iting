package com.iting.jobportal.common.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iting.jobportal.common.service.KnowledgeGraphService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

/**
 * In-memory Knowledge Graph implementation.
 * Loads skill ontology and synonyms from JSON files at startup.
 * Uses adjacency list for graph traversal (BFS expansion).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeGraphServiceImpl implements KnowledgeGraphService {

    private final ObjectMapper objectMapper;

    // Node ID -> label (human-readable name)
    private final Map<String, String> nodeLabels = new HashMap<>();

    // Node ID -> type (Language, Framework, Domain, etc.)
    private final Map<String, String> nodeTypes = new HashMap<>();

    // Adjacency list: nodeId -> list of (targetId, relation)
    private final Map<String, List<Edge>> adjacencyList = new HashMap<>();

    // Reverse adjacency: nodeId -> list of (sourceId, relation)
    private final Map<String, List<Edge>> reverseAdjacencyList = new HashMap<>();

    // Synonym -> canonical nodeId
    private final Map<String, String> synonymMap = new HashMap<>();

    // Label (lowercase) -> nodeId (for lookup by label)
    private final Map<String, String> labelToId = new HashMap<>();

    // ─── Location Graph fields ────────────────────────────────────
    // province keyword (lowercase) -> region id ("north", "central", "south")
    private final Map<String, String> provinceToRegion = new HashMap<>();
    // region -> {region -> proximity score [0..1]}
    private final Map<String, Map<String, Double>> regionAdjacency = new HashMap<>();
    private double unknownLocationScore = 0.5;

    private record Edge(String targetId, String relation) {}

    @PostConstruct
    public void init() {
        loadOntology();
        loadSynonyms();
        loadLocationGraph();
        log.info("✅ Knowledge Graph loaded: {} nodes, {} edges, {} synonyms, {} province→region mappings",
                nodeLabels.size(),
                adjacencyList.values().stream().mapToInt(List::size).sum(),
                synonymMap.size(),
                provinceToRegion.size());
    }

    private void loadOntology() {
        try {
            InputStream is = new ClassPathResource("kg/skill_ontology.json").getInputStream();
            JsonNode root = objectMapper.readTree(is);

            // Load nodes
            JsonNode nodes = root.get("nodes");
            if (nodes != null && nodes.isArray()) {
                for (JsonNode node : nodes) {
                    String id = node.get("id").asText();
                    String type = node.get("type").asText();
                    String label = node.get("label").asText();
                    nodeLabels.put(id, label);
                    nodeTypes.put(id, type);
                    labelToId.put(label.toLowerCase(), id);
                    // Also map ID itself as lowercase label
                    labelToId.put(id.toLowerCase(), id);
                }
            }

            // Load edges
            JsonNode edges = root.get("edges");
            if (edges != null && edges.isArray()) {
                for (JsonNode edge : edges) {
                    String from = edge.get("from").asText();
                    String to = edge.get("to").asText();
                    String relation = edge.get("relation").asText();

                    adjacencyList.computeIfAbsent(from, k -> new ArrayList<>()).add(new Edge(to, relation));
                    reverseAdjacencyList.computeIfAbsent(to, k -> new ArrayList<>()).add(new Edge(from, relation));
                }
            }
        } catch (Exception e) {
            log.error("❌ Failed to load skill ontology: {}", e.getMessage());
        }
    }

    private void loadSynonyms() {
        try {
            InputStream is = new ClassPathResource("kg/skill_synonyms.json").getInputStream();
            JsonNode root = objectMapper.readTree(is);
            JsonNode synonyms = root.get("synonyms");
            if (synonyms != null) {
                synonyms.fields().forEachRemaining(entry ->
                    synonymMap.put(entry.getKey().toLowerCase(), entry.getValue().asText())
                );
            }
        } catch (Exception e) {
            log.error("❌ Failed to load skill synonyms: {}", e.getMessage());
        }
    }

    private void loadLocationGraph() {
        try {
            InputStream is = new ClassPathResource("kg/location_graph.json").getInputStream();
            JsonNode root = objectMapper.readTree(is);

            // Load province -> region mapping
            JsonNode regions = root.get("regions");
            if (regions != null && regions.isArray()) {
                for (JsonNode region : regions) {
                    String regionId = region.get("id").asText();
                    JsonNode provinces = region.get("provinces");
                    if (provinces != null && provinces.isArray()) {
                        for (JsonNode p : provinces) {
                            provinceToRegion.put(p.asText().toLowerCase().trim(), regionId);
                        }
                    }
                }
            }

            // Load region adjacency scores
            JsonNode adjacency = root.get("adjacency");
            if (adjacency != null) {
                adjacency.fields().forEachRemaining(outerEntry -> {
                    String fromRegion = outerEntry.getKey();
                    Map<String, Double> innerMap = new HashMap<>();
                    outerEntry.getValue().fields().forEachRemaining(innerEntry ->
                        innerMap.put(innerEntry.getKey(), innerEntry.getValue().asDouble(0.0))
                    );
                    regionAdjacency.put(fromRegion, innerMap);
                });
            }

            // Load unknown location score
            JsonNode unknownNode = root.get("unknown_location_score");
            if (unknownNode != null) {
                unknownLocationScore = unknownNode.asDouble(0.5);
            }

            log.info("✅ Location graph loaded: {} provinces", provinceToRegion.size());
        } catch (Exception e) {
            log.error("❌ Failed to load location graph: {}", e.getMessage());
        }
    }

    @Override
    public double locationScore(String employerLocation, String candidateLocation) {
        if (employerLocation == null || employerLocation.isBlank()) return unknownLocationScore;
        if (candidateLocation == null || candidateLocation.isBlank()) return unknownLocationScore;

        String empLow  = employerLocation.toLowerCase().trim();
        String candLow = candidateLocation.toLowerCase().trim();

        // Check for same-city substring match (e.g. both contain "hà nội")
        for (String provinceKey : provinceToRegion.keySet()) {
            boolean empHas  = empLow.contains(provinceKey);
            boolean candHas = candLow.contains(provinceKey);
            if (empHas && candHas) {
                return 1.0; // same city / province
            }
        }

        // Resolve each location to a region
        String empRegion  = resolveRegion(empLow);
        String candRegion = resolveRegion(candLow);

        if (empRegion == null || candRegion == null) return unknownLocationScore;

        // Look up adjacency score between the two regions
        Map<String, Double> rowMap = regionAdjacency.get(empRegion);
        if (rowMap == null) return unknownLocationScore;

        return rowMap.getOrDefault(candRegion, unknownLocationScore);
    }

    /** Returns the region id that best matches the given lowercased location string. */
    private String resolveRegion(String locationLow) {
        // Direct province match
        for (Map.Entry<String, String> entry : provinceToRegion.entrySet()) {
            if (locationLow.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    @Override
    public String normalize(String rawSkill) {
        if (rawSkill == null || rawSkill.isBlank()) return null;
        String lower = rawSkill.trim().toLowerCase();

        // 1. Check synonym map
        if (synonymMap.containsKey(lower)) {
            return synonymMap.get(lower);
        }

        // 2. Check label-to-id map
        if (labelToId.containsKey(lower)) {
            return labelToId.get(lower);
        }

        // 3. Check if it's already a valid node id
        if (nodeLabels.containsKey(lower)) {
            return lower;
        }

        // 4. Fuzzy: try removing spaces/dashes
        String normalized = lower.replaceAll("[\\s\\-_.]", "");
        for (Map.Entry<String, String> entry : labelToId.entrySet()) {
            String key = entry.getKey().replaceAll("[\\s\\-_.]", "");
            if (key.equals(normalized)) {
                return entry.getValue();
            }
        }

        return null; // Unknown skill
    }

    @Override
    public Set<String> expandKeyword(String keyword) {
        Set<String> result = new LinkedHashSet<>();
        if (keyword == null || keyword.isBlank()) return result;

        result.add(keyword); // Always include original

        // Try to normalize and find in graph
        String nodeId = normalize(keyword);
        if (nodeId == null) {
            // Try tokenizing multi-word keyword
            String[] tokens = keyword.trim().split("\\s+");
            for (String token : tokens) {
                String tokenId = normalize(token);
                if (tokenId != null) {
                    Set<String> related = getRelatedSkills(getLabel(tokenId), 1);
                    result.addAll(related);
                }
            }
            return result;
        }

        // Add the canonical label
        result.add(getLabel(nodeId));

        // Get directly related skills (depth 1)
        Set<String> related = collectNeighborLabels(nodeId, 1);
        result.addAll(related);

        return result;
    }

    @Override
    public Set<String> getRelatedSkills(String skill, int depth) {
        Set<String> result = new LinkedHashSet<>();
        if (skill == null || skill.isBlank()) return result;

        String nodeId = normalize(skill);
        if (nodeId == null) return result;

        result.add(getLabel(nodeId));
        result.addAll(collectNeighborLabels(nodeId, depth));

        return result;
    }

    /**
     * BFS traversal to collect neighbor labels up to given depth.
     */
    private Set<String> collectNeighborLabels(String startId, int maxDepth) {
        Set<String> result = new LinkedHashSet<>();
        Set<String> visited = new HashSet<>();
        Queue<String> currentLevel = new LinkedList<>();

        visited.add(startId);
        currentLevel.add(startId);

        for (int depth = 0; depth < maxDepth && !currentLevel.isEmpty(); depth++) {
            Queue<String> nextLevel = new LinkedList<>();

            while (!currentLevel.isEmpty()) {
                String nodeId = currentLevel.poll();

                // Forward edges (this node -> ?)
                List<Edge> forwardEdges = adjacencyList.getOrDefault(nodeId, List.of());
                for (Edge edge : forwardEdges) {
                    if (!visited.contains(edge.targetId)) {
                        visited.add(edge.targetId);
                        nextLevel.add(edge.targetId);
                        result.add(getLabel(edge.targetId));
                    }
                }

                // Reverse edges (? -> this node)
                List<Edge> reverseEdges = reverseAdjacencyList.getOrDefault(nodeId, List.of());
                for (Edge edge : reverseEdges) {
                    if (!visited.contains(edge.targetId)) {
                        visited.add(edge.targetId);
                        nextLevel.add(edge.targetId);
                        result.add(getLabel(edge.targetId));
                    }
                }
            }

            currentLevel = nextLevel;
        }

        return result;
    }

    @Override
    public List<String> explainMatch(List<String> cvSkills, List<String> jdSkills) {
        List<String> explanations = new ArrayList<>();
        if (cvSkills == null || jdSkills == null) return explanations;

        for (String cvSkill : cvSkills) {
            String cvId = normalize(cvSkill);
            if (cvId == null) continue;

            for (String jdSkill : jdSkills) {
                String jdId = normalize(jdSkill);
                if (jdId == null) continue;

                // Direct match
                if (cvId.equals(jdId)) {
                    explanations.add(String.format("✅ \"%s\" khớp trực tiếp với \"%s\"",
                            cvSkill, jdSkill));
                    continue;
                }

                // Find path (BFS, max depth 3)
                List<String> path = findPath(cvId, jdId, 3);
                if (path != null && !path.isEmpty()) {
                    String pathStr = path.stream()
                            .map(this::getLabel)
                            .collect(Collectors.joining(" → "));
                    explanations.add(String.format("✅ \"%s\" → %s → \"%s\"",
                            cvSkill, pathStr, jdSkill));
                }
            }
        }

        return explanations;
    }

    /**
     * BFS to find shortest path between two nodes.
     */
    private List<String> findPath(String fromId, String toId, int maxDepth) {
        if (fromId.equals(toId)) return List.of(fromId);

        Map<String, String> parent = new HashMap<>();
        Queue<String> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();

        queue.add(fromId);
        visited.add(fromId);

        int depth = 0;
        while (!queue.isEmpty() && depth < maxDepth) {
            int levelSize = queue.size();
            for (int i = 0; i < levelSize; i++) {
                String current = queue.poll();

                List<Edge> neighbors = new ArrayList<>();
                neighbors.addAll(adjacencyList.getOrDefault(current, List.of()));
                neighbors.addAll(reverseAdjacencyList.getOrDefault(current, List.of()));

                for (Edge edge : neighbors) {
                    if (!visited.contains(edge.targetId)) {
                        visited.add(edge.targetId);
                        parent.put(edge.targetId, current);
                        if (edge.targetId.equals(toId)) {
                            // Reconstruct path
                            List<String> path = new ArrayList<>();
                            String node = toId;
                            while (node != null && !node.equals(fromId)) {
                                path.add(node);
                                node = parent.get(node);
                            }
                            Collections.reverse(path);
                            return path.subList(0, Math.min(path.size(), maxDepth));
                        }
                        queue.add(edge.targetId);
                    }
                }
            }
            depth++;
        }

        return null;
    }

    private String getLabel(String nodeId) {
        return nodeLabels.getOrDefault(nodeId, nodeId);
    }
}
