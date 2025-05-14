import React, { useMemo, useState } from "react";
import {
  Button,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import PuzzleGrid from "../components/PuzzleGrid";
import { usePuzzleState } from "../hooks/usePuzzleState";

const DEFAULT_SIZE = 5;
const DEFAULT_LOCKED_PERCENT = 20;
const MIN_SIZE = 3;
const MAX_SIZE = 10;
const MIN_LOCKED = 0;
const MAX_LOCKED = 90; // Keep some unlocked

// Calculate a reasonable tile size based on screen width
const screenWidth = Dimensions.get("window").width;
const maxGridWidth = screenWidth * 0.9; // Use 90% of screen width

const PuzzleGameScreen: React.FC = () => {
  const [inputSize, setInputSize] = useState<string>(DEFAULT_SIZE.toString());
  const [inputLocked, setInputLocked] = useState<string>(
    DEFAULT_LOCKED_PERCENT.toString()
  );

  const [currentSize, setCurrentSize] = useState<number>(DEFAULT_SIZE);
  const [currentLocked, setCurrentLocked] = useState<number>(
    DEFAULT_LOCKED_PERCENT
  );

  const { puzzleState, isLoading, isSolved, generateNewPuzzle, rotateTile } =
    usePuzzleState(currentSize, currentLocked);

  const handleGenerate = () => {
    let size = parseInt(inputSize, 10);
    let locked = parseInt(inputLocked, 10);

    // Validate and clamp values
    size = isNaN(size)
      ? DEFAULT_SIZE
      : Math.max(MIN_SIZE, Math.min(MAX_SIZE, size));
    locked = isNaN(locked)
      ? DEFAULT_LOCKED_PERCENT
      : Math.max(MIN_LOCKED, Math.min(MAX_LOCKED, locked));

    // Update input fields to reflect validated values
    setInputSize(size.toString());
    setInputLocked(locked.toString());

    // Set current values used by the hook and trigger generation
    setCurrentSize(size);
    setCurrentLocked(locked);
    // The hook's useEffect will pick up the change in currentSize/currentLocked
    generateNewPuzzle(size, locked); // Or call directly if preferred
  };

  // Calculate tile size dynamically based on current grid size
  const tileSize = useMemo(() => {
    const size = puzzleState?.N || currentSize; // Use actual N if loaded, else current setting
    return Math.floor(maxGridWidth / size);
  }, [puzzleState?.N, currentSize]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Code Flow Puzzle</Text>

        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Text style={styles.label}>
              Grid Size ({MIN_SIZE}-{MAX_SIZE}):
            </Text>
            <TextInput
              style={styles.input}
              value={inputSize}
              onChangeText={setInputSize}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
          <View style={styles.controlRow}>
            <Text style={styles.label}>
              Locked % ({MIN_LOCKED}-{MAX_LOCKED}):
            </Text>
            <TextInput
              style={styles.input}
              value={inputLocked}
              onChangeText={setInputLocked}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
          <Button
            title="Generate Puzzle"
            onPress={handleGenerate}
            disabled={isLoading}
          />
        </View>

        <PuzzleGrid
          puzzleState={puzzleState}
          tileSize={tileSize}
          onTilePress={rotateTile}
          isLoading={isLoading}
          isSolved={isSolved}
        />
        {isSolved && <Text style={styles.solvedText}>🎉 Solved! 🎉</Text>}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  controls: {
    marginBottom: 20,
    alignItems: "stretch", // Make controls take available width
    width: "80%", // Limit width of controls section
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Space out label and input
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginRight: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    width: 60, // Fixed width for input
    textAlign: "center",
    fontSize: 16,
  },
  solvedText: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },
});

export default PuzzleGameScreen;
