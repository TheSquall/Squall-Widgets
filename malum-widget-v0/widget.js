const version = "0.1.0";

/* Constants for Symbols and matching to Rituals
   Order is important here:
   1 is true
   0 is false
   4 | 8 | Lobster | Scale | Dancer
*/
const FIRE_SWORD = "11100",
      ICE_AXE = "10110",
      FROST_WHIP = "10101",
      GIANT_MACE = "10011",
      BONKING_STICK = "01110",
      CLOBBER_HAMMER = "01101",
      LONG_FINGER = "01011",
      FLOWERS = "00111";

// Div IDs for Updating Symbols
const EVIDENCE_NAMES_IN_DOM = [
  "symbol4",
  "symbol8",
  "lobster",
  "scale",
  "dancer",
];

// Constants for displaying evidence on the widget
const EVIDENCE_OFF = 0,
  EVIDENCE_ON = 1,
  EVIDENCE_IMPOSSIBLE = 2,
  EVIDENCE_COMPLETE_IMPOSSIBLE = 3;

/* Number is Order List
   0 Not Used
   1 Top Center
   2 Top Left
   3 Top Right
   4 Bottom Left
   5 Bottom Right
   Book Crystal Egg Gold Potion Skull
*/
const FIRE_SWORD_SOLN = "152403",
      ICE_AXE_SOLN = "325104",
      FROST_WHIP_SOLN = "453102",
      GIANT_MACE_SOLN = "452103",
      BONKING_STICK_SOLN = "453012",
      CLOBBER_HAMMER_SOLN = "052143",
      LONG_FINGER_SOLN = "543012",
      FLOWERS_SOLN = "025143";

// Constants for Ritual Item Names
const RITUAL_ITEMS_IN_DOM = [
  "Book",
  "Crystal",
  "Egg",
  "Gold",
  "Potion",
  "Skull",
];

// Div IDs for Displaying the Ritual Items
const SUMMON_NAMES_IN_DOM = [
  "summon-1",
  "summon-2",
  "summon-3",
  "summon-4",
  "summon-5",
];

/* BEGIN PERMISSION FUNCTIONS */
// Permission levels for commands
const PERMISSION_SQUALL = 0,
  PERMISSION_BROADCASTER = 1,
  PERMISSION_MOD = 2,
  PERMISSION_VIP = 3;

const runCommandWithPermission = (permission, data, command, commandArgs) => {
  if (hasPermission(permission, getUserLevelFromData(data))) {
    command(...commandArgs);
  }
  updateDashboardDOM(userState);
};

const getUserLevelFromData = (data) => {
  let level = 999;
  let badges = data.badges;
  let badgeLevel = 999;

  for (let i = 0; i < badges.length; i++) {
    if (data.displayName.toLowerCase() === "the__squall") {
      badgeLevel = PERMISSION_SQUALL;
    } else if (badges[i].type === "broadcaster") {
      badgeLevel = PERMISSION_BROADCASTER;
    } else if (badges[i].type === "moderator") {
      badgeLevel = PERMISSION_MOD;
    } else if (badges[i].type === "vip") {
      badgeLevel = PERMISSION_VIP;
    }
  }
  level = badgeLevel < level ? badgeLevel : level;
  return level;
};

// If user level is equal to or less than permission level, then they have permission
const hasPermission = (permission, userLevel) => {
  return userLevel <= permission;
};

// For commands where VIP's are allowed to help
const modOrVIPPermission = (configuration) => {
  return configuration.allowVIPS ? PERMISSION_VIP : PERMISSION_MOD;
};
/* END PERMISSION FUNCTIONS */

// TODO: Move all widget and user state to here
let userState = {
  channelName: "",
  conclusionString: "",
  counter: 0,
  evidence: {
    symbol4: EVIDENCE_OFF,
    symbol8: EVIDENCE_OFF,
    lobster: EVIDENCE_OFF,
    scale: EVIDENCE_OFF,
    dancer: EVIDENCE_OFF,
  },
  evidenceDisplay: {
    symbol4: EVIDENCE_OFF,
    symbol8: EVIDENCE_OFF,
    lobster: EVIDENCE_OFF,
    scale: EVIDENCE_OFF,
    dancer: EVIDENCE_OFF,
  },
  ritualItems: {
    ritualItem1: "",
    ritualItem2: "",
    ritualItem3: "",
    ritualItem4: "",
    ritualItem5: "",
    ritualHidden: true,
  },
};
let config = {};

