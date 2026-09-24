import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface ErrorAlertProps {
  message: string
  onDismiss: () => void
}
export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name='alert-circle' size={20} color='#dc2626' />
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity onPress={onDismiss}>
        <Ionicons name='close' size={20} color='#dc2626' />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 16,
    padding: 12,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    gap: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  message: { color: "#dc2626", fontSize: 14, flex: 1 },
})
