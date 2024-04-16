# Chargepoint Simulation

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Findings

### Task 1:

Running the simulation, total energy consumed for the year averages to around 1.2M kWH, Out of a theoretical max power demand, actual max power demand averages ranges around 77-154 kW, with a concurrency factor from 35%-70%. Decreasing the number of chargepoints increases the concurrency factor, while increasing the number decreases the factor.

### Task 2a:

Task 1 is connected to the front end (uses Typescript, React and TailwindCSS) and outputs the same results, with the number of charging events per year/month/week/day included. I've included a mock chart and data for charging values per chargepoint and what an exemplary day could look like.
