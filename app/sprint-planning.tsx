// src/app/sprint-planning.tsx
import { useRouter } from "expo-router"; // Import useRouter
import React, { useEffect } from "react"; // Import useEffect
import {
  ActivityIndicator, // For a loading indicator
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

export default function SprintPlanningScreen() {
  const router = useRouter();
  const {
    gamePhase, // Get gamePhase
    sprintNumber,
    backlog,
    currentSprintTickets,
    addTicketToSprint,
    removeTicketFromSprint,
    startSprint,
    sprintTotalTime,
  } = useGame();

  useEffect(() => {
    if (gamePhase !== "SPRINT_PLANNING") {
      // console.log("SprintPlanningScreen: Incorrect game phase. Expected SPRINT_PLANNING, got", gamePhase, ". Redirecting to /menu.");
      router.replace("/menu"); // Use replace to not add to history
    }
  }, [gamePhase, router]);

  // If gamePhase is not correct, render nothing or a loader until redirect happens
  if (gamePhase !== "SPRINT_PLANNING") {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </SafeAreaView>
    );
  }

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
              Select tickets from the backlog to add them to the sprint.
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
  loadingContainer: {
    // Added for loading state
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e9eef0",
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
  list: {},
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
});
