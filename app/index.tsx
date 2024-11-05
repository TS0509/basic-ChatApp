import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";

interface LoginData {
  username: string;
}

export default function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginData>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: LoginData) => {
    setLoading(true);

    if (data.username.trim() === "") {
      Alert.alert("Username is required", "Please enter a valid username.");
      setLoading(false);
      return;
    }

    console.log("Logged in with username:", data.username);

    // Navigate to /chat page and pass 'id' as a parameter
    router.push({
      pathname: "/chat",
      params: { username: data.username }, // Pass 'username' as a parameter
    });

    setLoading(false); // Reset loading state after navigation
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Controller
          control={control}
          name="username"
          rules={{ required: "Username is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, errors.username ? styles.errorInput : null]}
              placeholder="Enter your username"
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}

        {/* Custom Button using TouchableOpacity */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)} // Trigger form submission
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Log In"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f5f5f5", // Light background for contrast
  },
  form: {
    marginBottom: 16,
    alignItems: "center", // Center the form contents
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: "#caabdb",
    padding: 26,
  },
  input: {
    height: 50,
    width: "80%", // Limit width of input to be more centered
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 25, // Make the input round
    paddingLeft: 16,
    marginBottom: 20,
    backgroundColor: "#fff", // White background for input field
    fontSize: 16,
  },
  errorInput: {
    borderColor: "red", // If there's an error, show red border
  },
  button: {
    width: "80%", // Same width as the input field
    height: 50,
    borderRadius: 25, // Rounded button
    backgroundColor: "#663399", // Blue background for the button
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#b0c4de", // Lighter color when the button is disabled
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginBottom: 12,
  },
});
