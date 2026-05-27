import { View, Text, ScrollView, TouchableOpacity, Alert, Image, Platform} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // <-- NAYA IMPORT

export default function CourseDetailsScreen() {
  const { courseData } = useLocalSearchParams();
  const insets = useSafeAreaInsets(); // <-- SAFE AREA CALCULATION
  
  let course: any = null;
  try {
    if (typeof courseData === 'string') {
       course = JSON.parse(courseData);
    }
  } catch (e) {
    console.error("Error parsing course data", e);
  }

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (course && course.id) {
      checkBookmarkStatus();
      checkEnrollmentStatus();
    }
  }, [course?.id]);

  const checkEnrollmentStatus = async () => {
    if (!course?.id) return;
    try {
      let storedEnrollments = Platform.OS === "web" 
        ? localStorage.getItem("enrolledCourses") 
        : await AsyncStorage.getItem("enrolledCourses");
      
      if (storedEnrollments) {
        const enrollmentsArray = JSON.parse(storedEnrollments);
        const isPresent = enrollmentsArray.map(String).includes(String(course.id));
        setIsEnrolled(isPresent);
      }
    } catch (error) {
      console.error("Error reading enrollments", error);
    }
  };

  const checkBookmarkStatus = async () => {
    if (!course?.id) return;
    try {
      let storedBookmarks = Platform.OS === "web" 
        ? localStorage.getItem("bookmarkedCourses") 
        : await AsyncStorage.getItem("bookmarkedCourses");
      
      if (storedBookmarks) {
        const bookmarksArray = JSON.parse(storedBookmarks);
        const isPresent = bookmarksArray.map(String).includes(String(course.id));
        setIsBookmarked(isPresent);
      }
    } catch (error) {
      console.error("Error reading bookmarks", error);
    }
  };

  const toggleBookmark = async () => {
    if (!course?.id) return;
    try {
      const stringId = String(course.id);
      let storedBookmarks = Platform.OS === "web" 
        ? localStorage.getItem("bookmarkedCourses") 
        : await AsyncStorage.getItem("bookmarkedCourses");
      
      let bookmarksArray = storedBookmarks ? JSON.parse(storedBookmarks).map(String) : [];

      if (isBookmarked) {
        bookmarksArray = bookmarksArray.filter((id: string) => id !== stringId);
        setIsBookmarked(false);
      } else {
        if (!bookmarksArray.includes(stringId)) {
           bookmarksArray.push(stringId);
        }
        setIsBookmarked(true);
      }

      const stringifiedData = JSON.stringify(bookmarksArray);
      if (Platform.OS === "web") {
        localStorage.setItem("bookmarkedCourses", stringifiedData);
      } else {
        await AsyncStorage.setItem("bookmarkedCourses", stringifiedData);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert("Error: Could not update bookmark");
      } else {
        Alert.alert("Error", "Could not update bookmark");
      }
    }
  };

  const handleEnroll = async () => {
    if (!course?.id) return;
    try {
      const stringId = String(course.id);
      let storedEnrollments = Platform.OS === "web" 
        ? localStorage.getItem("enrolledCourses") 
        : await AsyncStorage.getItem("enrolledCourses");
      
      let enrollmentsArray = storedEnrollments ? JSON.parse(storedEnrollments).map(String) : [];
      
      if (!enrollmentsArray.includes(stringId)) {
         enrollmentsArray.push(stringId);
      }

      const stringifiedData = JSON.stringify(enrollmentsArray);
      if (Platform.OS === "web") {
        localStorage.setItem("enrolledCourses", stringifiedData);
      } else {
        await AsyncStorage.setItem("enrolledCourses", stringifiedData);
      }

      setIsEnrolled(true);

      if (Platform.OS === 'web') {
        window.alert(`Success! You have successfully enrolled in ${course.title || 'the course'}`);
      } else {
        Alert.alert("Success!", `You have successfully enrolled in ${course.title || 'the course'}`);
      }
    } catch (error) {
      console.error("Enrollment error", error);
    }
  };

  if (!course) return (
     <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="mt-10 text-center font-bold text-gray-500 text-lg">Loading Course Data...</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-blue-600 px-4 py-2 rounded-lg">
           <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
     </SafeAreaView>
  );

  return (
    // SafeAreaView ki wajah se top/bottom bars ke andar content nahi jayega
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      
      {/* Absolute Back Button */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        className="absolute left-4 z-20 bg-white/90 px-4 py-2 rounded-full shadow-md flex-row items-center"
        style={{ top: insets.top + 16 }} // Status bar ke theek neeche
      >
        <Text className="text-gray-900 font-bold text-base">← Back</Text>
      </TouchableOpacity>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Cover Image Container */}
        <View className="relative w-full h-80 bg-gray-200">
          <Image 
            source={{ uri: course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3" }} 
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black/60 to-transparent" />
        </View>

        {/* Content Container */}
        <View className="p-6 bg-white -mt-6 rounded-t-3xl shadow-sm">
          
          <View className="flex-row justify-between items-center mb-4">
            <View className="bg-blue-100 px-3 py-1 rounded-md">
                <Text className="text-blue-700 font-bold text-xs uppercase tracking-widest">Technology</Text>
            </View>
            <TouchableOpacity 
              onPress={toggleBookmark} 
              className="bg-gray-50 border border-gray-100 p-3 rounded-full shadow-sm"
            >
              <Text className="text-2xl">{isBookmarked ? "🔖" : "📑"}</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-3xl font-extrabold text-gray-900 leading-tight mb-3">
            {course.title || "Modern Course Title"}
          </Text>

          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3 border border-indigo-200">
               <Text className="text-lg">👨‍🏫</Text>
            </View>
            <View>
              <Text className="text-gray-500 text-xs font-semibold uppercase">Instructor</Text>
              <Text className="text-gray-900 font-bold text-base">{course.instructor || "Industry Expert"}</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
             <View className="items-center">
                 <Text className="text-yellow-500 font-bold text-lg">⭐ 4.8</Text>
                 <Text className="text-gray-500 text-xs mt-1">Rating</Text>
             </View>
             <View className="w-[1px] h-full bg-gray-300" />
             <View className="items-center">
                 <Text className="text-blue-600 font-bold text-lg">👥 2.4k</Text>
                 <Text className="text-gray-500 text-xs mt-1">Students</Text>
             </View>
             <View className="w-[1px] h-full bg-gray-300" />
             <View className="items-center">
                 <Text className="text-green-600 font-bold text-lg">📈 All</Text>
                 <Text className="text-gray-500 text-xs mt-1">Levels</Text>
             </View>
          </View>

          <View className="h-[1px] bg-gray-200 mb-6" />

          <Text className="text-2xl font-bold text-gray-900 mb-4">About this course</Text>
          <Text className="text-gray-600 leading-relaxed text-base">
            {course.description || "No detailed description available. This course covers the fundamentals and advanced topics required to master the subject matter."}
          </Text>

          <View className="h-32" />
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-0 w-full px-6 py-4 bg-white border-t border-gray-100" style={{ paddingBottom: insets.bottom + 16 }}>
        <TouchableOpacity 
          onPress={handleEnroll}
          disabled={isEnrolled}
          className={`w-full p-4 rounded-2xl items-center shadow-lg flex-row justify-center ${
            isEnrolled ? "bg-green-600" : "bg-blue-600"
          }`}
        >
          <Text className="text-white font-extrabold text-xl tracking-wide">
            {isEnrolled ? "✓ Enrolled Successfully" : "Enroll Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}