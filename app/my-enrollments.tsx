import { View, Text, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function MyEnrollmentsScreen() {
  const [enrolledIDs, setEnrolledIDs] = useState([]);
  const [coursesData, setCoursesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrolledIDs();
  }, []);

  // 1. Storage se enrolled IDs nikalo
  const loadEnrolledIDs = async () => {
    try {
      let storedEnrollments = null;
      if (Platform.OS === "web") {
        storedEnrollments = localStorage.getItem("enrolledCourses");
      } else {
        storedEnrollments = await AsyncStorage.getItem("enrolledCourses");
      }
      
      if (storedEnrollments) {
        const ids = JSON.parse(storedEnrollments);
        setEnrolledIDs(ids);
        
        // Agar IDs hain, toh unki details API se laao
        if (ids.length > 0) {
            fetchCourseDetails(ids);
        } else {
            setLoading(false); // List khali hai
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log("Error loading enrollments", error);
      setLoading(false);
    }
  };

  // 2. API se details laao (Kyunki humare paas sirf IDs hain)
  const fetchCourseDetails = async (idsToFetch: any) => {
    try {
      const response = await axios.get("https://api.freeapi.app/api/v1/public/books");
      
      // API se aane wale saare data ko humare format mein badlo
      const allCourses = response.data.data.data.map((book: any) => ({
        id: book.id,
        title: book.volumeInfo?.title || "Course Title",
        instructor: book.volumeInfo?.authors?.[0] || "Instructor",
      }));

      // Sirf wahi courses rakho jinki ID humari enrolled list mein hai
      const myEnrolledCourses = allCourses.filter((course: any) => 
         idsToFetch.includes(course.id)
      );

      setCoursesData(myEnrolledCourses);
    } catch (error) {
      console.log("Error fetching API data", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-blue-600 flex-row items-center">
         <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-blue-700 rounded-full">
           <Text className="text-white font-bold">← Back</Text>
         </TouchableOpacity>
         <Text className="text-white font-bold text-xl flex-1">My Enrollments</Text>
      </View>

      {/* Main Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
           <ActivityIndicator size="large" color="#2563eb" />
           <Text className="mt-4 text-gray-500">Loading your courses...</Text>
        </View>
      ) : coursesData.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
           <Text className="text-6xl mb-4">📭</Text>
           <Text className="text-xl font-bold text-gray-800 mb-2">No Enrollments Yet</Text>
           <Text className="text-center text-gray-500">You haven't enrolled in any courses yet. Go back to discover page and start learning!</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          {coursesData.map((course, index) => (
            <View key={index} className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200">
               <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                     <Text className="font-bold text-lg text-gray-800">{course.title}</Text>
                     <Text className="text-gray-500 mt-1">By {course.instructor}</Text>
                  </View>
                  <View className="bg-green-100 px-3 py-1 rounded-full ml-2">
                     <Text className="text-green-700 font-bold text-xs">Active</Text>
                  </View>
               </View>
            </View>
          ))}
          <View className="h-10" />
        </ScrollView>
      )}
    </View>
  );
}