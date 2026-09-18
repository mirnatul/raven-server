-- CreateTable
CREATE TABLE "schedule" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bookedSlot" INTEGER[],

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);
