// src/components/TicketCard.tsx
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ticket } from "../types";

interface TicketCardProps {
  ticket: Ticket;
  onPress?: () => void;
  showStatus?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onPress,
  showStatus = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "in-progress":
        return "orange";
      case "paused":
        return "blue";
      case "sprint":
        return "purple";
      default:
        return "grey";
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.title} numberOfLines={1}>
        {ticket.title}
      </Text>
      <Text style={styles.type}>{ticket.type}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {ticket.description}
      </Text>
      <View style={styles.detailsRow}>
        <Text style={styles.detailText}>
          Complexity: {ticket.puzzleDefinition.N}x{ticket.puzzleDefinition.N}
        </Text>
        <Text style={styles.detailText}>
          Locked: {ticket.puzzleDefinition.lockedPercent}%
        </Text>
      </View>
      <Text style={styles.detailText}>Story Points: {ticket.storyPoints}</Text>
      {showStatus && (
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(ticket.status) },
          ]}
        >
          <Text style={styles.statusText}>{ticket.status.toUpperCase()}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    minHeight: 35, // Ensure space for two lines
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: "#444",
  },
  statusBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default React.memo(TicketCard);
