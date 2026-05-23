-- =====================================================================
-- V103: Dedupe duplicate conversations giữa cùng cặp (user, company).
--
-- Trước: thiếu unique constraint → race condition / FE click nhiều lần
-- tạo nhiều conversation cho cùng cặp participants + type.
--
-- Bước:
--   1) Chọn canonical = conversation có id nhỏ nhất (earliest) cho mỗi
--      (sorted participants, type)
--   2) Move messages về conversation canonical
--   3) Xoá conversation thừa
--   4) Refresh last_message_* trên canonical
--   5) Thêm UNIQUE INDEX ngăn duplicate tương lai
-- =====================================================================

-- ───────────── 1+2. Move messages về canonical conversation ─────────────
WITH normalized AS (
    SELECT id,
           LEAST(participant1_id, participant2_id)    AS p_low,
           GREATEST(participant1_id, participant2_id) AS p_high,
           type
      FROM conversations
),
canonical AS (
    SELECT p_low, p_high, type, MIN(id) AS canonical_id
      FROM normalized
     GROUP BY p_low, p_high, type
)
UPDATE messages m
   SET conversation_id = c.canonical_id
  FROM normalized n
  JOIN canonical c
    ON c.p_low = n.p_low AND c.p_high = n.p_high AND c.type = n.type
 WHERE m.conversation_id = n.id
   AND n.id <> c.canonical_id;

-- ───────────── 3. Xoá duplicate conversations ─────────────
WITH normalized AS (
    SELECT id,
           LEAST(participant1_id, participant2_id)    AS p_low,
           GREATEST(participant1_id, participant2_id) AS p_high,
           type
      FROM conversations
),
canonical AS (
    SELECT p_low, p_high, type, MIN(id) AS canonical_id
      FROM normalized
     GROUP BY p_low, p_high, type
)
DELETE FROM conversations
 WHERE id IN (
     SELECT n.id
       FROM normalized n
       JOIN canonical c
         ON c.p_low = n.p_low AND c.p_high = n.p_high AND c.type = n.type
      WHERE n.id <> c.canonical_id
 );

-- ───────────── 4. Refresh last_message_* trên canonical conversation ─────────────
UPDATE conversations c
   SET last_message_id      = m.id,
       last_message_content = m.content,
       last_message_time    = m.created_at,
       updated_at           = COALESCE(c.updated_at, NOW())
  FROM (
      SELECT DISTINCT ON (conversation_id)
             conversation_id, id, content, created_at
        FROM messages
       ORDER BY conversation_id, created_at DESC
  ) m
 WHERE c.id = m.conversation_id;

-- ───────────── 5. UNIQUE INDEX ngăn duplicate tương lai ─────────────
-- Dùng LEAST/GREATEST để cặp participants được xét order-independent.
CREATE UNIQUE INDEX IF NOT EXISTS uq_conversations_participants_type
    ON conversations (
        LEAST(participant1_id, participant2_id),
        GREATEST(participant1_id, participant2_id),
        type
    );
