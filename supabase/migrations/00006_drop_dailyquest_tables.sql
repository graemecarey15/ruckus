-- Remove tables accidentally created from DailyQuest migrations.
-- These do not belong to this project.

-- Drop round_quest_staging first (foreign key references rounds)
DROP TABLE IF EXISTS public.round_quest_staging;

-- Drop rounds
DROP TABLE IF EXISTS public.rounds;
