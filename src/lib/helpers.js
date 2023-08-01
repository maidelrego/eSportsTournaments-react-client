export const getKnokoutStages = (stageNumber, numberOfRounds) => {
  console.log('stageNumber', stageNumber)
  console.log('numberOfRounds', numberOfRounds)
  let string = ''

  switch (numberOfRounds) {
  case 2:
    string = getSemiFinalsString(stageNumber)
    break;
  case 3:
    string =  getQuarterFinalsString(stageNumber)
    break;
  case 4:
    string = getRoundOf16String(stageNumber)
    break;
  }

  return string
}

const getRoundOf16String = (stageNumber) => {
  switch (stageNumber) {
  case '1':
    return 'Round of 16';
  case '2':
    return 'Quarter-Finals';
  case '3':
    return 'Semi-Finals';
  case '4':
    return 'Finals';
  default:
    return 'Round of 16';
  }
}

const getQuarterFinalsString = (stageNumber) => {
  switch (stageNumber) {
  case '1':
    return 'Quarter-Finals';
  case '2':
    return 'Semi-Finals';
  case '3':
    return 'Finals';
  default:
    return 'Quarter-Finals';
  }
}

const getSemiFinalsString = (stageNumber) => {
  switch (stageNumber) {
  case '1':
    return 'Semi-Finals';
  case '2':
    return 'Finals';
  default:
    return 'Semi-Finals';
  }
}