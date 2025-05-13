// src/app/sprint-board.tsx
import React from "react";
import {
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import TicketCard from "./components/TicketCard";
import { useGame } from "./contexts/GameContext";
import { Ticket } from "./types/types";

export default function SprintBoardScreen() {
  const {
    sprintNumber,
    currentSprintTickets,
    selectTicketToWorkOn,
    sprintTimeRemaining,
    isSprintTimerRunning,
    pauseSprintTimer,
    resumeSprintTimer,
    completedTicketsThisSprint,
    endSprintEarly,
    gamePhase,
  } = useGame();

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <TicketCard
      ticket={item}
      onPress={() => {
        if (item.status !== "completed") {
          selectTicketToWorkOn(item.id);
        } else {
          Alert.alert("Ticket Completed", "This ticket is already done!");
        }
      }}
      showStatus={true}
    />
  );

  const timeFormatted = `${Math.floor(sprintTimeRemaining / 60)
    .toString()
    .padStart(2, "0")}:${(sprintTimeRemaining % 60)
    .toString()
    .padStart(2, "0")}`;

  // The timer should ideally be controlled by gamePhase changes in GameContext.
  // PUZZLE_SOLVING phase should run the timer, SPRINT_ACTIVE should pause it.

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sprint {sprintNumber} - In Progress</Text>
          <Text style={styles.timerText}>Time Remaining: {timeFormatted}</Text>
          <Text style={styles.statsText}>
            Completed: {completedTicketsThisSprint} /{" "}
            {currentSprintTickets.length} tickets
          </Text>
        </View>

        {currentSprintTickets.length === 0 ? (
          <Text style={styles.emptyText}>
            No tickets in this sprint. This shouldn't happen if planned
            correctly.
          </Text>
        ) : (
          <FlatList
            data={currentSprintTickets}
            renderItem={renderTicketItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
          />
        )}
        <View style={styles.controls}>
          <Button
            title="End Sprint Early"
            onPress={endSprintEarly}
            color="orange"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#e9eef0" },
  container: {
    flex: 1,
    padding: 15,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  timerText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#d35400", // Orange-red for timer
    marginBottom: 5,
  },
  statsText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  list: {
    flex: 1,
    marginBottom: 10,
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 50,
    fontSize: 16,
  },
  controls: {
    marginTop: 10,
  },
});