window.addEventListener("onWidgetLoad", function (obj) {
  /* CONFIGURATION OPTIONS */
  
  // Field data from Stream Elements from the overlay settings the user set
  userState.channelName = obj["detail"]["channel"]["username"];
  const fieldData = obj.detail.fieldData;

  // Configures All Usable Widget Commands
  config.commands = {
    [fieldData["resetCommand"]]: (data) => { // Widget Reset
      runCommandWithPermission(modOrVIPPermission(config), data, resetWidget, [
        userState,
      ]);
    },
    [fieldData["4Command"]]: (data) => { // 4 Symbol
      runCommandWithPermission(modOrVIPPermission(config), data, _toggle4, [
        userState,
        config,
      ]);
    },
    [fieldData["8Command"]]: (data) => { // 8 Symbol
      runCommandWithPermission(modOrVIPPermission(config), data, _toggle8, [
        userState,
        config,
      ]);
    },
    [fieldData["lobsterCommand"]]: (data) => { // Lobster Symbol
      runCommandWithPermission(modOrVIPPermission(config), data, _toggleLobster, [
        userState,
        config,
      ]);
    },
    [fieldData["scaleCommand"]]: (data) => { // Scale Symbol
      runCommandWithPermission(modOrVIPPermission(config), data, _toggleScale, [
        userState,
        config,
      ]);
    },
    [fieldData["dancerCommand"]]: (data) => { // Dancer Symbol
      runCommandWithPermission(modOrVIPPermission(config), data, _toggleDancer, [
        userState,
        config,
      ]);
    },
    [fieldData["vipToggleOnCommand"]]: (data) => { // Toggle VIP Availability ON
      runCommandWithPermission(PERMISSION_MOD, data, _toggleVIPAccessibility, [
        true,
      ]);
    },
    [fieldData["vipToggleOffCommand"]]: (data) => { // Toggle VIP Availability OFF
      runCommandWithPermission(PERMISSION_MOD, data, _toggleVIPAccessibility, [
        false,
      ]);
    },
    [fieldData["setCounterNameCommand"]]: (data) => { // Set Widget Counter Name
      runCommandWithPermission(modOrVIPPermission(config), data, _setCounterName, [
        data.text,
      ]);
    },
    [fieldData["setCounterNumberCommand"]]: (data) => { // Set Widget Counter Number
      runCommandWithPermission(modOrVIPPermission(config), data, _setCounterNumber, [
        data.text,
      ]);
    },
    [fieldData["incrementCounterCommand"]]: (data) => { // Increment Counter by 1
      runCommandWithPermission(modOrVIPPermission(config), data, _incrementCounter, [
      ]);
    },
    [fieldData["decrementCounterCommand"]]: (data) => { // Decrement Counter by 1
      runCommandWithPermission(modOrVIPPermission(config), data, _decrementCounter, [
      ]);
    },
    "!thesquall": (data) => { // :-)
      runCommandWithPermission(PERMISSION_SQUALL, data, _theSquall, [
        data.text,
      ]);
    },
  };
  
  // Configures All Usable Rituals
  // Accurate as of 20Jul2021
  config.rituals = [
    { 
      type: "Fire Sword",
      conclusion: createRitualConclusionString(
        fieldData["fireSwordString"],
        "Fire Sword"
      ),
      evidence: FIRE_SWORD,
      solution: FIRE_SWORD_SOLN,
    },
    { 
      type: "Ice Axe",
      conclusion: createRitualConclusionString(
        fieldData["iceAxeString"],
        "Ice Axe"
      ),
      evidence: ICE_AXE,
      solution: ICE_AXE_SOLN,
    },
    { 
      type: "Frost Whip",
      conclusion: createRitualConclusionString(
        fieldData["frostWhipString"],
        "Frost Whip"
      ),
      evidence: FROST_WHIP,
      solution: FROST_WHIP_SOLN,
    },
    { 
      type: "Giant Mace",
      conclusion: createRitualConclusionString(
        fieldData["giantMaceString"],
        "Giant Mace"
      ),
      evidence: GIANT_MACE,
      solution: GIANT_MACE_SOLN,
    },
    { 
      type: "Bonking Stick",
      conclusion: createRitualConclusionString(
        fieldData["bonkingStickString"],
        "Bonking Stick"
      ),
      evidence: BONKING_STICK,
      solution: BONKING_STICK_SOLN,
    },
    { 
      type: "Clobber Hammer",
      conclusion: createRitualConclusionString(
        fieldData["clobberHammerString"],
        "Clobber Hammer"
      ),
      evidence: CLOBBER_HAMMER,
      solution: CLOBBER_HAMMER_SOLN,
    },
    { 
      type: "Long Finger",
      conclusion: createRitualConclusionString(
        fieldData["longFingerString"],
        "Long Finger"
      ),
      evidence: LONG_FINGER,
      solution: LONG_FINGER_SOLN,
    },
    { 
      type: "Flowers",
      conclusion: createRitualConclusionString(
        fieldData["flowersString"],
        "Flowers"
      ),
      evidence: FLOWERS,
      solution: FLOWERS_SOLN,
    },
  ];

  // Options Based on Widget Settings
  config.allowVIPS = fieldData["allowVIPS"] === "yes" ? true : false;
  config.markImpossibleEvidence = fieldData["markImpossibleEvidence"] === "yes" ? true : false;
  config.useEvidenceImpossibleCompleted = fieldData["useEvidenceImpossibleCompleted"] === "yes" ? true : false;
  config.display = {
    title: fieldData["displayTitle"] === "yes" ? true : false,
    evidence: fieldData["displayEvidence"] === "yes" ? true : false,
    counter: fieldData["displayCounter"] === "yes" ? true : false,
    conclusion: fieldData["displayConclusion"] === "yes" ? true : false,
    solution: fieldData["displaySolution"] === "yes" ? true : false,
    solutionAlways: fieldData["showSolutionAlways"] === "yes" ? true : false,
  };
  config.conclusionStrings = {
    zeroEvidenceConclusionString: fieldData["zeroEvidenceConclusionString"]
      ? fieldData["zeroEvidenceConclusionString"]
      : "Waiting for Symbols...",
    oneEvidenceConclusionString: fieldData["oneEvidenceConclusionString"]
      ? fieldData["oneEvidenceConclusionString"]
      : "Not Sure Yet...",
    tooMuchEvidence: fieldData["impossibleConclusionString"]
      ? fieldData["impossibleConclusionString"]
      : "Too Many Symbols",
  };

  /* BORDER CUSTOMIZATION */
  let useGradientBorder = fieldData["useGradientBorder"] === "yes" ? true : false;
  let useAnimatedBorder = fieldData["useAnimatedBorder"] === "yes" ? true : false;

  if (useGradientBorder) {
    $("#malum-dashboard").addClass("animated-box");

    if (useAnimatedBorder) {
      $("#malum-dashboard").addClass("in");
      $("#malum-dashboard").addClass("animated-box-300");
    } else {
      $("#malum-dashboard").addClass("animated-box-100");
    }
  } else {
    $("#malum-dashboard").addClass("malum-border");
  }

  displayItems(config.display);
  resetWidget(userState);
  updateDashboardDOM(userState);
});

