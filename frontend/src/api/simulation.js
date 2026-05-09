import api from './axios.js';

export async function listScenarios() {
  const res = await api.get('/simulation/scenarios');
  return res.data.data;
}

export async function runSimulation(scenario) {
  const res = await api.post('/simulation/run', {
    scenario_name: scenario.scenario_name,
    modifications: scenario.modifications
  });
  return res.data.data;
}
