package com.iting.jobportal.debug;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthContributor;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class StartupDebugProbe {
    private final HealthEndpoint healthEndpoint;

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        HealthComponent healthComponent = healthEndpoint.health();
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("overallStatus", extractStatus(healthComponent));
        data.put("components", flattenComponents(healthComponent));

        // #region agent log
        DebugSessionLogger.log("pre-fix", "H2,H3", "StartupDebugProbe.java:25",
                "ApplicationReadyEvent captured actuator health snapshot", data);
        // #endregion
    }

    private String extractStatus(HealthComponent component) {
        if (component instanceof Health health) {
            return health.getStatus().getCode();
        }
        return component.getClass().getSimpleName();
    }

    private Map<String, Object> flattenComponents(HealthComponent component) {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            Method getComponents = component.getClass().getMethod("getComponents");
            Object components = getComponents.invoke(component);
            if (components instanceof Map<?, ?> componentMap) {
                for (Map.Entry<?, ?> entry : componentMap.entrySet()) {
                    Object child = entry.getValue();
                    String name = String.valueOf(entry.getKey());
                    if (child instanceof HealthComponent childHealthComponent) {
                        result.put(name, extractStatus(childHealthComponent));
                    } else if (child instanceof HealthContributor healthContributor) {
                        result.put(name, healthContributor.getClass().getSimpleName());
                    } else if (child instanceof Collection<?> collection) {
                        result.put(name, "collection[" + collection.size() + "]");
                    } else {
                        result.put(name, child == null ? "null" : child.getClass().getSimpleName());
                    }
                }
            }
        } catch (ReflectiveOperationException ignored) {
            result.put("components", "unavailable");
        }
        return result;
    }
}
