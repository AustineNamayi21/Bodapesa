-- BodaPesa — remove demonstration data
--
-- Alternative to the Maintenance screen in the console, for running directly
-- against Postgres (Neon / Vercel query editor / psql).
--
-- Keeps the 3 most recently registered riders and deletes the rest. Most
-- dependent tables declare ON DELETE CASCADE, so removing a rider takes their
-- lesson progress, quiz attempts, messages, enquiries, savings goals,
-- conversations and signals with it. UssdSession is the exception — it
-- references Rider without a cascade — so it is cleared first.
--
-- THIS CANNOT BE UNDONE. Take a snapshot from your database host first.
-- Run the SELECT at the top on its own and check the three names before you
-- run anything below it.

BEGIN;

-- 1. Who survives. Read this before going further.
SELECT id, firstname, lastname, msisdn, issynthetic, createdat
  FROM rider ORDER BY createdat DESC LIMIT 3;

-- 2. Clear the one reference that does not cascade.
DELETE FROM ussdsession
 WHERE riderid IS NOT NULL
   AND riderid NOT IN (SELECT id FROM rider ORDER BY createdat DESC LIMIT 3);

-- 3. Remove the riders. Everything hanging off them goes too.
DELETE FROM rider
 WHERE id NOT IN (SELECT id FROM rider ORDER BY createdat DESC LIMIT 3);

-- 4. The seeded campaigns are not tied to a rider, so they survive step 3.
--    Their sends have just been deleted, which would leave them reporting
--    zero delivery for ever. Comment these two lines out if you would rather
--    keep the campaign rows.
DELETE FROM message WHERE campaignid IS NOT NULL;
DELETE FROM campaign;

-- 5. Confirm nothing was orphaned. Every count here must be 0.
SELECT
  (SELECT count(*) FROM lessonprogress lp WHERE NOT EXISTS (SELECT 1 FROM rider r WHERE r.id = lp.riderid)) AS progress,
  (SELECT count(*) FROM message m        WHERE NOT EXISTS (SELECT 1 FROM rider r WHERE r.id = m.riderid))  AS messages,
  (SELECT count(*) FROM lead l           WHERE NOT EXISTS (SELECT 1 FROM rider r WHERE r.id = l.riderid))  AS leads,
  (SELECT count(*) FROM conversation c   WHERE NOT EXISTS (SELECT 1 FROM rider r WHERE r.id = c.riderid))  AS threads,
  (SELECT count(*) FROM savingsgoal g    WHERE NOT EXISTS (SELECT 1 FROM rider r WHERE r.id = g.riderid))  AS goals,
  (SELECT count(*) FROM ridersignal s    WHERE NOT EXISTS (SELECT 1 FROM rider r WHERE r.id = s.riderid))  AS signals,
  (SELECT count(*) FROM quizattempt q    WHERE NOT EXISTS (SELECT 1 FROM rider r WHERE r.id = q.riderid))  AS quizzes;

-- 6. What is left.
SELECT (SELECT count(*) FROM rider) AS riders,
       (SELECT count(*) FROM message) AS messages,
       (SELECT count(*) FROM lead) AS leads;

-- If step 5 showed anything other than zeros, run ROLLBACK; instead.
COMMIT;
