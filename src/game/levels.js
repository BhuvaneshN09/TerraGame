const machine = (id, x, y) => ({ id, x: x * 16, y: y * 16, width: 28, height: 20 });

const RAW_LEVELS = Object.freeze([
  {
    name: 'FIRST SIGNAL',
    palette: { void: '#0b1215', floor: '#273639', seam: '#1d292d', hull: '#536368', mint: '#c5dc8b', amber: '#d9a16b' },
    machines: [
      machine('access', 23, 6), machine('battery', 36, 9), machine('faults', 8, 19),
      machine('oxygen', 20, 24), machine('manifest', 39, 17), machine('damage', 27, 32),
    ],
  },
  {
    name: 'COLD DECK',
    palette: { void: '#08131b', floor: '#243946', seam: '#182a35', hull: '#4c6875', mint: '#a9d9d3', amber: '#d5aa74' },
    machines: [
      machine('battery', 47, 30), machine('faults', 51, 32), machine('oxygen', 46, 28),
      machine('manifest', 52, 25), machine('damage', 43, 23), machine('scanner', 49, 33),
    ],
  },
  {
    name: 'LOCKED AIR',
    palette: { void: '#120e1b', floor: '#332b46', seam: '#241d35', hull: '#66587d', mint: '#d4b8ed', amber: '#e0a97d' },
    machines: [
      machine('oxygen', 43, 7), machine('manifest', 37, 19), machine('damage', 45, 22),
      machine('scanner', 47, 6), machine('decoder', 36, 25), machine('commands', 35, 33),
    ],
  },
  {
    name: 'REACTOR WAKE',
    palette: { void: '#17100b', floor: '#40322a', seam: '#2e231f', hull: '#806455', mint: '#e0c58d', amber: '#e39a5b' },
    machines: [
      machine('scanner', 10, 31), machine('decoder', 14, 33), machine('commands', 8, 20),
      machine('computer', 31, 25), machine('damage', 42, 23), machine('manifest', 52, 24),
    ],
  },
  {
    name: 'MERIDIAN CORE',
    palette: { void: '#091915', floor: '#263e3a', seam: '#18302b', hull: '#527a70', mint: '#b8e7b0', amber: '#e1c16d' },
    machines: [
      machine('manifest', 20, 13), machine('damage', 22, 13), machine('scanner', 31, 16),
      machine('decoder', 38, 18), machine('commands', 47, 19), machine('computer', 10, 22),
    ],
  },
]);

