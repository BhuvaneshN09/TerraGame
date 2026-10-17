export const LEVELS = Object.freeze([
  { name: 'FIRST SIGNAL', machines: [
    { id: 'lights', label: 'LIGHTS', broken: 'def lights_on():\n    return "LIGTHS_ON"', fixed: 'def lights_on():\n    return "LIGHTS_ON"', hint: 'Check the return value spelling. It must be LIGHTS_ON.' },
  ] },
  { name: 'COLD DECK', machines: [
    { id: 'pump', label: 'COOLANT PUMP', broken: 'def pump_ready(temp):\n    return temp > 90', fixed: 'def pump_ready(temp):\n    return temp < 90', hint: 'The pump is ready when temperature is below 90.' },
    { id: 'airlock', label: 'AIRLOCK', broken: 'def seal_ok(pressure):\n    return pressure == 0', fixed: 'def seal_ok(pressure):\n    return pressure == 14', hint: 'A sealed cabin holds pressure at 14.' },
  ] },
  { name: 'LOCKED AIR', machines: [
    { id: 'reactor', label: 'REACTOR', broken: 'def reactor_ok(volts):\n    return volts < 12', fixed: 'def reactor_ok(volts):\n    return volts >= 12', hint: 'The reactor is safe at 12 volts or higher.' },
    { id: 'nav', label: 'NAVIGATION', broken: 'def nav_ready(signal):\n    return signal == "LOST"', fixed: 'def nav_ready(signal):\n    return signal == "FOUND"', hint: 'Navigation is ready only when the signal is FOUND.' },
    { id: 'gravity', label: 'GRAVITY RING', broken: 'def gravity_ok(mass):\n    return mass == 0', fixed: 'def gravity_ok(mass):\n    return mass > 0', hint: 'The ring is stable when its mass is greater than zero.' },
  ] },
  { name: 'REACTOR WAKE', machines: [
    { id: 'comms', label: 'COMMS ARRAY', broken: 'def comms_ready(signal):\n    return signal != "CLEAR"', fixed: 'def comms_ready(signal):\n    return signal == "CLEAR"', hint: 'The array is ready only when the signal is CLEAR.' },
    { id: 'thermal', label: 'THERMAL VENT', broken: 'def vent_safe(temp):\n    return temp >= 70', fixed: 'def vent_safe(temp):\n    return temp < 70', hint: 'The vent is safe when temperature is below 70.' },
    { id: 'cargo', label: 'CARGO LATCH', broken: 'def latch_closed(count):\n    return count < 2', fixed: 'def latch_closed(count):\n    return count == 2', hint: 'The latch closes when both bolts report a count of 2.' },
    { id: 'beacon', label: 'DISTRESS BEACON', broken: 'def beacon_ready(power):\n    return power <= 40', fixed: 'def beacon_ready(power):\n    return power > 40', hint: 'The beacon needs power greater than 40.' },
  ] },
  { name: 'MERIDIAN CORE', machines: [
    { id: 'oxygen', label: 'OXYGEN MIXER', broken: 'def air_safe(o2):\n    return o2 < 21', fixed: 'def air_safe(o2):\n    return o2 == 21', hint: 'The cabin mix is safe at exactly 21 percent oxygen.' },
    { id: 'shield', label: 'SHIELD GRID', broken: 'def shield_up(nodes):\n    return nodes < 4', fixed: 'def shield_up(nodes):\n    return nodes >= 4', hint: 'The shield comes up with four or more nodes online.' },
    { id: 'engine', label: 'ION ENGINE', broken: 'def engine_ready(fuel):\n    return fuel == 0', fixed: 'def engine_ready(fuel):\n    return fuel > 0', hint: 'The engine needs a positive fuel reading.' },
    { id: 'signal', label: 'CORE SIGNAL', broken: 'def signal_lock(code):\n    return code != "MERIDIAN"', fixed: 'def signal_lock(code):\n    return code == "MERIDIAN"', hint: 'The core lock accepts the code MERIDIAN.' },
    { id: 'door', label: 'CORE DOOR', broken: 'def door_open(key):\n    return key == "MISSING"', fixed: 'def door_open(key):\n    return key == "FOUND"', hint: 'The core door opens when the key reads FOUND.' },
  ] },
]);
