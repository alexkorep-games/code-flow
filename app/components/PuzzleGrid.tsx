// src/components/PuzzleGrid.tsx
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { PuzzleState } from "../types/types";
import Tile from "./Tile";

interface PuzzleGridProps {
  puzzleState: PuzzleState | null;
  tileSize: number;
  onTilePress: (r: number, c: number) => void;
  isLoading: boolean;
  isSolved: boolean;
}

const PuzzleGrid: React.FC<PuzzleGridProps> = ({
  puzzleState,
  tileSize,
  onTilePress,
  isLoading,
  isSolved,
}) => {
  if (isLoading || !puzzleState) {
    // Calculate approximate size for loader positioning
    const approxSize = (puzzleState?.N || 5) * tileSize; // Use default or last N if available
    return (
      <View
        style={[
          styles.loadingContainer,
          { width: approxSize || "80%", height: approxSize || "80%" },
        ]}
      >
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const { N, grid } = puzzleState;
  const gridDimension = N * tileSize;

  return (
    <View
      style={[
        styles.gridContainer,
        { width: gridDimension, height: gridDimension },
      ]}
    >
      {grid.map((row, r) => (
        <View key={`row-${r}`} style={styles.row}>
          {row.map((tileData, c) => (
            <Tile
              key={`tile-${r}-${c}`}
              tileData={tileData}
              size={tileSize}
              onPress={() => onTilePress(r, c)}
              isSolved={isSolved}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginVertical: 20,
    borderRadius: 8,
    boxShadow: "0px 2px 3px rgba(0,0,0,0.2)",
    elevation: 3, // Keep for Android if needed, or remove if web-only styling
  },
  gridContainer: {
    flexDirection: "column",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ccc",
    boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
    elevation: 5, // Keep for Android if needed, or remove if web-only styling
  },
  row: {
    flexDirection: "row",
  },
});
export default PuzzleGrid;
