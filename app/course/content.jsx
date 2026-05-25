import { View, TouchableOpacity, Text } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, router } from "expo-router";

export default function CourseContentScreen() {
  // Course details screen se aane wala data
  const { title, id } = useLocalSearchParams();

  // 1. Local HTML Template (Assignment Requirement)
  const customHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f9fafb; color: #111827; }
        h1 { color: #2563eb; font-size: 24px; margin-bottom: 10px; }
        .badge { background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .video-box { background: #1f2937; height: 200px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .module-list { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <span class="badge">Course ID: ${id || 'N/A'}</span>
      <h1>${title || "Course Content"}</h1>
      
      <div class="video-box">
        <p>▶ Video Player Placeholder</p>
      </div>
      
      <div class="module-list">
        <h3>Module 1: Introduction</h3>
        <p>Welcome to the first lesson. This HTML is loaded from a local template as required.</p>
      </div>
    </body>
    </html>
  `;

  return (
    <View className="flex-1 bg-white">
      {/* Custom App Header */}
      <View className="pt-12 pb-4 px-4 bg-gray-900 flex-row items-center">
         <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-gray-800 rounded-full">
           <Text className="text-white font-bold">← Back</Text>
         </TouchableOpacity>
         <Text className="text-white font-bold text-xl flex-1" numberOfLines={1}>Learning Room</Text>
      </View>
      
      {/* 2. WebView with Native to Web Communication using HEADERS */}
      <WebView 
        source={{ 
          html: customHTML,
          // Yahan hum Native app se Webview ko headers bhej rahe hain
          headers: {
            "Authorization": "Bearer sample-assignment-token",
            "App-Platform": "ReactNative",
           "Course-ID": String(id || "unknown")
          }
        }} 
        className="flex-1"
        originWhitelist={['*']}
      />
    </View>
  );
}