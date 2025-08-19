import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Card({
  title, subtitle, onPress,
}: { title: string; subtitle?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12, backgroundColor: "#fff",
    marginBottom: 10
  },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardSub: { color: "#666", marginTop: 4, fontSize: 12 },
});