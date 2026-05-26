import { View, Text, TouchableOpacity, Image, Platform, Alert, ScrollView } from "react-native";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useCallback } from "react";
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [bookmarkedCount, setBookmarkedCount] = useState(0);
  
  const [userName, setUserName] = useState("Tech Learner");
  const [userEmail, setUserEmail] = useState("student@houseofedtech.com");
  
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      loadUserStats();
    }, [])
  );

  const loadUserStats = async () => {
    try {
      let storedName = Platform.OS === "web" ? localStorage.getItem("userName") : await AsyncStorage.getItem("userName");
      let storedEmail = Platform.OS === "web" ? localStorage.getItem("userEmail") : await AsyncStorage.getItem("userEmail");
      let storedImage = Platform.OS === "web" ? localStorage.getItem("profileImage") : await AsyncStorage.getItem("profileImage");

      if (storedName) setUserName(storedName);
      if (storedEmail) setUserEmail(storedEmail);
      if (storedImage) setProfileImage(storedImage); 

      let storedEnrollments = Platform.OS === "web" ? localStorage.getItem("enrolledCourses") : await AsyncStorage.getItem("enrolledCourses");
      if (storedEnrollments) {
        setEnrolledCount(JSON.parse(storedEnrollments).length);
      }

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
      const newImageUri = result.assets[0].uri;
      setProfileImage(newImageUri);
      
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem("profileImage", newImageUri);
        } else {
          await AsyncStorage.setItem("profileImage", newImageUri);
        }
      } catch (error) {
        console.log("Error saving image", error);
      }
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
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      
      <View className="px-6 py-4 flex-row items-center justify-between bg-gray-50">
         <TouchableOpacity 
           onPress={() => router.back()} 
           className="w-10 h-10 bg-white items-center justify-center rounded-full shadow-sm border border-gray-100"
         >
           <Text className="text-gray-800 font-bold text-lg">←</Text>
         </TouchableOpacity>
         <Text className="text-gray-900 font-extrabold text-xl">Account</Text>
         <View className="w-10 h-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false}>
        
        <View className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 items-center mb-8 mt-4 relative">
          
          <View className="absolute top-0 w-full h-24 bg-blue-50 rounded-t-[32px]" />

          <TouchableOpacity onPress={pickImage} className="relative mb-5 z-10 shadow-md">
            <Image 
              source={{ uri: profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png" }} 
              className="w-32 h-32 rounded-full border-4 border-white bg-gray-100"
            />
            <View className="absolute bottom-0 right-2 bg-blue-600 w-10 h-10 rounded-full items-center justify-center border-4 border-white shadow-sm">
               <Text className="text-white text-lg">✏️</Text>
            </View>
          </TouchableOpacity>

          <View className="bg-blue-100 px-4 py-1 rounded-full mb-4">
             <Text className="text-blue-700 font-bold text-[10px] uppercase tracking-widest">Active Student</Text>
          </View>
          
          <Text className="text-3xl font-extrabold text-gray-900 mb-1">{userName}</Text>
          <Text className="text-gray-500 font-medium text-base">{userEmail}</Text>
        </View>

        <View className="mb-10">
          <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">My Journey</Text>
          
          <TouchableOpacity 
            onPress={() => router.push("/my-enrollments")}
            className="bg-white p-5 rounded-2xl flex-row justify-between items-center shadow-sm border border-gray-100 mb-4"
          >
            <View className="flex-row items-center">
              <View className="bg-blue-50 w-14 h-14 rounded-full items-center justify-center mr-4 border border-blue-100">
                 <Text className="text-2xl">🎓</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">Enrolled Courses</Text>
                <Text className="text-gray-400 text-sm mt-1">Active learning path</Text>
              </View>
            </View>
            <View className="bg-blue-600 min-w-[36px] h-9 px-2 rounded-full items-center justify-center shadow-sm">
               <Text className="text-white font-bold text-base">{enrolledCount}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push("/my-bookmarks")}
            className="bg-white p-5 rounded-2xl flex-row justify-between items-center shadow-sm border border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="bg-orange-50 w-14 h-14 rounded-full items-center justify-center mr-4 border border-orange-100">
                 <Text className="text-2xl">🔖</Text>
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">Saved Courses</Text>
                <Text className="text-gray-400 text-sm mt-1">Your learning wishlist</Text>
              </View>
            </View>
            <View className="bg-orange-500 min-w-[36px] h-9 px-2 rounded-full items-center justify-center shadow-sm">
               <Text className="text-white font-bold text-base">{bookmarkedCount}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mb-12">
           <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2">Account Actions</Text>
           <TouchableOpacity 
             onPress={handleLogout} 
             className="w-full bg-white p-5 rounded-2xl items-center flex-row justify-between border border-red-100 shadow-sm"
           >
             <View className="flex-row items-center">
                <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-3">
                   <Text className="text-lg">🚪</Text>
                </View>
                <Text className="text-red-500 font-bold text-lg">Log Out</Text>
             </View>
             <Text className="text-gray-300 text-xl font-bold">→</Text>
           </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}