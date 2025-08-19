import Banner from "@/components/Banner";
import Card from "@/components/Card";
import { myGarage } from "@/data/dummy";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function Records() {
  return (
    <View style={styles.screen}>
      <Banner />
      <Text style={styles.h1}>自分の整備記録</Text>
      <FlatList
        data={myGarage}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <Card title={item.title} subtitle={item.date} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: "#fff" },
  h1: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
});