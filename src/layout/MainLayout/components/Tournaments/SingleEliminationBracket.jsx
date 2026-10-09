import PropTypes from "prop-types";
import {
  SingleEliminationBracket,
  Match,
  createTheme
} from "@g-loot/react-tournament-brackets";
import { useWindowSize } from "@react-hook/window-size";

export const SingleElimination = ({ simpleSmallBracket, roundTextGenerator }) => {
  const [width] = useWindowSize({ initialWidth: 1024, initialHeight: 768 });
  const compact = width < 768;

  // narrower matches on phones; the bracket scrolls sideways inside its own box
  const style = {
    ...(compact && { width: 300, spaceBetweenColumns: 30, canvasPadding: 12 }),
    ...(roundTextGenerator && { roundHeader: { roundTextGenerator } }),
  };

  return (
    <div className="w-full">
      <SingleEliminationBracket
        theme={GlootTheme}
        matches={simpleSmallBracket}
        options={Object.keys(style).length > 0 ? { style } : undefined}
        matchComponent={Match}
        svgWrapper={({ children }) => (
          <div className="bracket-scroll">{children}</div>
        )}
      />
    </div>
  );
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
  // (round, totalRounds) => header text, e.g. "Wild Card" for playoffs with byes
  roundTextGenerator: PropTypes.func,
};
