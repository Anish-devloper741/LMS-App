import { View, Text, ScrollView, TouchableOpacity, Alert, Image, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CourseDetailsScreen() {
  const { courseData } = useLocalSearchParams();
  const course = courseData ? JSON.parse(courseData as string) : null;

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (course) {
      checkBookmarkStatus();
      checkEnrollmentStatus(); // <-- Yahan naya function add kiya
    }
  }, [course]);

  // NAYA FUNCTION: Enrollment status check karne ke liye
  const checkEnrollmentStatus = async () => {
    try {
      let storedEnrollments = null;
      if (Platform.OS === "web") {
        storedEnrollments = localStorage.getItem("enrolledCourses");
      } else {
        storedEnrollments = await AsyncStorage.getItem("enrolledCourses");
      }
      
      if (storedEnrollments) {
        const enrollmentsArray = JSON.parse(storedEnrollments);
        setIsEnrolled(enrollmentsArray.includes(course.id));
      }
    } catch (error) {
      console.error("Error reading enrollments", error);
    }
  };

  // Local Storage check karna (Bookmarks)
  const checkBookmarkStatus = async () => {
    try {
      let storedBookmarks = null;
      if (Platform.OS === "web") {
        storedBookmarks = localStorage.getItem("bookmarkedCourses");
      } else {
        storedBookmarks = await AsyncStorage.getItem("bookmarkedCourses");
      }
      
      if (storedBookmarks) {
        const bookmarksArray = JSON.parse(storedBookmarks);
        setIsBookmarked(bookmarksArray.includes(course.id));
      }
    } catch (error) {
      console.error("Error reading bookmarks", error);
    }
  };

  // Bookmark Toggle Function
  const toggleBookmark = async () => {
    try {
      let storedBookmarks = null;
      if (Platform.OS === "web") {
        storedBookmarks = localStorage.getItem("bookmarkedCourses");
      } else {
        storedBookmarks = await AsyncStorage.getItem("bookmarkedCourses");
      }
      
      let bookmarksArray = storedBookmarks ? JSON.parse(storedBookmarks) : [];

      if (isBookmarked) {
        bookmarksArray = bookmarksArray.filter((id: string) => id !== course.id);
        setIsBookmarked(false);
      } else {
        bookmarksArray.push(course.id);
        setIsBookmarked(true);
      }

      if (Platform.OS === "web") {
        localStorage.setItem("bookmarkedCourses", JSON.stringify(bookmarksArray));
      } else {
        await AsyncStorage.setItem("bookmarkedCourses", JSON.stringify(bookmarksArray));
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert("Error: Could not update bookmark");
      } else {
        Alert.alert("Error", "Could not update bookmark");
      }
    }
  };

  // UPDATED: Enroll Button Function jo data permanently save karega
  const handleEnroll = async () => {
    try {
      // Pehle purani list nikalo
      let storedEnrollments = null;
      if (Platform.OS === "web") {
        storedEnrollments = localStorage.getItem("enrolledCourses");
      } else {
        storedEnrollments = await AsyncStorage.getItem("enrolledCourses");
      }
      
      let enrollmentsArray = storedEnrollments ? JSON.parse(storedEnrollments) : [];
      
      // Agar course list mein nahi hai toh daal do
      if (!enrollmentsArray.includes(course.id)) {
         enrollmentsArray.push(course.id);
      }

      // Updated list ko wapas save kar do
      if (Platform.OS === "web") {
        localStorage.setItem("enrolledCourses", JSON.stringify(enrollmentsArray));
      } else {
        await AsyncStorage.setItem("enrolledCourses", JSON.stringify(enrollmentsArray));
      }

      setIsEnrolled(true); // Button ko hara (green) karne ke liye

      if (Platform.OS === 'web') {
        window.alert(`Success! You have successfully enrolled in ${course.title}`);
      } else {
        Alert.alert("Success!", `You have successfully enrolled in ${course.title}`);
      }
    } catch (error) {
      console.error("Enrollment error", error);
    }
  };

  if (!course) return <Text className="mt-10 text-center font-bold">Loading Course Data...</Text>;

  return (
    <View className="flex-1 bg-white">
      {/* Back Button */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        className="absolute top-12 left-4 z-10 bg-black/60 px-4 py-2 rounded-full"
      >
        <Text className="text-white font-bold">← Back</Text>
      </TouchableOpacity>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Course Image */}
        <Image 
          source={{ uri: course.thumbnail }} 
          className="w-full h-72 bg-gray-200"
          resizeMode="cover"
        />

        <View className="p-6">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 pr-4">
              <Text className="text-3xl font-bold text-gray-900">{course.title}</Text>
              <Text className="text-blue-600 font-semibold text-base mt-2">By {course.instructor}</Text>
            </View>
            
            {/* Bookmark Icon */}
            <TouchableOpacity 
              onPress={toggleBookmark} 
              className="bg-gray-100 p-4 rounded-full shadow-sm"
            >
              <Text className="text-2xl">{isBookmarked ? "🔖" : "📑"}</Text>
            </TouchableOpacity>
          </View>

          <View className="h-[1px] bg-gray-200 my-4" />

          {/* Description */}
          <Text className="text-xl font-bold text-gray-800 mb-3">About this course</Text>
          <Text className="text-gray-600 leading-relaxed text-base">
            {course.description}
          </Text>

          {/* Enroll Button */}
          <TouchableOpacity 
            onPress={handleEnroll}
            disabled={isEnrolled}
            className={`mt-8 p-4 rounded-xl items-center shadow-md ${
              isEnrolled ? "bg-green-600" : "bg-blue-600"
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {isEnrolled ? "✓ Enrolled Successfully" : "Enroll Now"}
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}