import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { db } from "../firebaseConfig";
import { ref, onValue, push } from "firebase/database";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView, View, TextInput, Text, StyleSheet, Dimensions } from "react-native";
import { IconButton } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { useRoute } from "@react-navigation/native";

// Define the Chat interface with username and timestamp
interface Chat {
  content: string;
  username: string;
  timestamp: number;
}

export default function HomeScreen() {
  const { control, handleSubmit, reset, formState: { errors } } = useForm<Chat>();
  const router = useRouter();
  const route = useRoute();  // Use `useRoute` to access the route parameters

  const [chatList, setChatList] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const flashListRef = useRef<FlashList<Chat>>(null);
  const chatsRef = ref(db, 'chats');
  
  // Access username from route params
  const { username } = route.params as { username: string };  // Cast route params to get 'username'

  const onSubmit = async (data: Chat) => {
    setLoading(true);
    try {
      // Push the message along with the username and timestamp
      await push(chatsRef, { ...data, username, timestamp: Date.now() });
      console.log("Message sent:", data.content);
      reset(); // Clear the input after sending
    } catch (error) {
      console.error("Error sending message: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      // Cast to Chat[] to ensure the data is properly typed
      const chatData: Chat[] = data ? Object.values(data).sort((a, b) => a.timestamp - b.timestamp) : [];
      setChatList(chatData);
      if (flashListRef.current) {
        flashListRef.current.scrollToEnd({ animated: true });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>WhatsChat</Text>
      </View>

      <FlashList 
        ref={flashListRef}
        data={chatList}
        estimatedItemSize={56}
        renderItem={({ item }) => (
          <View 
            style={[
              styles.chatItem, 
              item.username === username ? styles.selfChat : styles.otherChat
            ]}
          >
            {/* Display the username if it's not the current user */}
            {item.username !== username && (
              <Text style={styles.username}>{item.username}</Text>
            )}
            <Text style={styles.chatText}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: "gray", margin: 10 }}>There are no messages to show...</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <Controller
          name="content"
          control={control}
          rules={{ required: "Message is required" }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.content && <Text style={styles.error}>{errors.content.message}</Text>}

        <IconButton
          icon="send"
          size={30}
          onPress={handleSubmit(onSubmit)} 
          disabled={loading} 
          style={styles.sendButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    height: 60,
    width: Dimensions.get("screen").width,
    backgroundColor: "#0000FF",
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    margin: 10,
    color: "#FFFFFF",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#0f7eff",
  },
  chatItem: {
    padding: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 15,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  selfChat: {
    backgroundColor: "#d1f7d1", 
    alignSelf: "flex-start",  
  },
  otherChat: {
    backgroundColor: "#e1ffc7", 
    alignSelf: "flex-end", 
  },
  username: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    fontSize: 14,
    marginTop: 5,
    backgroundColor: "transparent", 
    borderRadius: 0, 
  },
  chatText: {
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
  },
});
