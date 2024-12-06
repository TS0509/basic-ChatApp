import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { db } from "../firebaseConfig";
import { ref, onValue, push, get } from "firebase/database";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, TextInput, Text, StyleSheet, Dimensions, Platform, Image } from "react-native";
import { Appbar, Icon, IconButton, Menu } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import React from "react";

// Define the Chat interface with userID and timestamp
interface Chat {
  content: string;
  uid: string;
  timestamp: number;
}

export default function HomeScreen(props: any) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Chat>();
  const router = useRouter();
  const navigation = useNavigation();

  const [menuVisible, setMenuVisible] = React.useState(false);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const [visible, setVisible] = React.useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const [chatList, setChatList] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const flashListRef = useRef<FlashList<Chat>>(null);
  const chatsRef = ref(db, "chats");

  const [isListReady, setIsListReady] = useState(false); // Flag to track if the list is mounted
  const [usersData, setUsersData] = useState<any>({}); // Store user data (username, profile picture)

  const currentUser = auth.currentUser; // Get the current user from Firebase Auth
  const uid = currentUser?.uid; // Get the UID from the current user
  const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';

  const onSubmit = async (data: Chat) => {
    setLoading(true);
    try {
      // Push the message along with the UID and timestamp
      await push(chatsRef, { ...data, uid, timestamp: Date.now() });
      console.log("Message sent:", data.content);
      reset(); // Clear the input after sending
    } catch (error) {
      console.error("Error sending message: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data (e.g., username, profile picture)
  const fetchUsersData = async () => {
    const usersRef = ref(db, "users"); // Assuming your users are stored in "users" node
    try {
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        setUsersData(usersData); // Populate usersData state with user data
      } else {
        console.log("No users data found");
      }
    } catch (error) {
      console.error("Error fetching users data: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const chatData: Chat[] = Object.values(data)
          .map((item: any) => ({
            content: item.content,
            uid: item.uid,
            timestamp: item.timestamp,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setChatList(chatData || []);

        fetchUsersData(); // Fetch users data when chats are loaded
      } else {
        console.log("No data available.");
        setChatList([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useLayoutEffect(() => {
    if (isListReady && flashListRef?.current) {
      setTimeout(() => {
        flashListRef?.current?.scrollToEnd({ animated: true });
      },1000);
    }
  }, [chatList, isListReady]);

  const onListLayout = () => {
    if (!isListReady) {
      setIsListReady(true); // Set flag to true after list is mounted and measured
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully.");
      // Optionally navigate to the login screen
      router.push("/"); // Navigate to login screen after logout
    } catch (error) {
      console.error("Error logging out: ", error);
    }
  };

  // Handle the back button press
  const handleBackPress = () => {
    logout(); // Logout before going back
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Back Button with Logout */}
        <IconButton
          icon="arrow-left"
          iconColor="white"
          onPress={handleBackPress} // Trigger the logout on back button press
          style={styles.backButton}
        />
        <Text style={styles.headerText}>WhatsChat</Text>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={<Appbar.Action icon="cog" onPress={openMenu} color="white" />}>
          <Menu.Item onPress={() => { router.push("/profile"); closeMenu(); }} leadingIcon="cog" title="Profile" />
          <Menu.Item onPress={showDialog} leadingIcon="book" title="About" />
        </Menu>
      </View>

      <FlashList
        ref={flashListRef}
        data={chatList}
        estimatedItemSize={56}
        renderItem={({ item }) => {
          const user = usersData[item?.uid]; // Get user data based on the uid
          return (
            <><View>
              {/* Display the profile picture */}
              {user && (
                <Image
                  source={{
                    uri: user?.profilePicture || 'https://firebasestorage.googleapis.com/v0/b/chatapp-a68fe.firebasestorage.app/o/profile_pictures%2F1QIy8FuQAihHkYZ8AqsCnUsWEXt2%2F76f0ef32-4331-4d13-b167-811853cad689.png?alt=media&token=8f60af5e-2185-44ba-88bc-3967ed990e3f', // Fallback to default image URL
                  }}
                  style={[
                    styles.profilePicture,
                    item?.uid === uid ? styles.selfProfile : styles.otherProfile,
                  ]} />
              )}
            </View><View
              style={[
                styles.chatItem,
                item?.uid === uid ? styles.selfChat : styles.otherChat,
              ]}
            >

                {/* Username */}
                <Text
                  style={[
                    item?.uid === uid ? styles.selfusername : styles.otherusername,
                  ]}
                >
                  {user?.username || 'please go to profile insert image and name'}
                </Text>

                {/* Chat message */}
                <Text style={styles.chatText}>
                  {item?.content || 'No message content'}
                </Text>
              </View></>

          );
        }}

        ListEmptyComponent={
          <View style={{ marginTop: 20 }}>
            <Text style={{ color: "gray", margin: 10 }}>
              There are no messages to show...
            </Text>
          </View>
        }
        onLayout={onListLayout} // Confirm the list is mounted and ready
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
        {errors.content && (
          <Text style={styles.error}>{errors.content.message}</Text>
        )}

        <IconButton
          icon="send"
          size={30}
          iconColor="white"
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
    justifyContent: "space-between",
  },
  header: {
    height: 60,
    width: Dimensions.get("screen").width,
    backgroundColor: "#0000FF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    position: "relative",
  },

  headerText: {
    fontSize: 24,
    margin: 10,
    color: "#FFFFFF",
    flex: 1,
    textAlign: "left",
  },

  backButton: {
    paddingRight: 20,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
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
  },
  selfChat: {
    backgroundColor: "#c6ffbf",
    alignSelf: "flex-end",
  },
  otherChat: {
    backgroundColor: "#c6ffbf",
    alignSelf: "flex-start",
  },
  userInfo: {
    flexDirection: "row",

    alignItems: "center",
    marginBottom: 5,
  },
  profilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  selfusername: {
    fontWeight: "bold",
    textAlign: "right",
  },
  otherusername: {
    fontWeight: "bold",
    textAlign: "left",
  },
  chatText: {
    fontSize: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
  },
  selfProfile: {
    marginRight: 10,
    alignSelf: "flex-end",
  },
  
  otherProfile: {
    marginLeft: 10,
    alignSelf: "flex-start",
  },
});
