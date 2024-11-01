import { View } from "react-native";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { db } from "../firebaseConfig";
import { ref, push, get, update } from "firebase/database";
import { router, useLocalSearchParams } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { useEffect, useState } from "react";


const taskRef = ref(db, "tasks");

const AddScreen = () => {
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<Inputs>();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);


    const params = useLocalSearchParams()
    console.log('params', params)

    const getTaskById = async () => {
        const taskSnapshot = await get(ref(db,`tasks/${params.id}`));
        if (taskSnapshot.exists()) {
            console.log("taskSnapshot.val()", taskSnapshot.val());
            const task = taskSnapshot.val();
            reset(task);
        }
    };

    useEffect(() => {
        getTaskById();
    }, []);

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        setLoading(true);
        const taskUpdateRef = ref(db, `tasks/${params.id}`);
        
        update(taskUpdateRef, data)
            .then(() => {
                setVisible(true);
                router.back(); // Navigate back to the previous page
            })
            .catch((error) => {
                console.error("Error updating data: ", error);
            })
            .finally(() => {
                reset();
                setLoading(false);
            });
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Controller
                name="task"
                defaultValue=""
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <View style={{ marginBottom: 16 }}>
                        <TextInput
                            label="Input"
                            onChangeText={(text) => field.onChange(text)}
                            {...field}
                        />
                        {errors.task && (
                            <Text style={{ color: "red" }}>Cannot Empty</Text>
                        )}
                    </View>
                )}
            />

            <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
            >
                Change
            </Button>
            <Snackbar
                visible={visible}
                duration={4000}
                onDismiss={() => console.log("nothing")}
            >
                Successfully created new task!
            </Snackbar>

        </View>
    );
};

export default AddScreen;