window.addEventListener("onEventReceived", function (obj) {
  // Test for Sizing
  if (obj.detail.event.listener === "widget-button") {
    for (let i = 0; i < SUMMON_NAMES_IN_DOM.length; i++) {
      let ritualDom = $(`#${SUMMON_NAMES_IN_DOM[i]}`);
      ritualDom.html(RITUAL_ITEMS_IN_DOM[1]);
    }
    $(`#conclusion-summoning`).removeClass("hidden");
  } else {
    // Grab relevant data from the event;
    let data = obj.detail.event.data;
    // Check if a matching command
    let givenCommand = data.text.split(" ")[0];

    if (config.commands[givenCommand.toLowerCase()]) {
      config.commands[givenCommand.toLowerCase()](data);
    } else {
      console.log("No command exists");
    }
  }
});

/*******************************************************
 *                  COMMAND FUNCTIONS                  *
 *******************************************************/

const resetWidget = (state) => {
  resetEvidence(state.evidence);
  resetEvidence(state.evidenceDisplay);
  resetConclusion(state);
};

const _toggle4 = (state, config) => {
  state.evidence.symbol4 = toggleEvidence(state.evidence.symbol4);
  calculateRitualEvidenceDisplay(state, config);
  determineConclusionMessage(state);
};

const _toggle8 = (state, config) => {
  state.evidence.symbol8 = toggleEvidence(state.evidence.symbol8);
  calculateRitualEvidenceDisplay(state, config);
  determineConclusionMessage(state);
};

