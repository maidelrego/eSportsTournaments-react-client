import PropTypes from "prop-types";
import {
  SingleEliminationBracket,
  Match,
  SVGViewer,
  createTheme
} from "@g-loot/react-tournament-brackets";
import {useWindowSize} from '@react-hook/window-size'
  
export const SingleElimination = ({simpleSmallBracket}) =>{
  const [width, height] = useWindowSize({initialWidth: 400, initialHeight: 400})

  return(
    <>
      <div className="w-full">
        <SingleEliminationBracket
          theme={GlootTheme}
          matches={simpleSmallBracket}
          matchComponent={Match}
          svgWrapper={({ children, ...props }) => (
            <SVGViewer
              width={width}
              height={height}
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
      </div>
      
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
  