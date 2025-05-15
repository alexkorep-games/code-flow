// src/app/sprint-board.tsx
import React from "react";
import {
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import TicketCard from "../src/components/TicketCard";
import { useGame } from "../src/contexts/GameContext";
import { Ticket } from "../src/types/types";

export default function SprintBoardScreen() {
  const {
    gamePhase,
    sprintNumber,
    currentSprintTickets,
    selectTicketToWorkOn,
    sprintTimeRemaining,
    completedTicketsThisSprint,
    endSprintEarly,
    setCurrentScreen, // Add this from context
  } = useGame();

  // Remove Redirect usage
  if (gamePhase !== "SPRINT_ACTIVE") {
    return null;
  }

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
            No tickets in this sprint.
            {sprintNumber > 0
              ? " You can add tickets during Sprint Planning."
              : " Start a new game."}
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
            disabled={gamePhase !== "SPRINT_ACTIVE"}
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
    color: "#d35400",
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
