// src/components/PuzzleGrid.tsx
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { PuzzleState } from "../types";
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
    backgroundColor: "#f0f0f0", // Match puzzle background
    marginVertical: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // for Android
  },
  gridContainer: {
    flexDirection: "column", // Rows are stacked vertically
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5, // for Android
  },
  row: {
    flexDirection: "row", // Tiles within a row are horizontal
  },
});

export default PuzzleGrid;
