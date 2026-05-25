import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import axios from "axios";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!username || !email || !password) {
      if (Platform.OS === 'web') {
        window.alert("Please fill all the fields");
      } else {
        Alert.alert("Error", "Please fill all the fields");
      }
      return;
    }

    setLoading(true);

    try {
      // FreeAPI Registration call
      // FreeAPI Registration call
      // Dhyan de: 'role' ko uppercase "USER" hi rakhna hai
      const response = await axios.post("https://api.freeapi.app/api/v1/users/register", {
        username: username.toLowerCase().trim(), // Username mein spaces ya capitals allow nahi hote
        email: email.trim(), 
        password: password,
        role: "USER"
      });

      // Agar successful ho gaya toh Login screen par bhej do
      if (response.data.success) {
        if (Platform.OS === 'web') {
          window.alert("Registration Successful! Please login.");
        } else {
          Alert.alert("Success", "Registration Successful! Please login.");
        }
        router.replace("/"); 
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Registration failed. Try again.";
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert("Error", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <Text className="text-4xl font-bold text-blue-700 mb-10">House of Edtech</Text>

      <View className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <Text className="text-xl font-bold text-gray-800 mb-6">Create an Account</Text>

        <Text className="text-gray-700 mb-2 font-semibold">Username</Text>
        <TextInput
          className="w-full bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4 text-black outline-none focus:border-blue-500"
          placeholder="Enter username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />

        <Text className="text-gray-700 mb-2 font-semibold">Email Address</Text>
        <TextInput
          className="w-full bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4 text-black outline-none focus:border-blue-500"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="text-gray-700 mb-2 font-semibold">Password</Text>
        <TextInput
          className="w-full bg-gray-50 border border-gray-300 rounded-lg p-4 mb-8 text-black outline-none focus:border-blue-500"
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          className="w-full bg-green-600 p-4 rounded-xl items-center shadow-md"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="#ffffff" />
          ) : (
             <Text className="text-white font-bold text-lg">Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/")} className="mt-6">
          <Text className="text-center text-blue-600 font-semibold">Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}