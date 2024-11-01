import _ from "lodash";
import * as Font from 'expo-font';
import Checkbox from "expo-checkbox";
import { View, TextInput, Button, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, IconButton, MD3Colors } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { db } from "../firebaseConfig";
import { useEffect, useState,useRef } from "react";
import { ref, onValue, push } from "firebase/database";
import { useRouter } from "expo-router";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

interface Chat {
  id: string;
  content: string;
}

export default function HomeScreen() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Chat>();

  const router = useRouter();
  const [chatList, setChatList] = useState<Chat[]>([]);
  const chatsRef = ref(db, 'chats');
  const [loading, setLoading] = useState(false);
  const flashListRef = useRef<FlashList<Chat>>(null);
  

  const onSubmit: SubmitHandler<Chat> = async (data) => {
    setLoading(true);
    try {
      await push(chatsRef, data);
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
      const chatData = data ? Object.values(data) : []; 
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
          <View style={styles.chatItem}>
            <Text style={styles.chatText}>{item.content}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: "gray", margin:10``}}>
              There are no messages to show...
            </Text>
          </View>
        }
      />
      <View style={styles.inputContainer}>
        <Controller
          name="content"
          control={control}
          rules={{ required: "Message is required" }} // Add validation rule
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
        {errors.content && (
          <Text style={{ color: "red" }}>{errors.content.message}</Text>
        )}
        <IconButton
          icon="send"
          iconColor="#000000"
          size={30}
          onPress={handleSubmit(onSubmit)} // Use handleSubmit here
          disabled={loading} // Disable button while loading
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
  chatItem:{
    padding:10,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 15,
    backgroundColor: '#e1ffc7',
    alignSelf: "flex-start",
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: {width: 0, height:1},
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,

  },
  chatText:{
    fontSize: 23,
  }
});