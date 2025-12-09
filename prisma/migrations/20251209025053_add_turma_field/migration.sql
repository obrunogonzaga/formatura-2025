/*
  Warnings:

  - Added the required column `turma` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: Add column as nullable first
ALTER TABLE "Submission" ADD COLUMN "turma" TEXT;

-- Update existing rows with a default value (JII A for existing submissions)
UPDATE "Submission" SET "turma" = 'JII A' WHERE "turma" IS NULL;

-- Make column NOT NULL after updating existing rows
ALTER TABLE "Submission" ALTER COLUMN "turma" SET NOT NULL;
