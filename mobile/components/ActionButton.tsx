import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function ActionButton({
  label, onPress, small,
}: { label: string; onPress: () => void; small?: boolean }) {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, small && styles.actionBtnSmall]}
      onPress={onPress}
    >
      <Text style={{ fontWeight: "600" }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999,
    backgroundColor: "#E8F0FF", borderWidth: 1, borderColor: "#cfe1ff", marginRight: 8, marginBottom: 8
  },
  actionBtnSmall: { paddingVertical: 6, paddingHorizontal: 10 },
});