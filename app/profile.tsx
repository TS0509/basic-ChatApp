import React, { useState, useEffect } from "react";
import { router } from "expo-router";
import { IconButton, TextInput, Button, List } from "react-native-paper";
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { get, update, ref as dbRef } from "firebase/database";
import * as ImagePicker from 'expo-image-picker';
import { FlashList } from "@shopify/flash-list";

export default function ProfileScreen() {
  const [profileImage, setProfileImage] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [newUsername, setNewUsername] = useState<string>(''); // To store new username input

  useEffect(() => {
    // Fetch current user's profile data when component mounts
    const fetchProfileData = async () => {
      const userId = auth?.currentUser?.uid; // Ensure you're using the correct user ID
      if (userId) {
        const userRef = dbRef(db, `users/${userId}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setProfileImage(userData.profilePicture || ''); // Set the profile image URL if available
          setUsername(userData.username || ''); // Set the current username
        }
      }
    };

    fetchProfileData();
  }, []);

  // Handle the back press to navigate back
  const handleBackPress = () => {
    router.push("/chat");
  };

  // Function to pick an image
  const pickImage = async () => {
    // Ask for permission to access the gallery
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // If the user selected an image, update the profile image state
      setProfileImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  // Function to upload image to Firebase Storage
  const uploadImage = async (uri: string) => {
    try {
      const userId = auth?.currentUser?.uid;
      const fileName = uri.split('/').pop();

      const response = await fetch(uri);
      const blob = await response.blob();
      const storage = getStorage();
      const fileRef = ref(storage, `profile_pictures/${userId}/${fileName}`);

      // Upload the image to Firebase Storage
      await uploadBytes(fileRef, blob);

      // Get the download URL of the uploaded image
      const fileURL = await getDownloadURL(fileRef);
      console.log("Uploaded file URL: ", fileURL);

      // Now update the user's profile picture URL in the database
      updateProfilePictureInDatabase(fileURL);
    } catch (e) {
      console.log("Error uploading image: ", e);
    }
  };

  // Function to update profile picture URL in Firebase Realtime Database
  const updateProfilePictureInDatabase = async (url: string) => {
    try {
      const userId = auth?.currentUser?.uid;
      if (userId) {
        const userRef = dbRef(db, `users/${userId}`);
        await update(userRef, {
          profilePicture: url, // Replace the old profile picture URL with the new one
        });
        console.log("Profile picture URL updated in database");
      }
    } catch (e) {
      console.log("Error updating profile picture in database:", e);
    }
  };

  // Function to update username in the database
  const updateUsernameInDatabase = async () => {
    try {
      const userId = auth?.currentUser?.uid;
      if (userId && newUsername.trim() !== '') {
        const userRef = dbRef(db, `users/${userId}`);
        await update(userRef, {
          username: newUsername, // Update the username in the database
        });
        setUsername(newUsername); // Update the local state
        setNewUsername(''); // Clear the input field
        console.log("Username updated in database");
      } else {
        alert("Please enter a valid username.");
      }
    } catch (e) {
      console.log("Error updating username:", e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          onPress={handleBackPress}
          style={styles.backButton}
        />
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage}>
          <View style={styles.profilePictureContainer}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Text style={styles.profileImageText}>Select Profile Picture</Text>
            )}
          </View>
        </TouchableOpacity>
        <Text style={styles.usernameText}>{username}</Text>

        {/* Editable Username Input */}
        <TextInput
          label="New Username"
          value={newUsername}
          onChangeText={setNewUsername}
          style={styles.usernameInput}
        />
        <Button mode="contained" onPress={updateUsernameInDatabase} style={styles.updateButton}>
          Update Username
        </Button>
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
  backButton: {
    paddingRight: 20,
  },
  headerText: {
    fontSize: 24,
    margin: 10,
    color: "#FFFFFF",
    flex: 1,
    textAlign: "left",
  },
  profileContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 30,
  },
  profilePictureContainer: {
    borderWidth: 2,
    borderColor: "#0000FF",
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  profileImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  profileImageText: {
    color: "#0000FF",
    textAlign: "center",
  },
  usernameText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
  },
  usernameInput: {
    width: '80%',
    marginTop: 20,
  },
  updateButton: {
    marginTop: 20,
  },
});