// These are the ten small Python programs used by the game. Keeping the
// wording in one place means a machine name and its goal cannot drift apart.
const PROGRAMS = Object.freeze({
  access: {
    label: 'CREW ACCESS SYSTEM', machineName: 'Crew Access System',
    goal: 'Write a program that asks for an access code and prints ACCESS GRANTED if the code is correct, otherwise print ACCESS DENIED.',
    starter: 'code = input("ACCESS CODE: ")\n# check the code and print the result',
    hint: 'Ask for the code, compare it in an if/else branch, and print both required messages.',
  },
  battery: {
    label: 'EMERGENCY BATTERY DRAIN', machineName: 'Emergency Battery Drain',
    goal: 'Write a program that starts with a battery level and repeatedly subtracts the amount of power being used until the battery reaches zero. Print the battery level after each decrease.',
    starter: 'battery = 12\nusage = 3\n# drain the battery until it reaches zero',
    hint: 'Use a loop, subtract usage from battery each time, and print after every decrease.',
  },
  faults: {
    label: 'FAULT DETECTOR', machineName: 'Fault Detector',
    goal: 'Write a program that checks a list of ship sensor readings and prints FAULT DETECTED if any reading is above the safe limit. Otherwise, print ALL SYSTEMS NORMAL.',
    starter: 'readings = [42, 55, 61]\nsafe_limit = 60\n# scan the readings and print the ship report',
    hint: 'Scan the list, compare each reading with safe_limit, and print one of the two report phrases.',
  },
  oxygen: {
    label: 'LIFE-SUPPORT MONITOR', machineName: 'Life-Support Monitor',
    goal: 'Write a program that checks a list of oxygen readings and counts how many sections of the ship are below the safe oxygen level.',
    starter: 'oxygen = [21, 18, 20, 22]\nsafe = 19\ncount = 0\n# count readings below safe',
    hint: 'Keep a counter, loop through oxygen, compare with safe, and print the final count.',
  },
  manifest: {
    label: 'CARGO MANIFEST', machineName: 'Cargo Manifest',
    goal: 'Write a program that stores cargo items and their quantities in a dictionary, asks the user for an item, and prints how many of that item are on the ship.',
    starter: 'cargo = {"water": 8, "medkits": 3, "parts": 12}\nitem = input("ITEM: ")\n# look up and print the quantity',
    hint: 'Store the quantities in cargo, ask for a key with input(), then look it up and print it.',
  },
  damage: {
    label: 'DAMAGE REPORT', machineName: 'Damage Report',
    goal: 'Write a program that receives a list of damaged ship systems and creates a report showing how many times each system appears in the list.',
    starter: 'damaged = ["pump", "relay", "pump", "door"]\nreport = {}\n# count each system in the report',
    hint: 'Loop over damaged and update a count in the report dictionary for each system.',
  },
  scanner: {
    label: 'NAVIGATION SCANNER', machineName: 'Navigation Scanner',
    goal: 'Write a program that checks a list of object distances and finds the closest object that is still a safe distance away from the ship.',
    starter: 'distances = [4, 18, 31, 12]\nsafe_distance = 10\n# find the closest safe distance',
    hint: 'Filter out distances at or below safe_distance, then choose and print the smallest remaining value.',
  },
  decoder: {
    label: 'COMMUNICATIONS DECODER', machineName: 'Communications Decoder',
    goal: 'Write a program that takes an encoded ship transmission and a shift value, then decodes the message by shifting each letter backward.',
    starter: 'encoded = "KHOOR"\nshift = 3\n# build and print the decoded message',
    hint: 'Loop through encoded, shift each letter backward with ord() and chr(), and join the result.',
  },
  commands: {
    label: 'SHIP COMMAND PROCESSOR', machineName: 'Ship Command Processor',
    goal: 'Write a program that repeatedly asks the user for a command. The program must respond to commands such as status, scan, power, and quit, and should continue running until the user enters quit.',
    starter: 'command = input("COMMAND: ")\n# keep handling status, scan, power, and quit',
    hint: 'Use a while loop, ask for input each time, handle the listed commands, and break on quit.',
  },
  computer: {
    label: 'MAIN SHIP COMPUTER', machineName: 'Main Ship Computer',
    goal: 'Write a program that monitors the ship’s power, oxygen level, reactor temperature, damaged systems, and crew status. The program must use this information to decide whether the ship should continue normally, enter emergency mode, or evacuate, then print a full ship status report.',
    starter: 'power = 82\noxygen = 21\ntemperature = 65\ndamaged = []\ncrew = 4\n# choose a ship status and print the report',
    hint: 'Use all five readings with if/elif/else branches, then print NORMAL, EMERGENCY, or EVACUATE in the report.',
  },
});

const LEVEL_PROGRAMS = [
  ['access', 'battery', 'faults', 'oxygen', 'manifest', 'damage'],
  ['battery', 'faults', 'oxygen', 'manifest', 'damage', 'scanner'],
  ['oxygen', 'manifest', 'damage', 'scanner', 'decoder', 'commands'],
  ['scanner', 'decoder', 'commands', 'computer', 'damage', 'manifest'],
  ['manifest', 'damage', 'scanner', 'decoder', 'commands', 'computer'],
];

const normalizeLevel = (level, levelIndex) => ({
  ...level,
  requiredMachines: levelIndex + 1,
  machines: level.machines.map((machine, machineIndex) => {
    const kind = LEVEL_PROGRAMS[levelIndex][machineIndex];
    const program = PROGRAMS[kind];
    return {
      ...machine,
      ...program,
      kind,
      prompt: program.goal,
      text: `${program.machineName} is faulty. Walk up to the unit and press E to write its program.`,
    };
  }),
});

export const LEVELS = Object.freeze(RAW_LEVELS.map(normalizeLevel));
