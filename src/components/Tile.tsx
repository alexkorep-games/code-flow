// src/components/Tile.tsx
import React from "react";
import { Pressable } from "react-native";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import { TileState } from "../types/types";

interface TileProps {
  tileData: TileState;
  size: number;
  onPress: () => void;
  isSolved: boolean; // To disable press when solved
}

const STROKE_WIDTH_FACTOR = 0.18; // Relative to tile size
const END_CAP_OFFSET_FACTOR = 0.08; // How far from edge lines stop
const MARKER_RADIUS_FACTOR = 0.15; // Relative to tile size

const Tile: React.FC<TileProps> = ({ tileData, size, onPress, isSolved }) => {
  const { type, rotation, locked, special } = tileData;

  const strokeWidth = size * STROKE_WIDTH_FACTOR;
  const halfSize = size / 2;
  const endOffset = size * END_CAP_OFFSET_FACTOR;
  const markerRadius = size * MARKER_RADIUS_FACTOR;

  const strokeColor = locked ? "#888" : "#3498db"; // Gray for locked, blue for interactive
  const startColor = "green";
  const endColor = "red";

  const renderPipe = () => {
    switch (type) {
      case "straight":
        return (
          <Line
            x1={endOffset} // Adjusted for stroke width visibility
            y1={halfSize}
            x2={size - endOffset} // Adjusted
            y2={halfSize}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="butt" // Use butt for straight ends
          />
        );
      case "curve":
        return (
          <Path
            d={`M ${halfSize} ${endOffset} A ${halfSize - endOffset} ${
              halfSize - endOffset
            } 0 0 0 ${size - endOffset} ${halfSize}`} // sweep-flag changed from 1 to 0
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            fill="none"
          />
        );
      case "end":
        return (
          <Line
            x1={halfSize} // Start from center
            y1={halfSize}
            x2={size - endOffset} // Go towards right edge
            y2={halfSize}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />
        );
      default:
        return null;
    }
  };

  const renderMarker = () => {
    if (special === "start") {
      return (
        <Circle
          cx={halfSize}
          cy={halfSize}
          r={markerRadius}
          fill={startColor}
        />
      );
    }
    if (special === "end") {
      return (
        <Circle cx={halfSize} cy={halfSize} r={markerRadius} fill={endColor} />
      );
    }
    return null;
  };

  // Disable press if locked or solved
  const handlePress = locked || isSolved ? undefined : onPress;

  return (
    <Pressable onPress={handlePress} style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Group to apply rotation */}
        <G rotation={rotation} originX={halfSize} originY={halfSize}>
          {renderPipe()}
          {renderMarker()}
        </G>
      </Svg>
    </Pressable>
  );
};

// Memoize Tile to prevent unnecessary re-renders if props haven't changed
export default React.memo(Tile);
