import { View, Text, TouchableOpacity, ScrollView, Platform, ActivityIndicator, Image } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export default function MyBookmarksScreen() {
  const [coursesData, setCoursesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarkedIDs();
  }, []);

  const loadBookmarkedIDs = async () => {
    try {
      let storedBookmarks = Platform.OS === "web" 
        ? localStorage.getItem("bookmarkedCourses") 
        : await AsyncStorage.getItem("bookmarkedCourses");
      
      if (storedBookmarks) {
        const ids = JSON.parse(storedBookmarks);
        
        if (ids.length > 0) {
            fetchCourseDetails(ids);
        } else {
            setCoursesData([]);
            setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log("Error loading bookmarks", error);
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (idsToFetch: any) => {
    try {
      const response = await axios.get("https://api.freeapi.app/api/v1/public/books");
      
      const allCourses = response.data.data.data.map((book: any) => {
        let imgUrl = book.volumeInfo?.imageLinks?.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";
        if (imgUrl.startsWith("http://")) imgUrl = imgUrl.replace("http://", "https://");
        
        return {
          id: String(book.id), // Ensure ID is string format
          title: book.volumeInfo?.title || "Course Title",
          instructor: book.volumeInfo?.authors?.[0] || "Instructor",
          thumbnail: imgUrl
        };
      });

      const stringIdsToFetch = idsToFetch.map(String);
      const mySavedCourses = allCourses.filter((course: any) => 
         stringIdsToFetch.includes(course.id)
      );

      setCoursesData(mySavedCourses);
    } catch (error) {
      console.log("Error fetching API data", error);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (idToRemove: string) => {
    const updatedCourses = coursesData.filter(course => course.id !== idToRemove);
    setCoursesData(updatedCourses);

    const updatedIDs = updatedCourses.map(course => course.id);
    
    if (Platform.OS === "web") {
      localStorage.setItem("bookmarkedCourses", JSON.stringify(updatedIDs));
    } else {
      await AsyncStorage.setItem("bookmarkedCourses", JSON.stringify(updatedIDs));
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="pt-14 pb-4 px-4 bg-white flex-row items-center shadow-sm z-10 border-b border-gray-200">
         <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-gray-100 rounded-full">
           <Text className="text-gray-800 font-bold">← Back</Text>
         </TouchableOpacity>
         <Text className="text-gray-900 font-extrabold text-2xl flex-1">Bookmarks</Text>
         <Text className="text-2xl">🔖</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
           <ActivityIndicator size="large" color="#f97316" />
           <Text className="mt-4 text-gray-500">Loading your saved courses...</Text>
        </View>
      ) : coursesData.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
           <Text className="text-6xl mb-4">📭</Text>
           <Text className="text-xl font-bold text-gray-800 mb-2">List is Empty</Text>
           <Text className="text-center text-gray-500">You haven't saved any courses. Tap the bookmark icon on any course to save it for later!</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <Text className="text-gray-500 font-semibold mb-4 ml-1">{coursesData.length} Saved Items</Text>
          
          {coursesData.map((course, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => router.push({ pathname: "/course/[id]", params: { courseData: JSON.stringify(course), id: course.id } })}
              className="bg-white p-3 rounded-2xl mb-4 border border-gray-100 shadow-sm flex-row items-center"
            >
               <Image 
                 source={{ uri: course.thumbnail }} 
                 className="w-20 h-20 rounded-xl bg-gray-200 mr-4"
                 resizeMode="cover"
               />
               <View className="flex-1 pr-2">
                  <Text className="font-bold text-base text-gray-900" numberOfLines={2}>{course.title}</Text>
                  <Text className="text-gray-500 text-xs mt-1 font-medium">By {course.instructor}</Text>
               </View>
               <TouchableOpacity 
                 onPress={() => removeBookmark(course.id)}
                 className="p-3 bg-red-50 rounded-full ml-1"
               >
                 <Text className="text-red-500 text-lg">🗑️</Text>
               </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <View className="h-10" />
        </ScrollView>
      )}
    </View>
  );
}