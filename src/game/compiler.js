const REQUIRED = {
  access: [
    ['input(', 'Ask the user for a code with input().'],
    ['if ', 'Use an if/else decision for the code.'],
    ['ACCESS GRANTED', 'Print ACCESS GRANTED for the valid code.'],
    ['ACCESS DENIED', 'Print ACCESS DENIED for an invalid code.'],
  ],
  battery: [
    ['print(', 'Print the battery after each decrease.'],
    ['battery', 'Use the battery value.'],
    ['-=', 'Subtract power from the battery inside a loop.'],
  ],
  faults: [
    ['readings', 'Scan the readings list.'],
    ['safe_limit', 'Compare readings with safe_limit.'],
    ['FAULT DETECTED', 'Print FAULT DETECTED when a reading is unsafe.'],
    ['ALL SYSTEMS NORMAL', 'Print ALL SYSTEMS NORMAL when every reading is safe.'],
  ],
  oxygen: [
    ['oxygen', 'Scan the oxygen readings.'],
    ['count', 'Keep a counter for unsafe sections.'],
    ['<', 'Compare each reading with the safe level.'],
    ['print(', 'Print the final count.'],
  ],
  manifest: [
    ['cargo', 'Store the cargo in a dictionary.'],
    ['input(', 'Ask which item the crew wants.'],
    ['get(', 'Use a dictionary lookup with get(), or use bracket lookup.'],
  ],
  damage: [
    ['damaged', 'Scan the damaged systems list.'],
    ['report', 'Store counts in a report dictionary.'],
    ['for ', 'Loop over each damaged system.'],
  ],
  scanner: [
    ['distances', 'Scan the object distances.'],
    ['safe_distance', 'Use the safe distance boundary.'],
    ['min(', 'Choose the closest safe object with min().'],
  ],
  decoder: [
    ['encoded', 'Read the encoded transmission.'],
    ['shift', 'Use the supplied shift value.'],
    ['ord(', 'Convert letters with ord() and chr().'],
    ['chr(', 'Build the decoded letters.'],
  ],
  commands: [
    ['while', 'Keep the command processor running in a while loop.'],
    ['input(', 'Ask for a command each loop.'],
    ['status', 'Handle the status command.'],
    ['scan', 'Handle the scan command.'],
    ['power', 'Handle the power command.'],
    ['quit', 'Stop when the crew enters quit.'],
  ],
  reactor: [
    ['power', 'Use the power reading.'],
    ['oxygen', 'Use the oxygen reading.'],
    ['temperature', 'Use the reactor temperature.'],
    ['damaged', 'Use the damaged-system count.'],
    ['crew', 'Use the crew count.'],
    ['NORMAL', 'Print NORMAL for a safe ship.'],
    ['EMERGENCY', 'Print EMERGENCY for a recoverable fault.'],
    ['EVACUATE', 'Print EVACUATE for a critical fault.'],
  ],
  shield: [
    ['nodes', 'Scan the shield node list.'],
    ['True', 'Count online nodes.'],
    ['SHIELD UP', 'Print SHIELD UP when four nodes are online.'],
    ['SHIELD DOWN', 'Print SHIELD DOWN otherwise.'],
  ],
  engine: [
    ['fuel', 'Use the fuel reading.'],
    ['temperature', 'Use the reactor temperature.'],
    ['and', 'Require both engine safety conditions.'],
    ['ENGINE READY', 'Print ENGINE READY when safe.'],
    ['ENGINE HOLD', 'Print ENGINE HOLD otherwise.'],
  ],
  signal: [
    ['packet', 'Read the packet dictionary.'],
    ['MERIDIAN', 'Compare the code with MERIDIAN.'],
    ['LINKED', 'Print LINKED for a matching code.'],
    ['SEARCHING', 'Print SEARCHING otherwise.'],
  ],
  door: [
    ['keys', 'Read the key list.'],
    [' in ', 'Use membership to find FOUND.'],
    ['DOOR OPEN', 'Print DOOR OPEN when the key is present.'],
    ['DOOR LOCKED', 'Print DOOR LOCKED otherwise.'],
  ],
  computer: [
    ['power', 'Use the power reading.'],
    ['oxygen', 'Use the oxygen reading.'],
    ['temperature', 'Use the temperature reading.'],
    ['damaged', 'Use the damage list.'],
    ['crew', 'Use the crew status.'],
    ['NORMAL', 'Include a NORMAL result.'],
    ['EMERGENCY', 'Include an EMERGENCY result.'],
    ['EVACUATE', 'Include an EVACUATE result.'],
  ],
};

function hasToken(source, token) {
  return source.toLowerCase().includes(token.toLowerCase());
}

export function compilePython(source) {
  const code = source.replace(/\r/g, '').trim();
  if (!code) return { ok: false, message: 'The program is empty. Write the first line of the solution.' };
  if (/;/.test(code)) return { ok: false, message: 'Use one Python statement per line instead of semicolons.' };
  for (const [open, close] of [['(', ')'], ['[', ']'], ['{', '}']]) {
    const opens = code.split(open).length - 1;
    const closes = code.split(close).length - 1;
    if (opens !== closes) return { ok: false, message: 'The program has an unmatched bracket.' };
  }
  for (const line of code.split('\n')) {
    if (/^\s+/.test(line) && (line.match(/^\s+/)[0].length % 4 !== 0)) {
      return { ok: false, message: 'Indentation must use groups of four spaces.' };
    }
    if (/^\s*(if|elif|else|for|while|def)\b/.test(line) && !line.trimEnd().endsWith(':')) {
      return { ok: false, message: 'A Python decision or loop line must end with a colon.' };
    }
  }
  return { ok: true, message: 'Python syntax shape accepted.' };
}

export function testPythonChallenge(challenge, source) {
  const compile = compilePython(source);
  if (!compile.ok) return compile;
  const missing = (REQUIRED[challenge.kind] ?? []).find(([token]) => !hasToken(source, token));
  if (missing) return { ok: false, message: 'TEST FAILED. ' + missing[1] };
  if (challenge.kind === 'manifest' && !/get\(|\bcargo\s*\[/.test(source)) return { ok: false, message: 'TEST FAILED. Look up the requested item in the cargo dictionary.' };
  if (challenge.kind === 'battery' && !/(while|for\s+)/.test(source)) return { ok: false, message: 'TEST FAILED. Drain the battery inside a loop.' };
  if (challenge.kind === 'commands' && !/break/.test(source)) return { ok: false, message: 'TEST FAILED. The command loop needs a quit exit.' };
  if ((challenge.kind === 'reactor' || challenge.kind === 'computer') && !/(if|elif)/.test(source)) return { ok: false, message: 'TEST FAILED. Add decision branches for the ship states.' };
  return { ok: true, message: 'COMPILE OK. TESTS PASSED. Program behavior matches the ship goal.' };
}
