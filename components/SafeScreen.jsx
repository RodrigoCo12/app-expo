import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import COLORS from "../constants/colors";

export default function SafeScreen({ children, ceb }) {
  const insets = useSafeAreaInsets();

  return <View style={[styles.container, ceb, { paddingTop: insets.top }]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: COLORS.background,
  },
});

// console.log(styles.container);
