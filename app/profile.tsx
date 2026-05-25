import { View, Text, TouchableOpacity, Image, Platform, Alert, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback } from "react";
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [bookmarkedCount, setBookmarkedCount] = useState(0);

  // useFocusEffect taaki jab bhi user profile par aaye, data fresh load ho
  useFocusEffect(
    useCallback(() => {
      loadUserStats();
    }, [])
  );

  const loadUserStats = async () => {
    try {
      // Load Enrollments
      let storedEnrollments = Platform.OS === "web" ? localStorage.getItem("enrolledCourses") : await AsyncStorage.getItem("enrolledCourses");
      if (storedEnrollments) {
        setEnrolledCount(JSON.parse(storedEnrollments).length);
      }

      // Load Bookmarks
      let storedBookmarks = Platform.OS === "web" ? localStorage.getItem("bookmarkedCourses") : await AsyncStorage.getItem("bookmarkedCourses");
      if (storedBookmarks) {
        setBookmarkedCount(JSON.parse(storedBookmarks).length);
      }
    } catch (error) {
      console.log("Error loading stats", error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem("userToken");
      } else {
        await SecureStore.deleteItemAsync("userToken");
      }
      router.replace("/");
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert("Error logging out");
      } else {
        Alert.alert("Error", "Could not log out");
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      
      {/* Header with Back Button */}
      <View className="pt-14 pb-6 px-4 bg-blue-600 flex-row items-center rounded-b-3xl shadow-lg z-10">
         <TouchableOpacity 
           onPress={() => router.back()} 
           className="mr-4 px-4 py-2 bg-white/20 rounded-full flex-row items-center"
         >
           <Text className="text-white font-bold text-base">← Back</Text>
         </TouchableOpacity>
         <Text className="text-white font-bold text-2xl flex-1">My Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 items-center mb-6">
          <TouchableOpacity onPress={pickImage} className="relative mb-4">
            <Image 
              source={{ uri: profileImage || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60" }} 
              className="w-32 h-32 rounded-full border-4 border-blue-50"
            />
            <View className="absolute bottom-1 right-1 bg-blue-600 w-10 h-10 rounded-full items-center justify-center border-4 border-white shadow-sm">
               <Text className="text-white text-lg">📷</Text>
            </View>
          </TouchableOpacity>

          <View className="bg-blue-100 px-4 py-1 rounded-full mb-3">
             <Text className="text-blue-700 font-bold text-xs uppercase tracking-widest">Student</Text>
          </View>
          <Text className="text-2xl font-extrabold text-gray-900 mb-1">Tech Learner</Text>
          <Text className="text-gray-500 font-medium text-base">student@houseofedtech.com</Text>
        </View>

        {/* Learning Dashboard Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4 px-2">Learning Dashboard</Text>
          
          {/* Enrolled Courses Button */}
          <TouchableOpacity 
            onPress={() => router.push("/my-enrollments")}
            className="bg-white p-5 rounded-2xl flex-row justify-between items-center shadow-sm border border-gray-100 mb-4"
          >
            <View className="flex-row items-center">
              <View className="bg-blue-50 w-14 h-14 rounded-full items-center justify-center mr-4">
                 <Text className="text-2xl">📚</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">Enrolled Courses</Text>
                <Text className="text-gray-500 text-sm mt-1">View your active learning</Text>
              </View>
            </View>
            <View className="bg-blue-600 min-w-[40px] h-10 px-2 rounded-full items-center justify-center">
               <Text className="text-white font-bold text-lg">{enrolledCount}</Text>
            </View>
          </TouchableOpacity>

          {/* Bookmarked Courses Button (NAYA ADD KIYA HAI) */}
          <TouchableOpacity 
            onPress={() => router.push("/my-bookmarks")}
            className="bg-white p-5 rounded-2xl flex-row justify-between items-center shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="bg-orange-50 w-14 h-14 rounded-full items-center justify-center mr-4">
                 <Text className="text-2xl">🔖</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">Saved Courses</Text>
                <Text className="text-gray-500 text-sm mt-1">Courses you bookmarked</Text>
              </View>
            </View>
            <View className="bg-orange-500 min-w-[40px] h-10 px-2 rounded-full items-center justify-center">
               <Text className="text-white font-bold text-lg">{bookmarkedCount}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          onPress={handleLogout} 
          className="w-full bg-red-50 py-4 rounded-2xl items-center flex-row justify-center border border-red-100 mb-10"
        >
          <Text className="mr-3 text-xl">🚪</Text>
          <Text className="text-red-600 font-bold text-lg">Logout Securely</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}