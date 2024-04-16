export interface DemandProbability {
  distance: number;
  prob: number;
}

export interface EVArrival {
  hour: number;
  minute: number;
  energyNeeded: number; // in km
  chargingTimeLeft: number; // in minutes
}

export interface ChargePoint {
  id: number;
  currentVehicle: EVArrival | null;
  totalEnergyCharged: number; // in kWh
  totalCarsCharged: number;
  evQueue: EVArrival[];
}

export const initialChargePointValues = {
  currentVehicle: null,
  totalEnergyCharged: 0,
  totalCarsCharged: 0,
  evQueue: [],
};

const baseArrivalProbability = [
  0.0094, 0.0094, 0.0094, 0.0094, 0.0094, 0.0094, 0.0094, 0.0094, 0.0283, 0.0283, 0.0566, 0.0566, 0.0566, 0.0755, 0.0755, 0.0755, 0.1038, 0.1038, 0.1038, 0.0472, 0.0472, 0.0472, 0.0094, 0.0094,
];

const chargingDemandProbability: DemandProbability[] = [
  { distance: 0, prob: 0.3431 },
  { distance: 5, prob: 0.049 },
  { distance: 10, prob: 0.098 },
  { distance: 20, prob: 0.1176 },
  { distance: 30, prob: 0.0882 },
  { distance: 50, prob: 0.1176 },
  { distance: 100, prob: 0.1078 },
  { distance: 200, prob: 0.049 },
  { distance: 300, prob: 0.0294 },
];

const calculateChargingCDF = (distribution: DemandProbability[]): DemandProbability[] => {
  const cdf = [];

  const totalProbability = distribution.reduce((sum, item) => sum + item.prob, 0);

  let cumulativeProb = 0;
  for (let probability of distribution) {
    const { distance, prob } = probability;
    cumulativeProb += prob / totalProbability;
    cdf.push({ distance, prob: cumulativeProb });
  }

  return cdf;
};

const calculateEnergyNeeded = (distance: number, energyNeededPer100Km: number = 18) => {
  const energyConsumptionRate = energyNeededPer100Km / 100; // kWh per km
  return energyConsumptionRate * distance;
};

const calculateChargingTime = (energyNeeded: number, chargingPower: number) => {
  const chargingTimeHours = energyNeeded / chargingPower;
  return Math.ceil(chargingTimeHours * 60);
};

const calculateEnergyChargedPerMinute = (chargingPower: number) => {
  return Math.ceil(chargingPower / 60);
};

export const calculateTimeForInterval = (intervalIndex: number) => {
  const hour = Math.floor((intervalIndex / 4) % 24);
  const minute = (intervalIndex % 4) * 15;

  return { hour, minute };
};