const _toggleLobster = (state, config) => {
  state.evidence.lobster = toggleEvidence(state.evidence.lobster);
  calculateRitualEvidenceDisplay(state, config);
  determineConclusionMessage(state);
};

const _toggleScale = (state, config) => {
  state.evidence.scale = toggleEvidence(state.evidence.scale);
  calculateRitualEvidenceDisplay(state, config);
  determineConclusionMessage(state);
};

const _toggleDancer = (state, config) => {
  state.evidence.dancer = toggleEvidence(state.evidence.dancer);
  calculateRitualEvidenceDisplay(state, config);
  determineConclusionMessage(state);
};

const _toggleVIPAccessibility = (canUseVIP) => {
  toggleVIPAccessibility(canUseVIP);
};

const _setCounterName = (command) => {
  commandArgument = command.split(" ").slice(1).join(" ");
  setCounterName(commandArgument);
};

const _setCounterNumber = (command) => {
  commandArgument = command.split(" ").slice(1).join(" ");
  setCounterNumber(commandArgument);
};

const _incrementCounter = () => {
  incrementCounter();
};

const _decrementCounter = () => {
  decrementCounter();
};

const _theSquall = (command) => {
  commandArgument = command.split(" ").slice(1).join(" ");

  if (commandArgument) {
    writeOutVersion(commandArgument);
  } else {
    writeOutVersion(
      `Hello The__Squall!!! Thank you for creating me. I am version ${version} of your widget. I think everyone should check you out at twitch.tv/glitchedmythos. Also ${userState.channelName} is absolutely AMAZING! BAWK BAWK!`
    );
  }
};

/*******************************************************
 *                  DISPLAY FUNCTION                   *
 *******************************************************/

// ESTABLISH WHICH ITEMS ON WIDGET TO SHOW
const displayItems = (config) => {
  if (!config.title) { // Title
    $(`#title`).addClass("hidden");
  }
  if (!config.evidence && !config.counter) { // Evidence + Counter
    $(`#evidence-and-counter-container`).addClass("hidden");
  } else {
    if (!config.evidence) { // Evidence Only
      $(`#evidence-container`).addClass("hidden");
    }
    if (!config.counter) { // Counter Only
      $(`#counter-container`).addClass("hidden");
    }
  }
  if (!config.conclusion && !config.solution) { // Conclusion + Ritual
    $(`#conclusion-container`).addClass("hidden");
  } else {
    if (!config.conclusion) { // Conclusion Only
      $(`#conclusion`).addClass("hidden");
    }
    if (!config.solution) { // Ritual Only
      $(`#conclusion-summoning`).addClass("hidden");
    }
  }
}

/*******************************************************
 *                  RESET FUNCTIONS                    *
 *******************************************************/

const resetEvidence = (evidence) => {
  evidence.symbol4 = EVIDENCE_OFF;
  evidence.symbol8 = EVIDENCE_OFF;
  evidence.lobster = EVIDENCE_OFF;
  evidence.scale = EVIDENCE_OFF;
  evidence.dancer = EVIDENCE_OFF;
};

const resetConclusion = (state) => {
  resetRitual(state);
  state.conclusionString = config.conclusionStrings.zeroEvidenceConclusionString;
  toggleHiddenRitual(true, state);
};

const resetRitual = (state) => {
  state.ritualItems.ritualItem1 = "";
  state.ritualItems.ritualItem2 = "";
  state.ritualItems.ritualItem3 = "";
  state.ritualItems.ritualItem4 = "";
  state.ritualItems.ritualItem5 = "";
  for (let i = 0; i < SUMMON_NAMES_IN_DOM.length; i++) {
    let ritualDom = $(`#${SUMMON_NAMES_IN_DOM[i]}`);
    ritualDom.html("");
  }
}

/*******************************************************
 *           SYMBOL + CONCLUSION FUNCTIONS             *
 *******************************************************/

