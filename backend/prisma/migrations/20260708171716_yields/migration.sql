-- CreateTable
CREATE TABLE "Yield" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "maturity" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Yield_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "maturity" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "predictedDate" TIMESTAMP(3) NOT NULL,
    "modelType" TEXT NOT NULL,
    "horizon" INTEGER NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Yield_date_idx" ON "Yield"("date");

-- CreateIndex
CREATE INDEX "Yield_maturity_idx" ON "Yield"("maturity");

-- CreateIndex
CREATE UNIQUE INDEX "Yield_date_maturity_key" ON "Yield"("date", "maturity");

-- CreateIndex
CREATE INDEX "Prediction_predictedDate_idx" ON "Prediction"("predictedDate");

-- CreateIndex
CREATE INDEX "Prediction_maturity_idx" ON "Prediction"("maturity");

-- CreateIndex
CREATE INDEX "Prediction_modelType_idx" ON "Prediction"("modelType");

-- CreateIndex
CREATE INDEX "Prediction_horizon_idx" ON "Prediction"("horizon");

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_predictedDate_asOfDate_maturity_modelType_horizo_key" ON "Prediction"("predictedDate", "asOfDate", "maturity", "modelType", "horizon");
