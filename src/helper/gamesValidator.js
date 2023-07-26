import validator from "validator";

export const gamesIsValid = (games) => {
  const errorMessages = [];

  games.forEach((game, index) => {
    if (!validator.isLength(game.playerName.trim(), { min: 1 })) {
      errorMessages.push(`Player Name is required for Player at index ${index}`);
    }

    if (!validator.isLength(game.teamName.trim(), { min: 1 })) {
      errorMessages.push(`Team Name is required for Player at index ${index}`);
    }
  });

  return errorMessages.length == 0 ? true : false;
};
