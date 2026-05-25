import { Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import axios from "axios";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        let token = null;
        
        if (Platform.OS === "web") {
          token = localStorage.getItem("userToken");
        } else {
          token = await SecureStore.getItemAsync("userToken");
        }

        if (token) {
          router.replace("/courses");
        } else {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        setIsCheckingAuth(false);
      }
    };

    checkToken();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert("Please enter both email and password");
      } else {
        Alert.alert("Error", "Please enter both email and password");
      }
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("https://api.freeapi.app/api/v1/users/login", {
        email: email, 
        password: password 
      });

      if (response.data.success) {
        const token = response.data.data.accessToken;
        
        if (Platform.OS === "web") {
          localStorage.setItem("userToken", token);
        } else {
          await SecureStore.setItemAsync("userToken", token);
        }
        
        router.replace("/courses");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Invalid credentials";
      if (Platform.OS === 'web') {
        window.alert(errorMsg);
      } else {
        Alert.alert("Login Failed", errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-500 font-medium">Checking session...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      <Text className="text-4xl font-bold text-blue-700 mb-10">House of Edtech</Text>

      <View className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <Text className="text-xl font-bold text-gray-800 mb-6">Welcome Back!</Text>

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
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity 
          className="w-full bg-blue-600 p-4 rounded-xl items-center shadow-md"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
             <ActivityIndicator color="#ffffff" />
          ) : (
             <Text className="text-white font-bold text-lg">Login</Text>
          )}
        </TouchableOpacity>

        {/* YAHAN WAPAS AA GAYA SIGN UP BUTTON */}
        <TouchableOpacity onPress={() => router.replace("/register")} className="mt-6">
          <Text className="text-center text-blue-600 font-semibold">Don't have an account? Sign Up</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}