export const runSimulation = async (chargePointPower: number = 11, consumptionPer100Km: number = 18, numberOfDays: number = 365, numberOfChargePoints: number = 20, multiplier: number = 100) => {
  // calculate number of ticks (15-minute intervals)
  const totalTicks = numberOfDays * 24 * 4;

  // initial values for outputs
  const theoreticalMaximumPowerDemand = numberOfChargePoints * chargePointPower;
  let totalEnergyConsumed = 0;
  let actualMaximumPowerDemand = 0;

  // initialize values for chargepoints
  let allChargePoints: ChargePoint[] = Array.from({ length: numberOfChargePoints }, (_, id) => ({
    id,
    ...initialChargePointValues,
  }));

  // generate cumulative distribution of the charging demand
  const chargingDemandCDF = calculateChargingCDF(chargingDemandProbability);

  for (let tickNumber = 0; tickNumber < totalTicks; tickNumber++) {
    // create temp values
    const tempChargePointArray = [];
    let maximumPowerDemand = 0;

    let { hour, minute } = calculateTimeForInterval(tickNumber);

    // for each chargepoint
    for (let chargePointItem of allChargePoints) {
      let { currentVehicle, evQueue, totalEnergyCharged } = chargePointItem;
      let tempChargePoint = { ...chargePointItem, evQueue: [...evQueue] };

      // generate random number to see if arrival happens
      let randomArrivalProb = Math.random();
      const hourProbability = baseArrivalProbability[hour] * (multiplier / 100);

      // if arrival happens
      if (randomArrivalProb <= hourProbability) {
        // generate demand from random number, and calculate charging time and total energy needed
        let randomDemandProb = Math.random();
        const { distance } = chargingDemandCDF.find(({ prob }) => randomDemandProb <= prob) || chargingDemandCDF[chargingDemandCDF.length - 1];
        const energyNeeded = calculateEnergyNeeded(distance, consumptionPer100Km);
        const chargingTimeLeft = calculateChargingTime(energyNeeded, chargePointPower);

        // initialize EV values
        const evArrival: EVArrival = {
          hour,
          minute,
          energyNeeded,
          chargingTimeLeft,
        };

        // if there is no current EV charging, load it at chargepoint. Otherwise, add it to chargepoint queue
        if (currentVehicle === null) {
          tempChargePoint = {
            ...tempChargePoint,
            currentVehicle: evArrival,
          };
        } else {
          const currentQueue = [...evQueue];
          currentQueue.push(evArrival);
          tempChargePoint = {
            ...tempChargePoint,
            evQueue: currentQueue,
          };
        }
      }

      let { currentVehicle: tempCurrentVehicle, evQueue: tempQueue, totalCarsCharged } = tempChargePoint;

      // if there is a current EV charging, calculate total energy charged for the 15-minute interval
      if (tempCurrentVehicle) {
        const { chargingTimeLeft } = tempCurrentVehicle;
        const energyToCharge = calculateEnergyChargedPerMinute(chargePointPower) * (chargingTimeLeft > 15 ? 15 : chargingTimeLeft);
        const tempTotalEnergy = totalEnergyCharged + energyToCharge;

        tempChargePoint = {
          ...tempChargePoint,
          totalEnergyCharged: tempTotalEnergy,
        };

        // if current EV has finished charging, take next car at queue or set to null
        // if not, decrease charging time from current EV
        if (chargingTimeLeft <= 15) {
          tempChargePoint = {
            ...tempChargePoint,
            currentVehicle: null,
            totalCarsCharged: totalCarsCharged + 1,
          };

          if (tempQueue.length > 0) {
            const nextEV = tempQueue.shift();

            tempChargePoint = {
              ...tempChargePoint,
              currentVehicle: nextEV as EVArrival,
              evQueue: tempQueue,
            };
          }
        } else {
          tempCurrentVehicle = {
            ...tempCurrentVehicle,
            chargingTimeLeft: chargingTimeLeft - 15,
          };
          tempChargePoint = {
            ...tempChargePoint,
            currentVehicle: tempCurrentVehicle,
          };
        }

        // add to current maximumPowerDemand and totalEnergyConsumed
        maximumPowerDemand += chargePointPower;
        totalEnergyConsumed += energyToCharge;
      }

      // add modified chargepoint object to temp array
      tempChargePointArray.push(tempChargePoint);
    }

    // replace chargepoints array
    allChargePoints = tempChargePointArray;

    // check if max power demand is higher than before
    if (actualMaximumPowerDemand < maximumPowerDemand) {
      actualMaximumPowerDemand = maximumPowerDemand;
    }
  }

  const concurrencyFactor = Math.floor((actualMaximumPowerDemand / theoreticalMaximumPowerDemand) * 100);
  const chargingEventsNum = allChargePoints.reduce((totalSum, { totalCarsCharged }) => totalSum + totalCarsCharged, 0);

  console.log(`Total Energy Consumed: ${totalEnergyConsumed}kWh`);
  console.log(`Theoretical Maximum Power Demand: ${theoreticalMaximumPowerDemand}kW`);
  console.log(`Actual Maximum Power Demand: ${actualMaximumPowerDemand}kW`);
  console.log(`Concurrency Factor: ${concurrencyFactor}%`);

  return {
    totalEnergyConsumed,
    theoreticalMaximumPowerDemand,
    actualMaximumPowerDemand,
    concurrencyFactor,
    chargingEventsNum,
  };
};
