import React from 'react';
import { View, Text } from 'react-native';

export default function CustomDesign() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Reverted</Text>
        </View>
    );
}
