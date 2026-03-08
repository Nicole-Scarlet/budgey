import React from 'react';
import { Modal, View, Text, Pressable, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

interface CalendarModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectDate: (date: string) => void;
    currentDate?: string;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ visible, onClose, onSelectDate, currentDate }) => {
    // Parse initial date or use today
    const [tempDate, setTempDate] = React.useState(new Date());

    React.useEffect(() => {
        if (currentDate && currentDate.includes('-')) {
            const parts = currentDate.split(' - ').join('-').split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1;
                const day = parseInt(parts[2]);
                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    setTempDate(new Date(year, month, day));
                }
            }
        }
    }, [visible, currentDate]);

    const onChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            if (event.type === 'set' && selectedDate) {
                const formatted = selectedDate.toISOString().split('T')[0].split('-').join(' - ');
                onSelectDate(formatted);
                onClose();
            } else if (event.type === 'dismissed') {
                onClose();
            }
        } else {
            // iOS maintains selection in temp state
            if (selectedDate) {
                setTempDate(selectedDate);
            }
        }
    };

    const handleConfirmIOS = () => {
        const formatted = tempDate.toISOString().split('T')[0].split('-').join(' - ');
        onSelectDate(formatted);
        onClose();
    };

    if (Platform.OS === 'android' && visible) {
        return (
            <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={onChange}
            />
        );
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.overlay}
                onPress={onClose}
            >
                <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
                    <View className="bg-[#334155] rounded-[30px] p-6 border border-[#90A1B9]/20 shadow-2xl">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-white text-xl font-bold">Select Target Date</Text>
                            <Pressable onPress={onClose}>
                                <Ionicons name="close" size={24} color="#94A3B8" />
                            </Pressable>
                        </View>

                        <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onChange}
                            textColor="white"
                            themeVariant="dark"
                        />

                        {Platform.OS === 'ios' && (
                            <Pressable
                                onPress={handleConfirmIOS}
                                className="mt-6 bg-[#6366F1] py-4 rounded-full items-center justify-center"
                            >
                                <Text className="text-white font-bold text-lg">Confirm Selection</Text>
                            </Pressable>
                        )}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
    }
});

export default CalendarModal;
