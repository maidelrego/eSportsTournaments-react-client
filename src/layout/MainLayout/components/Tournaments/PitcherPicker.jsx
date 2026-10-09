import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { AutoComplete } from "primereact/autocomplete";
import { Avatar } from "primereact/avatar";
import { searchPitchers, mlbHeadshotUrl } from "../../../../services/mlbApi";
import { useTourneyStore } from "../../../../hooks";

// Starting pitcher of one side of a game (MLB The Show). Saves as soon as a pitcher is picked
// (or the typed name is left), so the rotation can be filled in before or after the score.
export const PitcherPicker = ({ gameId, side, disabled }) => {
  const gamesList = useSelector((state) => state.tourney.gamesList);
  const savedName =
    gamesList.find((game) => game.id === gameId)?.[`pitcher${side}Name`] ?? "";

  // Pitchers already used in this tournament, offered first (and when the field is empty).
  const usedPitchers = useMemo(() => {
    const byKey = new Map();
    gamesList.forEach((game) => {
      [1, 2].forEach((pitcherSide) => {
        const name = game[`pitcher${pitcherSide}Name`];
        if (!name) return;
        const id = game[`pitcher${pitcherSide}Id`];
        byKey.set(id ?? name.toLowerCase(), {
          id,
          name,
          team: "Used in this tournament",
          photo: id ? mlbHeadshotUrl(id) : undefined,
        });
      });
    });
    return [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [gamesList]);
  const [text, setText] = useState(savedName);
  const [suggestions, setSuggestions] = useState([]);
  const textRef = useRef(savedName);
  const selectedRef = useRef(false);
  const { startSetGamePitcher } = useTourneyStore();

  useEffect(() => {
    setText(savedName);
    textRef.current = savedName;
  }, [savedName]);

  const updateText = (value) => {
    setText(value);
    textRef.current = value;
  };

  const search = async ({ query }) => {
    const q = query.trim().toLowerCase();
    const used = usedPitchers.filter(
      (pitcher) => !q || pitcher.name.toLowerCase().includes(q)
    );
    try {
      const usedIds = new Set(used.map((pitcher) => pitcher.id).filter(Boolean));
      const found = (await searchPitchers(query)).filter(
        (pitcher) => !usedIds.has(pitcher.id)
      );
      setSuggestions([...used, ...found]);
    } catch (error) {
      console.error("Pitcher search failed", error);
      setSuggestions(used);
    }
  };

  const save = async (name, pitcherId = null) => {
    const clean = name.trim();
    if (clean === savedName) return;
    const ok = await startSetGamePitcher(gameId, side, clean, pitcherId);
    if (!ok) updateText(savedName);
  };

  // Clicking a suggestion blurs the input first, so wait a moment and skip if a pick happened.
  const onBlur = () => {
    setTimeout(() => {
      if (selectedRef.current) {
        selectedRef.current = false;
        return;
      }
      save(textRef.current);
    }, 250);
  };

  const itemTemplate = (pitcher) => (
    <div className="flex align-items-center">
      <Avatar image={pitcher.photo} shape="circle" className="mr-2" />
      <span>{pitcher.name}</span>
      <span className="ml-2 text-500 text-sm">{pitcher.team}</span>
    </div>
  );

  return (
    <AutoComplete
      className="w-full"
      inputClassName="w-full text-sm"
      value={text}
      suggestions={suggestions}
      completeMethod={search}
      field="name"
      dropdown
      disabled={disabled}
      placeholder="Starting pitcher"
      itemTemplate={itemTemplate}
      onFocus={() => {
        selectedRef.current = false;
      }}
      onChange={(e) => {
        if (typeof e.value === "string") {
          selectedRef.current = false;
          updateText(e.value);
        }
      }}
      onSelect={(e) => {
        selectedRef.current = true;
        updateText(e.value.name);
        save(e.value.name, e.value.id);
      }}
      onBlur={onBlur}
    />
  );
};

PitcherPicker.propTypes = {
  gameId: PropTypes.number.isRequired,
  side: PropTypes.oneOf([1, 2]).isRequired,
  disabled: PropTypes.bool,
};
