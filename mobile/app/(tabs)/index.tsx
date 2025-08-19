import ActionButton from "@/components/ActionButton";
import Banner from "@/components/Banner";
import Card from "@/components/Card";
import { publicChats } from "@/data/dummy";
import { Link, router } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.screen}>
      <Banner />
      <Text style={styles.h1}>クイックアクション</Text>
      <View style={styles.row}>
        <ActionButton label="自分の整備記録" onPress={() => router.push("/(tabs)/records")} />
        <ActionButton label="車種一覧" onPress={() => router.push("/car-list")} />
        <ActionButton label="新規投稿" onPress={() => {}} />
      </View>

      <Text style={styles.h1}>最近のトーク（公開）</Text>
      <FlatList
        data={publicChats}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <Card title={item.text} />}
      />

      {/* 例：Linkでも遷移可 */}
      <Link href="/(tabs)/talk" style={{ marginTop: 8, color: "#3366ff" }}>
        トークへ
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: "#fff" },
  h1: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
});