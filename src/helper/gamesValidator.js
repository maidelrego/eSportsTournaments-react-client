import validator  from "validator";

export const gamesIsValid = ( games  ) => {
   
  const errorMessages = [];
   
  games.forEach((game, index) => {
    if (!validator.isLength(game.playerName.trim(), { min: 1 })) {
      errorMessages.push(`Name is required for game at index ${index}`);
    }

    if (!validator.isLength(game.team.trim(), { min: 1 })) {
      errorMessages.push(`Team is required for person at index ${index}`);
    }
  });

  return (errorMessages.length == 0) ? true : false ;
};
