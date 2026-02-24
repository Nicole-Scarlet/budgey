import { Pressable, Text } from "react-native";

export default function JedrickButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable onPress={onPress} className=" h-1/3 w-full px-5 py-2 rounded-full bg-blue-500 active:bg-blue-600 items-center justify-center">
            <Text className="text-white text-center text-3xl">Jedrick</Text>
        </Pressable>
    )
}