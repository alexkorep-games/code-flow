// src/app/sprint-planning.tsx
import React from "react";
import {
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import TicketCard from "../components/TicketCard";
import { useGame } from "../contexts/GameContext";
import { Ticket } from "../types";

export default function SprintPlanningScreen() {
  const {
    sprintNumber,
    backlog,
    currentSprintTickets,
    addTicketToSprint,
    removeTicketFromSprint,
    startSprint,
    sprintTotalTime,
  } = useGame();

  const renderTicketItem = ({ item }: { item: Ticket }) => (
    <TicketCard
      ticket={item}
      onPress={() => {
        if (currentSprintTickets.find((t) => t.id === item.id)) {
          removeTicketFromSprint(item.id);
        } else {
          addTicketToSprint(item.id);
        }
      }}
      showStatus={false}
    />
  );

  const totalSprintStoryPoints = currentSprintTickets.reduce(
    (sum, ticket) => sum + ticket.storyPoints,
    0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sprint {sprintNumber} Planning</Text>
          <Text style={styles.sprintInfo}>
            Sprint Duration: {Math.floor(sprintTotalTime / 60)}m{" "}
            {sprintTotalTime % 60}s
          </Text>
          <Text style={styles.sprintInfo}>Backlog Size: {backlog.length}</Text>
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>
            Product Backlog ({backlog.length})
          </Text>
          {backlog.length === 0 ? (
            <Text style={styles.emptyText}>Backlog is empty!</Text>
          ) : (
            <FlatList
              data={backlog}
              renderItem={renderTicketItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
            />
          )}
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>
            Current Sprint ({currentSprintTickets.length} tickets /{" "}
            {totalSprintStoryPoints} SP)
          </Text>
          {currentSprintTickets.length === 0 ? (
            <Text style={styles.emptyText}>
              Drag tickets here or tap from backlog.
            </Text>
          ) : (
            <FlatList
              data={currentSprintTickets}
              renderItem={renderTicketItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
            />
          )}
        </View>

        <Button
          title="Start Sprint"
          onPress={startSprint}
          disabled={currentSprintTickets.length === 0}
        />
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
    marginBottom: 15,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sprintInfo: {
    fontSize: 14,
    color: "#333",
  },
  listContainer: {
    flex: 1,
    marginBottom: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#3498db",
  },
  list: {
    // flex: 1, // Handled by listContainer's flex
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
});
