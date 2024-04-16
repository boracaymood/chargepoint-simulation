import React, { useState } from "react";
import Chart from "react-apexcharts";

import "./App.css";
import { runSimulation } from "./task1";

// mock chart data
const options = {
  chart: {
    id: "basic-bar",
  },
  xaxis: {
    categories: ["#1", "#2", "#3", "#4", "#5", "#6", "#7", "#8", "#9", "#10"],
    labels: {
      style: {
        fontSize: "12px",
        colors: "#fff",
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        fontSize: "12px",
        colors: "#fff",
      },
    },
    formatter: (val: number) => {
      return val + "kW";
    },
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => {
      return val + "kW";
    },
    offsetY: -20,
    style: {
      fontSize: "12px",
      colors: ["#fff"],
    },
  },
};

const series = [
  {
    name: "series-1",
    data: [9, 11, 7, 8, 6, 4, 5, 7, 11, 11],
  },
];

const App = () => {
  const [chargePointNum, setChargePointNum] = useState("20");
  const [multiplier, setMultiplier] = useState("100");
  const [energyPer100km, setEnergyPer100km] = useState("18");
  const [chargingPower, setChargingPower] = useState("11");

  const [showOutput, setShowOutput] = useState(false);
  const [totalEnergyConsumedState, setTotalEnergyConsumedState] = useState(0);
  const [theoreticalMaxPowerState, setTheoreticalMaxPowerState] = useState(0);
  const [actualMaxPowerState, setActualMaxPowerState] = useState(0);
  const [concurrencyFactorState, setConcurrencyFactorState] = useState(0);
  const [chargingEventsNumState, setChargingEventsNumState] = useState(0);

  const runSimulationAndShowOutput = () => {
    runSimulation(parseInt(chargingPower), parseInt(energyPer100km), 365, parseInt(chargePointNum), parseInt(multiplier)).then(
      ({ totalEnergyConsumed, theoreticalMaximumPowerDemand, actualMaximumPowerDemand, concurrencyFactor, chargingEventsNum }) => {
        setTotalEnergyConsumedState(totalEnergyConsumed);
        setTheoreticalMaxPowerState(theoreticalMaximumPowerDemand);
        setActualMaxPowerState(actualMaximumPowerDemand);
        setConcurrencyFactorState(concurrencyFactor);
        setChargingEventsNumState(chargingEventsNum);
        setShowOutput(true);
      },
    );
  };

  const resetParameters = () => {
    setShowOutput(false);
  };

  return (
    <div className="m-auto max-w-2xl items-center pb-10 pt-10">
      <div className="w-xl mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Charging Point Simulation</h5>
        <h6 className="font-medium text-gray-700 dark:text-white">Input</h6>
        <br />
        <label htmlFor="chargepoints" className="mb-2 block text-sm font-normal text-gray-900 dark:text-white">
          Number of chargepoints:
        </label>
        <input
          type="number"
          id="chargepoints"
          value={chargePointNum}
          onChange={(e) => setChargePointNum(e.target.value)}
          className="text-black-900 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        />
        <br />
        <label htmlFor="multiplier" className="mb-2 block text-sm font-normal text-gray-900 dark:text-white">
          Multiplier (%):
        </label>
        <input
          type="number"
          id="multiplier"
          value={multiplier}
          onChange={(e) => setMultiplier(e.target.value)}
          className="text-black-900 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        />
        <br />
        <label htmlFor="energyPer100km" className="mb-2 block text-sm font-normal text-gray-900 dark:text-white">
          Energy consumption per 100 Km (kWh):
        </label>
        <input
          type="number"
          id="energyPer100km"
          value={energyPer100km}
          onChange={(e) => setEnergyPer100km(e.target.value)}
          className="text-black-900 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        />
        <br />
        <label htmlFor="chargingPower" className="mb-2 block text-sm font-normal text-gray-900 dark:text-white">
          Charging power per chargepoint (kW):
        </label>
        <input
          type="number"
          id="chargingPower"
          value={chargingPower}
          onChange={(e) => setChargingPower(e.target.value)}
          className="text-black-900 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        />
        <br />
        <button
          onClick={() => runSimulationAndShowOutput()}
          className="focus:shadow-outline mr-5 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
          type="button"
        >
          Simulate
        </button>
        <button onClick={() => resetParameters()} className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none" type="button">
          Reset
        </button>
      </div>
      <br />
      {showOutput ? (
        <div className="w-xl mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow dark:border-gray-700 dark:bg-gray-800">
          <h6 className="font-medium text-gray-700 dark:text-white">Output</h6>
          <ul className="divide-y divide-slate-200 p-6">
            {totalEnergyConsumedState ? (
              <li className="flex py-4">
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white">Total Energy Charged:</p>
                  <p className="text-2xl text-white">{totalEnergyConsumedState} kWh</p>
                </div>
              </li>
            ) : null}
            {theoreticalMaxPowerState ? (
              <li className="flex py-4">
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white">Theoretical Maximum Power Demand:</p>
                  <p className="text-2xl font-medium text-white">{theoreticalMaxPowerState} kW</p>
                </div>
              </li>
            ) : null}
            {actualMaxPowerState ? (
              <li className="flex py-4">
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white">Actual Maximum Power Demand:</p>
                  <p className="text-2xl font-medium text-white">{actualMaxPowerState} kW</p>
                </div>
              </li>
            ) : null}
            {concurrencyFactorState ? (
              <li className="flex py-4">
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white">Concurrency Factor:</p>
                  <p className="text-2xl font-medium text-white">{concurrencyFactorState}%</p>
                </div>
              </li>
            ) : null}
            {chargingEventsNumState ? (
              <li className="flex py-4">
                <div className="overflow-hidden">
                  <p className="mb-2 text-sm font-medium text-white">Charging Events</p>
                  <p className="text-sm font-medium text-white">Per Year:</p>
                  <p className="mb-2 text-2xl font-medium text-white">{chargingEventsNumState} cars charged</p>
                  <p className="text-sm font-medium text-white">Per Month:</p>
                  <p className="mb-2 text-2xl font-medium text-white">{Math.ceil((chargingEventsNumState / 365) * 30)} cars charged</p>
                  <p className="text-sm font-medium text-white">Per Week:</p>
                  <p className="mb-2 text-2xl font-medium text-white">{Math.ceil((chargingEventsNumState / 365) * 7)} cars charged</p>
                  <p className="text-sm font-medium text-white">Per Day:</p>
                  <p className="text-2xl font-medium text-white">{Math.ceil(chargingEventsNumState / 365)} cars charged</p>
                </div>
              </li>
            ) : null}
            <li className="flex py-4">
              <div className="chart">
                <p className="mb-2 text-sm font-medium text-white">Power used each chargepoint</p>
                <Chart options={options} series={series} type="bar" width="500" />
              </div>
            </li>

            <li className="flex py-4">
              <div className="overflow-hidden">
                <p className="mb-2 text-sm font-medium text-white">Exemplary Day</p>
                <p className="text-sm font-medium text-white">September 12</p>
                <p className="mb-2 text-2xl font-medium text-white">{Math.ceil(totalEnergyConsumedState / 7)} kwH consumed</p>
                <p className="mb-2 text-2xl font-medium text-white">{Math.ceil(chargingEventsNumState / 365)} cars charged</p>
                <p className="mb-2 text-2xl font-medium text-white">209 kW highest power demand</p>
                <p className="mb-2 text-2xl font-medium text-white">95% concurrency</p>
              </div>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default App;