const calculateRitualEvidenceDisplay = (state, config) => {
  // We do a deep copy to ensure there are no references
  let evidenceDisplay = JSON.parse(JSON.stringify(state.evidence));
  let evidenceString = createEvidenceString(evidenceDisplay);
  let numOfTrueEvidence = numOfTrueEvidenceInString(evidenceString);

  if (numOfTrueEvidence < 2) {
    evidenceDisplay = calculateSingleSymbolEvidence(evidenceDisplay);
  } else if (numOfTrueEvidence === 2) {
    evidenceDisplay = calculateDoubleSymbolEvidence(
      evidenceDisplay,
      evidenceString,
      config
    );
  } else if (numOfTrueEvidence === 3) {
    evidenceDisplay = calculateTripleSymbolEvidence(
      evidenceDisplay,
      evidenceString,
      config
    );
  } else if (numOfTrueEvidence > 3) {
    evidenceDisplay = calculateBadEvidence(evidenceDisplay);
  }
  state.evidenceDisplay = evidenceDisplay;
};

const calculateSingleSymbolEvidence = (evidence) => {
  // Here we need to ensure there is no impossible evidence
  for (let i = 0; i < EVIDENCE_NAMES_IN_DOM; i++) {
    if (evidence[EVIDENCE_NAMES_IN_DOM[i]] !== EVIDENCE_ON) {
      evidence[EVIDENCE_NAMES_IN_DOM[i]] = EVIDENCE_OFF;
    }
  }
  return evidence;
};

const calculateDoubleSymbolEvidence = (evidence, evidenceString, config) => {
  let possibleRitual = getRitualPossibilities(evidenceString);
  let impossibleEvidence = getImpossibleEvidence(possibleRitual);

  if (config.markImpossibleEvidence) {
    // Addition shorthand prior to impossibleEvidence converts the string to a number
    // Symbol-4 | Symbol-8 | Lobster | Scale | Dancer
    if (+impossibleEvidence[0] == 0) {
      evidence.symbol4 = EVIDENCE_IMPOSSIBLE;
    }
    if (+impossibleEvidence[1] == 0) {
      evidence.symbol8 = EVIDENCE_IMPOSSIBLE;
    }
    if (+impossibleEvidence[2] == 0) {
      evidence.lobster = EVIDENCE_IMPOSSIBLE;
    }
    if (+impossibleEvidence[3] == 0) {
      evidence.scale = EVIDENCE_IMPOSSIBLE;
    }
    if (+impossibleEvidence[4] == 0) {
      evidence.dancer = EVIDENCE_IMPOSSIBLE;
    }
  }
  return evidence;
};

const calculateTripleSymbolEvidence = (evidence, evidenceString, config) => {
  let possibleRitual = getRitualPossibilities(evidenceString);

  if (possibleRitual.length === 0) {
    for (const val in evidence) {
      if (evidence[val] === EVIDENCE_ON) {
        evidence[val] = EVIDENCE_IMPOSSIBLE;
      } else {
        evidence[val] = EVIDENCE_OFF;
      }
    }
  } else {
    for (let i = 0; i < EVIDENCE_NAMES_IN_DOM.length; i++) {
      if (
        evidence[EVIDENCE_NAMES_IN_DOM[i]] !== EVIDENCE_ON &&
        config.useEvidenceImpossibleCompleted
      ) {
        evidence[EVIDENCE_NAMES_IN_DOM[i]] = EVIDENCE_COMPLETE_IMPOSSIBLE;
      }
    }
  }
  return evidence;
};

const calculateBadEvidence = (evidence) => {
  for (let i = 0; i < EVIDENCE_NAMES_IN_DOM.length; i++) {
    if (evidence[EVIDENCE_NAMES_IN_DOM[i]] === EVIDENCE_ON) {
      evidence[EVIDENCE_NAMES_IN_DOM[i]] = EVIDENCE_IMPOSSIBLE;
    } else {
      evidence[EVIDENCE_NAMES_IN_DOM[i]] = EVIDENCE_OFF;
    }
  }
  return evidence;
};

