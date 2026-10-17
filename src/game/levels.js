export const LEVELS = Object.freeze([
  { name: 'FIRST SIGNAL', machines: [{ id: 'lights', label: 'LIGHTS', broken: 'def lights_on():\n    return "LIGTHS_ON"', fixed: 'def lights_on():\n    return "LIGHTS_ON"' }] },
  { name: 'COLD DECK', machines: [
    { id: 'lights', label: 'LIGHTS', broken: 'def lights_on():\n    return "LIGTHS_ON"', fixed: 'def lights_on():\n    return "LIGHTS_ON"' },
    { id: 'pump', label: 'COOLANT PUMP', broken: 'def pump_ready(temp):\n    return temp > 90', fixed: 'def pump_ready(temp):\n    return temp < 90' },
  ] },
  { name: 'LOCKED AIR', machines: [
    { id: 'lights', label: 'LIGHTS', broken: 'def lights_on():\n    return "LIGTHS_ON"', fixed: 'def lights_on():\n    return "LIGHTS_ON"' },
    { id: 'pump', label: 'COOLANT PUMP', broken: 'def pump_ready(temp):\n    return temp > 90', fixed: 'def pump_ready(temp):\n    return temp < 90' },
    { id: 'airlock', label: 'AIRLOCK', broken: 'def seal_ok(pressure):\n    return pressure == 0', fixed: 'def seal_ok(pressure):\n    return pressure == 14' },
  ] },
  { name: 'REACTOR WAKE', machines: [
    { id: 'lights', label: 'LIGHTS', broken: 'def lights_on():\n    return "LIGTHS_ON"', fixed: 'def lights_on():\n    return "LIGHTS_ON"' },
    { id: 'pump', label: 'COOLANT PUMP', broken: 'def pump_ready(temp):\n    return temp > 90', fixed: 'def pump_ready(temp):\n    return temp < 90' },
    { id: 'airlock', label: 'AIRLOCK', broken: 'def seal_ok(pressure):\n    return pressure == 0', fixed: 'def seal_ok(pressure):\n    return pressure == 14' },
    { id: 'reactor', label: 'REACTOR', broken: 'def reactor_ok(volts):\n    return volts < 12', fixed: 'def reactor_ok(volts):\n    return volts >= 12' },
  ] },
  { name: 'MERIDIAN CORE', machines: [
    { id: 'lights', label: 'LIGHTS', broken: 'def lights_on():\n    return "LIGTHS_ON"', fixed: 'def lights_on():\n    return "LIGHTS_ON"' },
    { id: 'pump', label: 'COOLANT PUMP', broken: 'def pump_ready(temp):\n    return temp > 90', fixed: 'def pump_ready(temp):\n    return temp < 90' },
    { id: 'airlock', label: 'AIRLOCK', broken: 'def seal_ok(pressure):\n    return pressure == 0', fixed: 'def seal_ok(pressure):\n    return pressure == 14' },
    { id: 'reactor', label: 'REACTOR', broken: 'def reactor_ok(volts):\n    return volts < 12', fixed: 'def reactor_ok(volts):\n    return volts >= 12' },
    { id: 'nav', label: 'NAVIGATION', broken: 'def nav_ready(signal):\n    return signal == "LOST"', fixed: 'def nav_ready(signal):\n    return signal == "FOUND"' },
  ] },
]);
