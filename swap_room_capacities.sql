-- Swap room capacity and exam_capacity values
-- This assumes exam_capacity should be smaller than capacity (regular seating)

-- Step 1: Store capacity temporarily in a temp column if needed, then swap
UPDATE rooms
SET capacity = exam_capacity,
    exam_capacity = capacity;

-- Verify the swap (optional - uncomment to check)
-- SELECT id, room_number, capacity, exam_capacity FROM rooms LIMIT 10;
