export const LEVELS = Object.freeze([
  { name: 'FIRST SIGNAL', machines: [
    { id: 'lights', label: 'LIGHTS', broken: 'def lights_on():\n    return "LIGTHS_ON"', fixed: 'def lights_on():\n    return "LIGHTS_ON"', goal: 'Keep the corridor lights online. Return the exact status text LIGHTS_ON.', hint: 'Check the return value spelling. It must be LIGHTS_ON.' },
  ] },
  { name: 'COLD DECK', machines: [
    { id: 'pump', label: 'COOLANT PUMP', broken: 'def pump_ready(temp):\n    return temp > 90', fixed: 'def pump_ready(temp):\n    return temp < 90', goal: 'Protect the cold deck. Return True only when the temperature sensor is below 90.', hint: 'The pump should run below 90 degrees, not above it.' },
    { id: 'airlock', label: 'AIRLOCK', broken: 'def seal_ok(pressure):\n    return pressure == 0', fixed: 'def seal_ok(pressure):\n    return pressure == 14', goal: 'Seal the cabin for launch. Return True when pressure reads exactly 14.', hint: 'A sealed cabin holds pressure at exactly 14.' },
  ] },
  { name: 'LOCKED AIR', machines: [
    { id: 'reactor', label: 'REACTOR', broken: 'def reactor_ok(volts):\n    return volts < 12', fixed: 'def reactor_ok(volts):\n    return volts >= 12', goal: 'Keep the reactor stable. Return True at 12 volts or any higher reading.', hint: 'The reactor is safe at 12 volts or higher.' },
    { id: 'nav', label: 'NAVIGATION', broken: 'def nav_ready(signal):\n    return signal == "LOST"', fixed: 'def nav_ready(signal):\n    return signal == "FOUND"', goal: 'Restore the route finder. Return True only when the signal text is FOUND.', hint: 'Navigation is ready only when the signal is FOUND.' },
    { id: 'gravity', label: 'GRAVITY RING', broken: 'def gravity_ok(mass):\n    return mass == 0', fixed: 'def gravity_ok(mass):\n    return mass > 0', goal: 'Keep crew boots on the deck. Return True when the ring has positive mass.', hint: 'The ring is stable when its mass is greater than zero.' },
  ] },
  { name: 'REACTOR WAKE', machines: [
    { id: 'comms', label: 'COMMS ARRAY', broken: 'def comms_ready(signal):\n    return signal != "CLEAR"', fixed: 'def comms_ready(signal):\n    return signal == "CLEAR"', goal: 'Open a clean channel. Return True only when the signal is CLEAR.', hint: 'The array is ready only when the signal is CLEAR.' },
    { id: 'thermal', label: 'THERMAL VENT', broken: 'def vent_safe(temp):\n    if temp >= 70:\n        return True\n    return False', fixed: 'def vent_safe(temp):\n    if temp < 70:\n        return True\n    return False', goal: 'Prevent a heat warning. Use the if check to return True only below 70.', hint: 'The vent is safe below 70, so reverse the comparison in the if line.' },
    { id: 'cargo', label: 'CARGO LATCH', broken: 'def latch_closed(bolts):\n    return sum(bolts) < 2', fixed: 'def latch_closed(bolts):\n    return sum(bolts) == 2', goal: 'Lock the cargo bay. The two bolt readings must add up to exactly 2.', hint: 'Both bolts together report 2 when the latch is closed.' },
    { id: 'beacon', label: 'DISTRESS BEACON', broken: 'def beacon_ready(power):\n    return power <= 40', fixed: 'def beacon_ready(power):\n    return power > 40', goal: 'Send the rescue signal. Return True only when power is above 40.', hint: 'The beacon needs power greater than 40.' },
  ] },
  { name: 'MERIDIAN CORE', machines: [
    { id: 'oxygen', label: 'OXYGEN MIXER', broken: 'def air_safe(o2):\n    return o2 < 21', fixed: 'def air_safe(o2):\n    return o2 == 21', goal: 'Balance the cabin air. Return True only at exactly 21 percent oxygen.', hint: 'The cabin mix is safe at exactly 21 percent oxygen.' },
    { id: 'shield', label: 'SHIELD GRID', broken: 'def shield_up(nodes):\n    return nodes < 4', fixed: 'def shield_up(nodes):\n    return nodes >= 4', goal: 'Raise the hull shield. Four or more online nodes are required.', hint: 'The shield comes up with four or more nodes online.' },
    { id: 'engine', label: 'ION ENGINE', broken: 'def engine_ready(fuel):\n    return fuel == 0', fixed: 'def engine_ready(fuel):\n    return fuel > 0', goal: 'Wake the ion engine. Return True when the fuel reading is positive.', hint: 'The engine needs a positive fuel reading.' },
    { id: 'signal', label: 'CORE SIGNAL', broken: 'packet = {"code": "MERIDIAN"}\nsignal_lock = packet.get("code") != "MERIDIAN"', fixed: 'packet = {"code": "MERIDIAN"}\nsignal_lock = packet.get("code") == "MERIDIAN"', goal: 'Accept the ship handshake. The packet dictionary must set signal_lock to True for MERIDIAN.', hint: 'Read the packet code and compare it with MERIDIAN.' },
    { id: 'door', label: 'CORE DOOR', broken: 'keys = ["MISSING"]\ndoor_open = "FOUND" not in keys', fixed: 'keys = ["FOUND"]\ndoor_open = "FOUND" in keys', goal: 'Open the core door. The key list must contain FOUND and door_open must be True.', hint: 'The key list needs FOUND, and the membership check should report True.' },
  ] },
]);
