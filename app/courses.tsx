import { View, Text, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Platform, Alert, TextInput } from "react-native";
import { useState, useEffect, memo, useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { LegendList } from "@legendapp/list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";

// Optimized Course Card with Bookmark Icon
const CourseCard = memo(({ item, isBookmarked, toggleBookmark }: { item: any, isBookmarked: boolean, toggleBookmark: (id: string) => void }) => (
  <TouchableOpacity
    onPress={() => router.push({ 
      pathname: "/course/[id]", 
      params: { courseData: JSON.stringify(item), id: item.id } 
    })}
    className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden relative"
  >
    <Image 
      source={{ uri: item.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3" }} 
      className="w-full h-40 bg-gray-200" 
      resizeMode="cover" 
    />
    
    <TouchableOpacity 
      onPress={() => toggleBookmark(item.id)}
      className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md z-10"
    >
      <Text className="text-xl">{isBookmarked ? "🔖" : "📑"}</Text>
    </TouchableOpacity>

    <View className="p-5">
      <Text className="text-xl font-bold text-gray-800 mb-2">{item.title}</Text>
      <Text className="text-gray-500 mb-4" numberOfLines={2}>{item.description}</Text>
      <Text className="text-blue-600 font-semibold">By {item.instructor}</Text>
    </View>
  </TouchableOpacity>
));

export default function CoursesScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null); 
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isConnected, setIsConnected] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookmarksAndProfile();
    }, [])
  );

  const loadBookmarksAndProfile = async () => {
    try {
      // 1. Load Bookmarks (Convert them to strings just to be safe)
      let storedBookmarks = Platform.OS === 'web' ? localStorage.getItem('bookmarkedCourses') : await AsyncStorage.getItem('bookmarkedCourses');
      if (storedBookmarks) {
        const parsedBookmarks = JSON.parse(storedBookmarks);
        // Ensure all loaded IDs are strings
        setBookmarkedIds(parsedBookmarks.map(String));
      }

      // 2. Load Profile Image
      let storedImage = Platform.OS === 'web' ? localStorage.getItem('profileImage') : await AsyncStorage.getItem('profileImage');
      if (storedImage) {
        setProfileImage(storedImage);
      } else {
         setProfileImage(null);
      }
    } catch (e) {
      console.log("Error loading data");
    }
  };

  const handleToggleBookmark = async (id: string) => {
    // Ensure the incoming ID is a string
    const stringId = String(id);
    let updatedList = [...bookmarkedIds];
    
    if (updatedList.includes(stringId)) {
      updatedList = updatedList.filter(bId => bId !== stringId);
    } else {
      updatedList.push(stringId);
      
      if (updatedList.length === 5) {
        if (Platform.OS === 'web') {
          window.alert("📚 Power Learner! You've just bookmarked your 5th course.");
        } else {
          Alert.alert("📚 Power Learner!", "You've just bookmarked your 5th course. Great job curating your learning list!");
        }
      }
    }
    setBookmarkedIds(updatedList);
    if (Platform.OS === 'web') {
      localStorage.setItem('bookmarkedCourses', JSON.stringify(updatedList));
    } else {
      await AsyncStorage.setItem('bookmarkedCourses', JSON.stringify(updatedList));
    }
  };

  // ---------------------------------------------------------
  // Original API Logic (Books API)
  // ---------------------------------------------------------
  const fetchCourses = async (retryCount = 0) => {
    try {
      setErrorMsg(""); 
      
      const response = await axios.get("https://api.freeapi.app/api/v1/public/books", { timeout: 10000 });
      
      const formattedCourses = response.data.data.data.map((book: any) => {
        let imgUrl = book.volumeInfo?.imageLinks?.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3";
        if (imgUrl.startsWith("http://")) {
            imgUrl = imgUrl.replace("http://", "https://");
        }

        return {
          id: String(book.id), // Ensure the ID is always a String
          title: book.volumeInfo?.title || "Modern Development",
          description: book.volumeInfo?.description || "Learn the latest tech stacks.",
          instructor: book.volumeInfo?.authors?.[0] || "House of Edtech",
          thumbnail: imgUrl
        };
      });

      setCourses(formattedCourses);
      setFilteredCourses(formattedCourses);
    } catch (error: any) {
      if (retryCount < 2) {
         fetchCourses(retryCount + 1);
      } else {
         setErrorMsg("Oops! We couldn't load the courses. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course => 
        course.title.toLowerCase().includes(text.toLowerCase()) || 
        course.instructor.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCourses();
    setSearchQuery(""); 
    setRefreshing(false);
  }, []);

  if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#2563eb" /></View>;

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-12">
      {!isConnected && <View className="bg-red-500 p-3 rounded-lg mb-4 absolute top-12 left-4 right-4 z-50"><Text className="text-white text-center font-bold">Offline Mode</Text></View>}
      
      <View className="flex-row justify-between items-center mb-4 mt-4">
        <Text className="text-3xl font-bold text-gray-900">Discover</Text>
        
        <TouchableOpacity 
          onPress={() => router.push("/profile")} 
          className="rounded-full shadow-sm"
        >
          {profileImage ? (
             <Image 
                source={{ uri: profileImage }} 
                className="w-12 h-12 rounded-full border-2 border-blue-500 bg-gray-200"
             />
          ) : (
             <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center border-2 border-blue-200">
                <Text className="text-2xl">👤</Text>
             </View>
          )}
        </TouchableOpacity>
      </View>

      <View className="bg-white px-4 py-3 rounded-xl mb-6 shadow-sm border border-gray-100 flex-row items-center">
         <Text className="text-xl mr-2">🔍</Text>
         <TextInput 
           placeholder="Search courses or instructors..."
           className="flex-1 text-base text-gray-800 outline-none"
           value={searchQuery}
           onChangeText={handleSearch}
         />
      </View>
      
      {errorMsg ? (
        <View className="flex-1 justify-center items-center"><Text className="text-red-500 mb-4">{errorMsg}</Text><TouchableOpacity onPress={() => { setLoading(true); fetchCourses(); }} className="bg-blue-600 p-3 rounded-lg"><Text className="text-white font-bold">Try Again</Text></TouchableOpacity></View>
      ) : (
        <LegendList
          data={filteredCourses}
          keyExtractor={(item: any) => String(item.id)}
          estimatedItemSize={250}
          // The critical check here: we must stringify the ID before checking included
          renderItem={({ item }) => <CourseCard item={item} isBookmarked={bookmarkedIds.includes(String(item.id))} toggleBookmark={handleToggleBookmark} />}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}