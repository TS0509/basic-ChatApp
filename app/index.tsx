import _ from "lodash";
import Checkbox from "expo-checkbox";
import { View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Icon, List, shadow, Text } from "react-native-paper";
import { FlashList } from "@shopify/flash-list";
import { db } from "../firebaseConfig";
import { useEffect, useState } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { Link, useRouter } from "expo-router";
import ListIcon from "react-native-paper/lib/typescript/components/List/ListIcon";

interface Task {
  id: string;
  task: string;
  completed: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [doneTaskList, setDoneTaskList] = useState<Task[]>([]);
  const tasksRef = ref(db, "tasks");

  useEffect(() => {
    onValue(tasksRef, (snapshot) => {
      const data = _.pickBy(snapshot.val(), (task) => !task.completed);
      const doneData = _.pickBy(snapshot.val(), (task) => task.completed);
      setTaskList(_.map(data, (value, key) => ({ ...value, id: key })));
      setDoneTaskList(_.map(doneData, (value, key) => ({ ...value, id: key })));
    });
  }, []);

  const handleCheckboxChange = (taskId: string, newValue: boolean) => {
    const taskRef = ref(db, `tasks/${taskId}`);
    setTaskList((prevTaskList) =>
      prevTaskList.map((task) =>
        task.id === taskId ? { ...task, completed: newValue } : task
      )
    );
    setTimeout(() => {
      update(taskRef, { completed: newValue });
    }, 500);
  };

  const handleDeleteTask = (taskId: string) => {
    const taskRef = ref(db, `tasks/${taskId}`);
    remove(taskRef);
    setTaskList((prevTaskList) =>
      prevTaskList.filter((task) => task.id !== taskId)
    );
    setDoneTaskList((prevDoneTaskList) =>
      prevDoneTaskList.filter((task) => task.id !== taskId)
    );
  };

  return (
    <SafeAreaView>
      <View style={{ margin: 10, alignItems: "flex-end" }}>
        <Link href="/add">
          <Button mode="contained" icon="plus">
            Task
          </Button>
        </Link>
      </View>
      <View
        style={{
          margin: 8,
          height: Dimensions.get("screen").height * 0.4,
          width: Dimensions.get("screen").width,
        }}
      >
        <Text variant="titleLarge">TODO</Text>
        <FlashList
          data={taskList}
          ListEmptyComponent={
            <View style={{ marginTop: 20 }}>
              <Text variant="bodyLarge" style={{ color: "gray" }}>
                There are no tasks to show...
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <List.Item
              title={item.task}
              onPress={() => handleCheckboxChange(item.id, !item.completed)}
              left={(props) => (
                <Checkbox
                  style={{ margin: 5 }}
                  value={item.completed}
                  onValueChange={(newValue) =>
                    handleCheckboxChange(item.id, newValue)
                  }
                />
              )}
              right={(props) => (
                <Button
                  style={{ margin: 5, height: 5 }}
                  onPress={() => handleDeleteTask(item.id)}
                  icon="delete" children={undefined} />
              )}
            />
          )}
          estimatedItemSize={200}
        />
      </View>
      <View
        style={{
          margin: 8,
          marginTop: 20,
          height: Dimensions.get("screen").height * 0.4,
          width: Dimensions.get("screen").width,
        }}
      >
        <Text variant="titleLarge">Done Tasks</Text>
        <FlashList
          data={doneTaskList}
          ListEmptyComponent={
            <View style={{ marginTop: 20 }}>
              <Text variant="bodyLarge" style={{ color: "gray" }}>
                There are no tasks to show...
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <List.Item
              title={item.task}
              onPress={() =>
                router.navigate({ pathname: "/edit", params: { id: item.id } })
              }
              left={(props) => (
                <Checkbox
                  onChange={() =>
                    handleCheckboxChange(item.id, !item.completed)
                  }
                  style={{ margin: 5 }}
                  value={item.completed}
                  onValueChange={(newValue) =>
                    handleCheckboxChange(item.id, newValue)
                  }
                />
              )}
            />
          )}
          estimatedItemSize={200}
        />
      </View>
    </SafeAreaView>
  );
}