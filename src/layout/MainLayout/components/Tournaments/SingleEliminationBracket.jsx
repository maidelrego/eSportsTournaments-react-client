import PropTypes from "prop-types";
import {
  SingleEliminationBracket,
  Match,
  SVGViewer,
  createTheme
} from "@g-loot/react-tournament-brackets";
  
  
export const SingleElimination = ({simpleSmallBracket}) =>{
   
  return(
    <>
      <SingleEliminationBracket
        theme={GlootTheme}
        matches={simpleSmallBracket}
        matchComponent={Match}
        svgWrapper={({ children, ...props }) => (
          <SVGViewer
            width={10000}
            height={1000}
            background="rgb(11, 13, 19)"
            SVGBackground="rgb(11, 13, 19)"
            {...props}
          >
            {children}
          </SVGViewer>
        )}
        onMatchClick={(match) => console.log(match)}
        onPartyClick={(match) => console.log(match)}
      />
    </>
  )

};
  
const GlootTheme = createTheme({
  textColor: { main: "#000000", highlighted: "#F4F2FE", dark: "#707582" },
  matchBackground: { wonColor: "#2D2D59", lostColor: "#1B1D2D" },
  score: {
    background: {
      wonColor: `#10131C`,
      lostColor: "#10131C"
    },
    text: { highlightedWonColor: "#7BF59D", highlightedLostColor: "#FB7E94" }
  },
  border: {
    color: "#292B43",
    highlightedColor: "RGBA(152,82,242,0.4)"
  },
  roundHeader: { backgroundColor: "#3B3F73", fontColor: "#F4F2FE" },
  connectorColor: "#3B3F73",
  connectorColorHighlight: "RGBA(152,82,242,0.4)",
  svgBackground: "#0F121C"
});

SingleElimination.propTypes = {
  simpleSmallBracket: PropTypes.array.isRequired,
};
  
// DEMO DATA
// const values = [
//   {
//     "id": 100,
//     "nextMatchId": null,
//     "tournamentRoundText": "2",
//     "startTime": "2023-07-30",
//     "state": "SCHEDULED",
//     "participants": [
//       // {
//       //   "id": 44,
//       //   "resultText": null,
//       //   "isWinner": null,
//       //   "status": 'SCHEDULED',
//       //   "name": "Real Sociedad",
//       //   "picture": "https://media-3.api-sports.io/football/teams/548.png"
//       // },
//     ]
//   },
//   {
//     "id": 99,
//     "nextMatchId": 100,
//     "tournamentRoundText": "1",
//     "startTime": "2023-07-30",
//     "state": "SCORE_DONE",
//     "participants": [
//       {
//         "id": 44,
//         "resultText": '3',
//         "isWinner": false,
//         "status": 'PLAYED',
//         "name": "Real Sociedad",
//         "picture": "https://media-3.api-sports.io/football/teams/548.png"
//       },
//       {
//         "id": 43,
//         "resultText": '1',
//         "isWinner": false,
//         "status": 'PLAYED',
//         "name": "Real Betis",
//         "picture": "https://media-1.api-sports.io/football/teams/543.png"
//       }
//     ]
//   },
//   {
//     "id": 101,
//     "nextMatchId": 100,
//     "tournamentRoundText": "1",
//     "startTime": "2023-07-30",
//     "state": "SCHEDULED",
//     "participants": [
//       {
//         "id": 42,
//         "resultText": null,
//         "isWinner": true,
//         "status": null,
//         "name": "Real Madrid",
//         "picture": "https://media-2.api-sports.io/football/teams/541.png"
//       },
//       {
//         "id": 41,
//         "resultText": null,
//         "isWinner": false,
//         "status": null,
//         "name": "Villarreal",
//         "picture": "https://media-3.api-sports.io/football/teams/533.png"
//       }
//     ]
//   }
// ]