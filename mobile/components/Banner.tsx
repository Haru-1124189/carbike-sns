import { StyleSheet, Text, View } from "react-native";
export default function Banner() {
  return (
    <View style={styles.banner}>
      <Text style={{ fontSize: 12 }}>［広告バナー枠］</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  banner: {
    height: 44, borderWidth: 1, borderColor: "#ddd", borderRadius: 8,
    alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa", marginBottom: 12
  },
});