const determineConclusionMessage = (state) => {
  let displayEvidenceString = createEvidenceString(state.evidenceDisplay);
  let numOfDisplayTrueEvidence = numOfTrueEvidenceInString(displayEvidenceString);

  let userEvidenceString = createEvidenceString(state.evidence);
  let numberOfUserTrueEvidence = numOfTrueEvidenceInString(userEvidenceString);

  if (numOfDisplayTrueEvidence < 1 && numberOfUserTrueEvidence < 1) {
    state.conclusionString =
      config.conclusionStrings.zeroEvidenceConclusionString;
    toggleHiddenRitual(true, state);
  } else if (numOfDisplayTrueEvidence === 1) {
    state.conclusionString =
      config.conclusionStrings.oneEvidenceConclusionString;
    toggleHiddenRitual(true, state);
  } else if (numOfDisplayTrueEvidence === 2) {
    let ritualPossibilities = getRitualPossibilities(displayEvidenceString);
    let ritualPossibilityStrings = ritualPossibilities.map((ritual) => ritual.type);
    state.conclusionString = `Could be a ` + ritualPossibilityStrings.join(", ") + "?";
    toggleHiddenRitual(true, state);
  } else if (numOfDisplayTrueEvidence === 3) {
    let ritualPossibilities = getRitualPossibilities(displayEvidenceString);
    let ritualPossibilityStrings = ritualPossibilities.map((ritual) => ritual.type);
    if(ritualPossibilityStrings.length === 0) {
      state.conclusionString = config.conclusionStrings.tooMuchEvidence;
      toggleHiddenRitual(true, state);
    } else {
      state.conclusionString = ritualPossibilities[0].conclusion;
      _setRitual(ritualPossibilities[0].solution,state);
      toggleHiddenRitual(false, state);
    }
  } else {
    state.conclusionString = config.conclusionStrings.tooMuchEvidence;
    toggleHiddenRitual(true, state);
  }
};

/*******************************************************
 *                  HELPER FUNCTIONS                   *
 *******************************************************/

const toggleEvidence = (evidence) => {
  if (evidence === EVIDENCE_ON) {
    evidence = EVIDENCE_OFF;
  } else {
    evidence = EVIDENCE_ON;
  }
  return evidence;
};

const toggleVIPAccessibility = (canUseVIP) => {
  if (canUseVIP !== undefined && canUseVIP !== null) {
    config.allowVIPS = canUseVIP;
  } else {
    config.allowVIPS = !config.allowVIPS;
  }
};

const createEvidenceString = (evidence) => {
  let evidenceString = "";

  evidenceString =
    evidence.symbol4 === EVIDENCE_ON
      ? evidenceString + "1"
      : evidenceString + "0";
  evidenceString =
    evidence.symbol8 === EVIDENCE_ON
      ? evidenceString + "1"
      : evidenceString + "0";
  evidenceString =
    evidence.lobster === EVIDENCE_ON
      ? evidenceString + "1"
      : evidenceString + "0";
  evidenceString =
    evidence.scale === EVIDENCE_ON
      ? evidenceString + "1"
      : evidenceString + "0";
  evidenceString =
    evidence.dancer === EVIDENCE_ON
      ? evidenceString + "1"
      : evidenceString + "0";
  return evidenceString;
};

const numOfTrueEvidenceInString = (evidenceString) => {
  let index,
    count = 0;
  for (index = 0; index < evidenceString.length; ++index) {
    count = evidenceString.charAt(index) == "1" ? count + 1 : count;
  }
  return count;
};

const getRitualPossibilities = (evidenceString) => {
  // List of rituals returns [<evidenceString>, <Name>]
  const possibleRituals = [];
  const numOfTrueEvidence = numOfTrueEvidenceInString(evidenceString);

  for (let i = 0; i < config.rituals.length; i++) {
    let evidenceMatch = 0;
    let ritualToCheck = config.rituals[i];

    for (let j = 0; j < evidenceString.length; j++) {
      if (evidenceString.charAt(j) == "1") {
        if (evidenceString.charAt(j) == ritualToCheck.evidence.charAt(j)) {
          evidenceMatch = evidenceMatch + 1;
        }
      }
    }
    if (evidenceMatch == numOfTrueEvidence && evidenceMatch > 1) {
      possibleRituals.push(config.rituals[i]);
    }
  }
  return possibleRituals;
};

const getImpossibleEvidence = (possibleRituals) => {
  let impossibleEvidenceString = "00000"; // If it stays a 0, we know it can't match any of the rituals
  for (let i = 0; i < possibleRituals.length; i++) {
    for (let k = 0; k < impossibleEvidenceString.length; k++) {
      impossibleEvidenceString =
        impossibleEvidenceString.substr(0, k) +
        `${+impossibleEvidenceString[k] + +possibleRituals[i].evidence[k]}` +
        impossibleEvidenceString.substr(k + 1);
      impossibleEvidenceString[k] = `${
        +impossibleEvidenceString[k] + +possibleRituals[i].evidence[k]
      }`; // possibleRituals[ritual][ritual evidence string][position in evidence string]
    }
  }
  return impossibleEvidenceString;
};

