import { useState } from "react";
import { Text, View } from "react-native";
import JedrickButton from "../../components/jedrickButton";

export default function HomeScreen() {


  const [count, setCount] = useState(0);
  return (
    <View className="bg-blue-100 rounded-full p-4 items-center justify-center">
      <Text className="text-3xl font-inter-bold text-center"> Jedrick Pogi
      </Text>
      <Text className="text-2xl font-inter-bold text-center"> Pogi: {count}</Text>
      <JedrickButton onPress={() => setCount(count + 1)} />
    </View>

  );
}
