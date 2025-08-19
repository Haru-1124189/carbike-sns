import ActionButton from "@/components/ActionButton";
import Banner from "@/components/Banner";
import { StyleSheet, Text, View } from "react-native";

export default function Map() {
  return (
    <View style={styles.screen}>
      <Banner />
      <Text style={styles.h1}>スポットマップ（仮）</Text>
      <View style={styles.mapStub}>
        <Text>ここに地図（後で react-native-maps）</Text>
      </View>
      <View style={styles.row}>
        <ActionButton small label="ツーリング" onPress={() => {}} />
        <ActionButton small label="ご飯" onPress={() => {}} />
        <ActionButton small label="観光" onPress={() => {}} />
        <ActionButton small label="整備" onPress={() => {}} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: "#fff" },
  h1: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  mapStub: {
    height: 220, borderRadius: 12, backgroundColor: "#eef3f8",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#dde5ee",
    marginBottom: 12
  },
});