// src/app/menu.tsx
import React from "react";
import { Button, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useGame } from "../src/contexts/GameContext";

export default function MenuScreen() {
  const { startGame, setCurrentScreen } = useGame();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Code Flow</Text>
        <Text style={styles.subtitle}>The Developer's Puzzle Challenge</Text>
        <View style={styles.buttonContainer}>
          <Button title="Start New Game" onPress={startGame} />
        </View>
        {/* TODO: Add "How to Play", "Settings" if time permits */}
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
    fontSize: 48,
    fontWeight: "bold",
    color: "#3498db",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 40,
    textAlign: "center",
  },
  buttonContainer: {
    width: "80%",
  },
});
