package com.iting.jobportal.common.lock;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@ConditionalOnBean(RedissonClient.class)
@Slf4j
public class DistributedLockService {

  private static final String PREFIX = "iting:lock:";

  private final RedissonClient redisson;

  /**
   * Run {@code action} only if the lock is acquired within {@code waitMs}, holding it for at most
   * {@code leaseMs}. Throws {@link LockAcquisitionException} on failure to acquire — callers decide
   * retry/fail-fast.
   */
  public <T> T withLock(String key, long waitMs, long leaseMs, Supplier<T> action) {
    RLock lock = redisson.getLock(PREFIX + key);
    boolean acquired = false;
    try {
      acquired = lock.tryLock(waitMs, leaseMs, TimeUnit.MILLISECONDS);
      if (!acquired) {
        throw new LockAcquisitionException("Failed to acquire lock: " + key);
      }
      return action.get();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new LockAcquisitionException("Interrupted while acquiring lock: " + key, e);
    } finally {
      if (acquired && lock.isHeldByCurrentThread()) {
        lock.unlock();
      }
    }
  }

  public void withLock(String key, long waitMs, long leaseMs, Runnable action) {
    withLock(
        key,
        waitMs,
        leaseMs,
        () -> {
          action.run();
          return null;
        });
  }

  public static class LockAcquisitionException extends RuntimeException {
    public LockAcquisitionException(String msg) {
      super(msg);
    }

    public LockAcquisitionException(String msg, Throwable cause) {
      super(msg, cause);
    }
  }
}