const createRitualConclusionString = (conclusionString, ritualType) => {
  return conclusionString ? conclusionString : `Use the ${ritualType} Ritual!!`;
};

const _setRitual = (ritual, state) => {
  for (let i = 0; i < RITUAL_ITEMS_IN_DOM.length; i++) {
    let char = Number(ritual.charAt([i]));
    if (char>0) {
      let ritualDom = $(`#${SUMMON_NAMES_IN_DOM[char-1]}`);
      ritualDom.html(RITUAL_ITEMS_IN_DOM[i]);
    }
  }
}

/*******************************************************
 *             DOM MANIPULATING FUNCTIONS              *
 *******************************************************/

const updateDashboardDOM = (state) => {
  updateEvidenceDOM(state.evidenceDisplay);
  updateConclusion(state.conclusionString);
};

/** EVIDENCE RELATED DOM MANIPULATING FUNCTIONS */
const updateEvidenceDOM = (evidence) => {
  resetEvidenceDOM();
  for (let i = 0; i < EVIDENCE_NAMES_IN_DOM.length; i++) {
    let evidenceDom = $(`#${EVIDENCE_NAMES_IN_DOM[i]}-svg`);
    switch (evidence[EVIDENCE_NAMES_IN_DOM[i]]) {
      case EVIDENCE_ON:
        evidenceDom.addClass("active");
        break;
      case EVIDENCE_IMPOSSIBLE:
        evidenceDom.addClass("impossible");
        break;
      case EVIDENCE_COMPLETE_IMPOSSIBLE:
        evidenceDom.addClass("impossible-completed");
        break;
      case EVIDENCE_OFF:
      default:
        evidenceDom.addClass("inactive");
        break;
    }
  }
};

const resetEvidenceDOM = () => {
  for (let i = 0; i < EVIDENCE_NAMES_IN_DOM.length; i++) {
    $(`#${EVIDENCE_NAMES_IN_DOM[i]}-svg`).removeClass([
      "active",
      "inactive",
      "impossible",
      "impossible-completed",
    ]);
  }
};

const toggleHiddenRitual = (toggle, state) => {
  if (toggle) {
    state.ritualItems.ritualHidden = toggle;
  } else {
    state.ritualItems.ritualHidden = !state.ritualItems.ritualHidden;
  }
  if (config.display.solution) {
    if (!config.display.solutionAlways) {
      if (state.ritualItems.ritualHidden) {
        $(`#conclusion-summoning`).addClass("hidden");
      } else {
        $(`#conclusion-summoning`).removeClass("hidden");
      }
    }
  }
}

/** CONCLUSION RELATED DOM MANIPULATING FUNCTIONS */
const updateConclusion = (conclusion) => {
  $("#conclusion").html(conclusion);
};

/** COUNTER RELATED DOM MANIPULATING FUNCTIONS */
const setCounterName = (name) => {
  $("#counter-name").html(name);
};

const setCounterNumber = (number) => {
  let num = parseInt(number);

  if (Number.isInteger(num)) {
    $("#counter-number").text("" + num);
  }
};

const incrementCounter = (num) => {
  let counter = $("#counter-number");
  counter.text(parseInt(counter.text()) + (num ? num : 1));
};

const decrementCounter = (num) => {
  let counter = $("#counter-number");
  counter.text(parseInt(counter.text()) - (num ? num : 1));
};

/* Special */
let speed = 100;
let cursorSpeed = 400;
let time = 0;
let prevTime = 200;

const writeMessage = (word) => {
  for (let c in word.split("")) {
    time = Math.floor(Math.random() * speed);

    setTimeout(() => {
      $("#text").before(word[c]);
    }, prevTime + time);

    prevTime += time;
  }

  return prevTime;
};

const writeOutVersion = (command) => {
  $("#version").addClass("show-version-item");
  setTimeout(() => {
    let time = writeMessage(command);
    setTimeout(() => {
      $("#version").removeClass("show-version-item");
      prevTime = 0;
      time = 0;
      setTimeout(() => {
        $("#console-container").empty();
        $("#console-container").append($(`<span class="prompt">>  </span>`));
        $("#console-container").append($(`<div id="text"></div>`));
        $("#console-container").append($(`<div class="cursor"></div>`));
      }, 2000);
    }, time + 2000);
  }, 1000);
};
