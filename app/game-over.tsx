// src/app/game-over.tsx
import React from "react";
import { Button, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useGame } from "../src/contexts/GameContext";

export default function GameOverScreen() {
  const { sprintNumber, totalTicketsCompleted, resetGame } = useGame();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Game Over!</Text>
        <Text style={styles.message}>Your backlog grew too large.</Text>
        <Text style={styles.stats}>
          You managed {sprintNumber - 1} sprints.
        </Text>
        <Text style={styles.stats}>
          Total tickets completed: {totalTicketsCompleted}
        </Text>
        <View style={styles.buttonContainer}>
          <Button title="Play Again" onPress={resetGame} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f0f0f0" },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#e74c3c", // Red for game over
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  stats: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 30,
    width: "80%",
  },
});
